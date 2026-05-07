import { cn } from '../../lib/utils';

const Card        = ({ className, ...p }) => <div className={cn('rounded-xl bg-white border border-[#E8E6E0]', className)} {...p} />;
const CardHeader  = ({ className, ...p }) => <div className={cn('flex items-start justify-between p-5 pb-3', className)} {...p} />;
const CardContent = ({ className, ...p }) => <div className={cn('px-5 pb-5', className)} {...p} />;
const CardTitle   = ({ className, ...p }) => <h3 className={cn('text-sm font-medium text-[#6B7280]', className)} {...p} />;
const CardValue   = ({ className, ...p }) => <p className={cn('text-3xl font-semibold text-[#1A1A1A] mt-1', className)} {...p} />;

export { Card, CardHeader, CardContent, CardTitle, CardValue };
