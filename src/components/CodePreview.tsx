import { cn } from '@/lib/utils';

interface CodePreviewProps {
  html: string;
  deviceMode: 'desktop' | 'tablet' | 'mobile';
}

const CodePreview = ({ html, deviceMode }: CodePreviewProps) => {
  const srcDoc = html;

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
        <iframe
          srcDoc={srcDoc}
          className="w-full h-full border-0"
          title="Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};

export default CodePreview;
