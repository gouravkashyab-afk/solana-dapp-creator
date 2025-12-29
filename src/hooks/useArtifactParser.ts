import { useState, useCallback, useRef } from 'react';

export interface ParsedFile {
  path: string;
  content: string;
  isComplete: boolean;
}

export interface ParsedArtifact {
  id: string;
  title: string;
  files: Map<string, ParsedFile>;
  shellCommands: string[];
  isComplete: boolean;
  currentFile: string | null;
}

interface ParserState {
  buffer: string;
  artifact: ParsedArtifact | null;
  currentActionType: 'file' | 'shell' | null;
  currentFilePath: string | null;
  currentContent: string;
  inArtifact: boolean;
}

const initialState: ParserState = {
  buffer: '',
  artifact: null,
  currentActionType: null,
  currentFilePath: null,
  currentContent: '',
  inArtifact: false,
};

export const useArtifactParser = () => {
  const [artifact, setArtifact] = useState<ParsedArtifact | null>(null);
  const stateRef = useRef<ParserState>({ ...initialState });

  const reset = useCallback(() => {
    stateRef.current = { ...initialState };
    setArtifact(null);
  }, []);

  const parseChunk = useCallback((chunk: string) => {
    const state = stateRef.current;
    state.buffer += chunk;

    // Check for artifact start
    if (!state.inArtifact) {
      const artifactMatch = state.buffer.match(/<boltArtifact\s+id="([^"]+)"\s+title="([^"]+)"[^>]*>/);
      if (artifactMatch) {
        state.inArtifact = true;
        state.artifact = {
          id: artifactMatch[1],
          title: artifactMatch[2],
          files: new Map(),
          shellCommands: [],
          isComplete: false,
          currentFile: null,
        };
        // Remove the matched tag from buffer
        state.buffer = state.buffer.slice(state.buffer.indexOf(artifactMatch[0]) + artifactMatch[0].length);
        setArtifact({ ...state.artifact });
      }
    }

    if (!state.inArtifact || !state.artifact) return;

    // Process buffer for actions
    let processing = true;
    while (processing) {
      processing = false;

      // If we're currently in an action, look for content and closing tag
      if (state.currentActionType) {
        const closeTagIndex = state.buffer.indexOf('</boltAction>');
        
        if (closeTagIndex !== -1) {
          // Action complete
          const content = state.buffer.slice(0, closeTagIndex);
          state.currentContent += content;
          
          if (state.currentActionType === 'file' && state.currentFilePath) {
            state.artifact.files.set(state.currentFilePath, {
              path: state.currentFilePath,
              content: state.currentContent.trim(),
              isComplete: true,
            });
            state.artifact.currentFile = null;
          } else if (state.currentActionType === 'shell') {
            const cmd = state.currentContent.trim();
            if (cmd && !state.artifact.shellCommands.includes(cmd)) {
              state.artifact.shellCommands.push(cmd);
            }
          }
          
          // Reset action state
          state.buffer = state.buffer.slice(closeTagIndex + '</boltAction>'.length);
          state.currentActionType = null;
          state.currentFilePath = null;
          state.currentContent = '';
          processing = true;
          setArtifact({ ...state.artifact, files: new Map(state.artifact.files) });
        } else {
          // Still streaming content
          state.currentContent += state.buffer;
          state.buffer = '';
          
          // Update file content while streaming
          if (state.currentActionType === 'file' && state.currentFilePath) {
            state.artifact.files.set(state.currentFilePath, {
              path: state.currentFilePath,
              content: state.currentContent.trim(),
              isComplete: false,
            });
            state.artifact.currentFile = state.currentFilePath;
            setArtifact({ ...state.artifact, files: new Map(state.artifact.files) });
          }
        }
      } else {
        // Look for new action start
        const fileMatch = state.buffer.match(/<boltAction\s+type="file"\s+filePath="([^"]+)"[^>]*>/);
        const shellMatch = state.buffer.match(/<boltAction\s+type="shell"[^>]*>/);
        
        if (fileMatch && (!shellMatch || state.buffer.indexOf(fileMatch[0]) < state.buffer.indexOf(shellMatch[0]))) {
          state.currentActionType = 'file';
          state.currentFilePath = fileMatch[1];
          state.currentContent = '';
          state.buffer = state.buffer.slice(state.buffer.indexOf(fileMatch[0]) + fileMatch[0].length);
          state.artifact.currentFile = state.currentFilePath;
          
          // Create empty file entry immediately
          state.artifact.files.set(state.currentFilePath, {
            path: state.currentFilePath,
            content: '',
            isComplete: false,
          });
          setArtifact({ ...state.artifact, files: new Map(state.artifact.files) });
          processing = true;
        } else if (shellMatch) {
          state.currentActionType = 'shell';
          state.currentFilePath = null;
          state.currentContent = '';
          state.buffer = state.buffer.slice(state.buffer.indexOf(shellMatch[0]) + shellMatch[0].length);
          processing = true;
        }
      }
    }

    // Check for artifact end
    if (state.buffer.includes('</boltArtifact>')) {
      state.artifact.isComplete = true;
      state.inArtifact = false;
      setArtifact({ ...state.artifact, files: new Map(state.artifact.files) });
    }
  }, []);

  const parseFullContent = useCallback((content: string) => {
    reset();
    parseChunk(content);
  }, [reset, parseChunk]);

  return {
    artifact,
    parseChunk,
    parseFullContent,
    reset,
  };
};
