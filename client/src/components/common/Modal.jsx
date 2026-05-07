import { X } from 'lucide-react';

const Modal = ({ title, onClose, children, size = 'md' }) => {
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className={`bg-white rounded-2xl w-full ${widths[size]} flex flex-col max-h-[90vh]`}
        style={{ border: '1px solid #E8E6E0', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E6E0] flex-shrink-0">
          <h2 className="text-[15px] font-semibold text-[#1A1A1A]">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:bg-[#F3F2EF] hover:text-[#374151] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
