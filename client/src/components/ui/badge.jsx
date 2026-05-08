import { cn } from '../../lib/utils';
import { cva } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors',
  {
    variants: {
      variant: {
        default:    'bg-gray-100 text-gray-700 ring-gray-200',
        primary:    'bg-indigo-50 text-indigo-700 ring-indigo-200',
        delayed:    'bg-red-50 text-red-700 ring-red-200',
        blocked:    'bg-orange-50 text-orange-700 ring-orange-200',
        in_progress:'bg-yellow-50 text-yellow-700 ring-yellow-200',
        completed:  'bg-green-50 text-green-700 ring-green-200',
        on_track:    'bg-green-50 text-green-700 ring-green-200',
        at_risk:     'bg-red-50 text-red-700 ring-red-200',
        closed:      'bg-blue-50 text-blue-700 ring-blue-200',
        not_started: 'bg-gray-100 text-gray-600 ring-gray-200',
        ongoing:     'bg-indigo-50 text-indigo-700 ring-indigo-200',
        suspended:   'bg-orange-50 text-orange-700 ring-orange-200',
        outline:          'bg-transparent text-gray-600 ring-gray-300',
        priority_low:     'bg-blue-50 text-blue-700 ring-blue-200',
        priority_medium:  'bg-yellow-50 text-yellow-700 ring-yellow-200',
        priority_high:    'bg-orange-50 text-orange-700 ring-orange-200',
        priority_critical:'bg-red-100 text-red-700 ring-red-300',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

const Badge = ({ className, variant, children, ...props }) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props}>
    {children}
  </span>
);

export { Badge, badgeVariants };
