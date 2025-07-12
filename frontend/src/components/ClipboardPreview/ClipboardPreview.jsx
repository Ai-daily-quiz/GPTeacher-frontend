import { useRef, useState } from 'react';
import './ClipboardPreview.css';
import { Preview } from './Button/Preview';
import { MyDropzone } from './DND';
import { ModeSelect } from './Button/ModeDropDown';

export const ClipboardPreview = ({
  analyzeClipboard,
  setUploadFile,
  onSendFile,
}) => {
  const [fileName, setFileName] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isFile, setIsFile] = useState(null); /// 파일선택시 플래그
  const [showClipboard, setShowClipboard] = useState(true); // 클립보드 플래그
  const [showDropZone, setShowDropZone] = useState(null); // 드랍존 플래그
  const inputRef = useRef(null);

  const myClipBoard = navigator.clipboard;

  const handlePreview = async () => {
    // 미리보기 버튼
    const clipText = await myClipBoard.readText();
    const slicedText = clipText.slice(-500);
    setPreview(slicedText);
    analyzeClipboard(clipText);
  };

  const handleDeleteFile = async () => {
    setFileName(null);
    setIsFile(false);
    if (inputRef.current) {
      inputRef.current.value = null;
    }
  };

  return (
    <>
      <div className="text-left mb-2 flex justify-center">
        <ModeSelect
          setShowClipboard={setShowClipboard}
          setShowDropZone={setShowDropZone}
        />
      </div>

      <div className="text-right">
        <div className="flex items-center justify-end">
          <span className="text-right underline">{fileName}</span>
          {isFile && (
            <button className="p-0 ml-1.5" onClick={handleDeleteFile}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="flex justify-center">
        {showClipboard && (
          <Preview
            preview={preview}
            showClipboard={showClipboard}
            onClickPreview={handlePreview}
          />
        )}
        {showDropZone && (
          <MyDropzone setUploadFile={setUploadFile} onSendFile={onSendFile} />
        )}
      </div>
      <div className="text-right mr-8 mt-4">
        {showClipboard && preview && (
          <button
            onClick={onSendFile}
            className="
                text-right text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-500
                px-3 py-1.5 rounded-full text-sm font-md shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:scale-110 transform"
          >
            퀴즈 만들기
          </button>
        )}
      </div>
    </>
  );
};
