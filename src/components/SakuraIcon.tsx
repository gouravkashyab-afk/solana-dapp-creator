import { cn } from '@/lib/utils';

interface SakuraIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

const SakuraIcon = ({ className, size = 'md', glow = false }: SakuraIconProps) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <span
      className={cn(
        sizeClasses[size],
        glow && 'animate-pulse drop-shadow-[0_0_10px_hsl(var(--accent)/0.5)]',
        className
      )}
    >
      🌸
    </span>
  );
};

export default SakuraIcon;
