import { cn } from '../../lib/utils';

const Separator = ({ className, orientation = 'horizontal', ...props }) => (
  <div
    role="separator"
    className={cn(
      'shrink-0 bg-[#E8E6E0]',
      orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      className
    )}
    {...props}
  />
);

export { Separator };
