const Spinner = ({ text = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <div
      className="w-7 h-7 rounded-full animate-spin"
      style={{ border: '2.5px solid #E8E6E0', borderTopColor: '#4F46E5' }}
    />
    {text && <p className="text-[13px] text-[#9CA3AF]">{text}</p>}
  </div>
);

export default Spinner;
