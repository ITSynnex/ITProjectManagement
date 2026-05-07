import { cn } from '../../lib/utils';

const Input = ({ className, ...props }) => (
  <input
    className={cn(
      'flex h-8 w-full rounded-md border border-[#E8E6E0] bg-white px-3 py-1 text-sm text-[#1A1A1A] placeholder-[#9CA3AF]',
      'focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-0 focus:border-transparent',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      className
    )}
    {...props}
  />
);

export { Input };
