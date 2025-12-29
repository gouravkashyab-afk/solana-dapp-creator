import { useMemo } from 'react';
import { AIChatMessage } from './useAIChat';

export interface ExtractedCode {
  language: string;
  code: string;
  fileName?: string;
}

export const useCodeExtractor = (messages: AIChatMessage[]) => {
  const extractedCode = useMemo(() => {
    const codeBlocks: ExtractedCode[] = [];
    
    // Process messages in order to get the latest code
    messages.forEach((message) => {
      if (message.role === 'assistant') {
        // Match code blocks with optional language and filename
        const codeBlockRegex = /```(\w+)?(?:\s+(\S+))?\n([\s\S]*?)```/g;
        let match;
        
        while ((match = codeBlockRegex.exec(message.content)) !== null) {
          const language = match[1] || 'text';
          const fileName = match[2];
          const code = match[3].trim();
          
          if (code) {
            codeBlocks.push({ language, code, fileName });
          }
        }
      }
    });
    
    return codeBlocks;
  }, [messages]);

  // Get the latest HTML/JSX/TSX code for preview
  const previewCode = useMemo(() => {
    // Look for HTML, JSX, or TSX code blocks (prioritize the latest)
    const previewableBlocks = extractedCode.filter(
      (block) => 
        ['html', 'jsx', 'tsx', 'javascript', 'js', 'typescript', 'ts', 'react'].includes(block.language.toLowerCase())
    );
    
    if (previewableBlocks.length === 0) return null;
    
    // Return the last (most recent) previewable code block
    return previewableBlocks[previewableBlocks.length - 1];
  }, [extractedCode]);

  // Generate HTML for iframe preview
  const previewHtml = useMemo(() => {
    if (!previewCode) return null;
    
    const { code, language } = previewCode;
    
    // If it's already HTML, use it directly
    if (language.toLowerCase() === 'html') {
      return code;
    }
    
    // For React/JSX code, wrap it in a basic HTML template
    // This is a simplified preview - real implementation would need a bundler
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${code}
    
    // Try to render App or default export
    const root = ReactDOM.createRoot(document.getElementById('root'));
    if (typeof App !== 'undefined') {
      root.render(<App />);
    } else if (typeof Component !== 'undefined') {
      root.render(<Component />);
    } else {
      root.render(<div style={{padding: '20px', color: '#888'}}>No App component found in code</div>);
    }
  </script>
</body>
</html>`;
  }, [previewCode]);

  return {
    extractedCode,
    previewCode,
    previewHtml,
    hasCode: extractedCode.length > 0,
  };
};
