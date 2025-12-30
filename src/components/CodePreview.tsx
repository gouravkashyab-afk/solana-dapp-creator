import { useEffect, useMemo, useRef } from 'react';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { transform } from 'sucrase';
import { cn } from '@/lib/utils';

interface CodePreviewProps {
  /**
   * NOTE: This prop name is legacy.
   * We pass the generated App.tsx source here (not HTML).
   */
  html: string;
  deviceMode: 'desktop' | 'tablet' | 'mobile';
}

function preprocessAppSource(source: string) {
  return source
    // Strip all import statements (single-line and multi-line)
    .replace(/import\s+[\s\S]*?from\s*['"][^'"]*['"];?/g, '')
    .replace(/import\s*['"][^'"]*['"];?/g, '')
    // Strip named exports
    .replace(/export\s*\{[^}]*\};?/g, '')
    // Convert "export default function Name" to "function App"
    .replace(/export\s+default\s+function\s+\w+/g, 'function App')
    // Convert "export default () =>" or "export default Name" to "const App ="
    .replace(/export\s+default\s+/g, 'const App = ')
    // Remove standalone "export default ComponentName;" at end
    .replace(/^const App = \w+;?\s*$/gm, '');
}

const CodePreview = ({ html: appSource, deviceMode }: CodePreviewProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const runtimeRootRef = useRef<Root | null>(null);

  const compilation = useMemo(() => {
    const processed = preprocessAppSource(appSource ?? '');

    try {
      const js = transform(processed, {
        transforms: ['typescript', 'jsx'],
      }).code;
      return { js, error: null as string | null };
    } catch (e) {
      return {
        js: null as string | null,
        error: e instanceof Error ? e.message : 'Failed to compile preview source',
      };
    }
  }, [appSource]);

  useEffect(() => {
    if (!mountRef.current) return;

    if (!runtimeRootRef.current) {
      runtimeRootRef.current = createRoot(mountRef.current);
    }

    // Always render *something* so the user never sees a blank preview.
    if (!appSource?.trim()) {
      runtimeRootRef.current.render(
        <div className="min-h-full p-6 text-sm text-muted-foreground">
          No <code>App.tsx</code> content yet.
        </div>
      );
      return;
    }

    if (compilation.error || !compilation.js) {
      runtimeRootRef.current.render(
        <div className="min-h-full p-6 text-sm text-destructive">
          Preview compile error: {compilation.error}
        </div>
      );
      return;
    }

    try {
      const factory = new Function(
        'React',
        `"use strict";
         const { useState, useEffect, useRef, useCallback, useMemo } = React;

         // Minimal icon stubs (common in Sakura outputs)
         const Plus = (props) => React.createElement('span', props, '+');
         const Minus = (props) => React.createElement('span', props, '−');

         ${compilation.js}

         return typeof App !== 'undefined' ? App : null;`
      );

      const AppComponent = factory(React);

      if (!AppComponent) {
        runtimeRootRef.current.render(
          <div className="min-h-full p-6 text-sm text-muted-foreground">
            No <code>App</code> component found.
          </div>
        );
        return;
      }

      runtimeRootRef.current.render(React.createElement(AppComponent));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown runtime error';
      runtimeRootRef.current.render(
        <div className="min-h-full p-6 text-sm text-destructive">
          Preview runtime error: {message}
        </div>
      );
    }
  }, [appSource, compilation.error, compilation.js]);

  useEffect(() => {
    return () => {
      runtimeRootRef.current?.unmount();
      runtimeRootRef.current = null;
    };
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div
        className={cn(
          'bg-card border border-border rounded-lg shadow-xl transition-all duration-300 overflow-hidden',
          deviceMode === 'desktop' && 'w-full h-full',
          deviceMode === 'tablet' && 'w-[768px] h-[1024px] max-h-full',
          deviceMode === 'mobile' && 'w-[375px] h-[667px]'
        )}
      >
        <div className="w-full h-full bg-background">
          <div ref={mountRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default CodePreview;
