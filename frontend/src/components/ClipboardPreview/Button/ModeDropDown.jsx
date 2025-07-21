import { useRequestTypeStore } from '../../../store/useRequestTypeStore';
export const ModeSelect = ({ setShowClipboard, setShowDropZone }) => {
  const setSelectedMode = useRequestTypeStore(state => state.setSelectedMode);

  const handleChange = e => {
    const mode = e.target.value;
    setSelectedMode(mode);

    if (mode === 'clipboard') {
      setShowClipboard(true);
      setShowDropZone(false);
    } else {
      setShowClipboard(false);
      setShowDropZone(true);
    }
  };

  return (
    <div className="relative inline-block">
      <select
        // value={selectedMode}
        onChange={handleChange}
        className="appearance-none pl-4 pr-10 py-1.5 bg-[#F5F5F7] hover:bg-[#E8E8ED] border border-[#D2D2D7] rounded-[10px] text-[14px] text-gray-800 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors cursor-pointer"
      >
        <option value="clipboard">클립보드 </option>
        <option value="pdf-text">PDF 텍스트 파일</option>
        <option value="pdf-ocr">PDF 이미지 파일</option>
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          className="h-4 w-4 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
};
