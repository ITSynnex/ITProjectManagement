import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

const ConfirmDialog = ({ message, onConfirm, onCancel, confirmLabel = 'Delete' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
    <div className="bg-white rounded-2xl w-full max-w-sm p-6"
      style={{ border: '1px solid #E8E6E0', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}
    >
      <div className="flex items-start gap-4 mb-5">
        <div className="w-9 h-9 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="font-semibold text-[#1A1A1A] mb-1">Are you sure?</h3>
          <p className="text-[13px] text-[#6B7280]">{message}</p>
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" size="sm" onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </div>
  </div>
);

export default ConfirmDialog;
