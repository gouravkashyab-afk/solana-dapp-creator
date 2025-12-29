import { useState, useCallback } from 'react';

export interface VirtualFile {
  path: string;
  content: string;
  isComplete: boolean;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
}

export interface VirtualFSState {
  files: Map<string, VirtualFile>;
  dependencies: Set<string>;
  activeFile: string | null;
  projectTitle: string;
}

export const useVirtualFileSystem = () => {
  const [state, setState] = useState<VirtualFSState>({
    files: new Map(),
    dependencies: new Set(),
    activeFile: null,
    projectTitle: '',
  });

  const setProjectTitle = useCallback((title: string) => {
    setState(prev => ({ ...prev, projectTitle: title }));
  }, []);

  const addFile = useCallback((path: string, content: string, isComplete: boolean = true) => {
    setState(prev => {
      const newFiles = new Map(prev.files);
      newFiles.set(path, { path, content, isComplete });
      return { ...prev, files: newFiles, activeFile: path };
    });
  }, []);

  const updateFileContent = useCallback((path: string, content: string, isComplete: boolean = false) => {
    setState(prev => {
      const newFiles = new Map(prev.files);
      const existing = newFiles.get(path);
      newFiles.set(path, { 
        path, 
        content, 
        isComplete: isComplete || (existing?.isComplete ?? false) 
      });
      return { ...prev, files: newFiles };
    });
  }, []);

  const setActiveFile = useCallback((path: string | null) => {
    setState(prev => ({ ...prev, activeFile: path }));
  }, []);

  const addDependency = useCallback((packageName: string) => {
    setState(prev => {
      const newDeps = new Set(prev.dependencies);
      // Extract package name from npm install command
      const match = packageName.match(/npm\s+install\s+(.+)/);
      if (match) {
        const packages = match[1].split(/\s+/).filter(p => !p.startsWith('-'));
        packages.forEach(p => newDeps.add(p));
      }
      return { ...prev, dependencies: newDeps };
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      files: new Map(),
      dependencies: new Set(),
      activeFile: null,
      projectTitle: '',
    });
  }, []);

  const getFileTree = useCallback((): FileTreeNode[] => {
    const root: FileTreeNode[] = [];
    const folderMap = new Map<string, FileTreeNode>();

    // Sort files by path for consistent ordering
    const sortedPaths = Array.from(state.files.keys()).sort();

    for (const filePath of sortedPaths) {
      const parts = filePath.split('/');
      let currentLevel = root;
      let currentPath = '';

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isFile = i === parts.length - 1;

        if (isFile) {
          currentLevel.push({
            name: part,
            path: filePath,
            type: 'file',
          });
        } else {
          let folder = folderMap.get(currentPath);
          if (!folder) {
            folder = {
              name: part,
              path: currentPath,
              type: 'folder',
              children: [],
            };
            folderMap.set(currentPath, folder);
            currentLevel.push(folder);
          }
          currentLevel = folder.children!;
        }
      }
    }

    return root;
  }, [state.files]);

  const getAllFiles = useCallback((): VirtualFile[] => {
    return Array.from(state.files.values());
  }, [state.files]);

  const getFile = useCallback((path: string): VirtualFile | undefined => {
    return state.files.get(path);
  }, [state.files]);

  return {
    ...state,
    setProjectTitle,
    addFile,
    updateFileContent,
    setActiveFile,
    addDependency,
    reset,
    getFileTree,
    getAllFiles,
    getFile,
  };
};
