import { cn } from '../../lib/utils';
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:   'bg-[#1A1A1A] text-white hover:bg-[#2D2D2D] shadow-sm',
        primary:   'bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-sm',
        outline:   'border border-[#E8E6E0] bg-white text-[#1A1A1A] hover:bg-[#F3F2EF]',
        ghost:     'text-[#6B7280] hover:bg-[#F3F2EF] hover:text-[#1A1A1A]',
        danger:    'bg-red-600 text-white hover:bg-red-700 shadow-sm',
        secondary: 'bg-[#F3F2EF] text-[#1A1A1A] hover:bg-[#E8E6E0]',
      },
      size: {
        sm:   'h-7 px-2.5 text-xs',
        md:   'h-8 px-3.5',
        lg:   'h-9 px-4',
        icon: 'h-7 w-7 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
);

const Button = ({ className, variant, size, children, ...props }) => (
  <button className={cn(buttonVariants({ variant, size }), className)} {...props}>
    {children}
  </button>
);

export { Button, buttonVariants };
