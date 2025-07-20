import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

export const MyDropzone = ({ setUploadFile, onSendFile }) => {
  const [file, setFile] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        const uploadedFile = acceptedFiles[0];
        setFile(uploadedFile);
        setUploadFile(uploadedFile);
      }
    },
  });

  const handleDeleteFile = () => {
    setFile(null);
    setUploadFile(null);
  };

  return (
    <div className=" max-w-6xl bg-blue-50 rounded-lg shadow-lg overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 pt-10 pr-10 pl-10 pb-5">
          {/* 드롭존 영역 */}
          <div
            {...getRootProps()}
            className={`
                border-2 border-dashed rounded-lg
                p-6
                sm:p-8
                md:p-10
                lg:p-15
                xl:p-20
                text-center cursor-pointer
                transition-all duration-200 relative
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              `}
          >
            <input {...getInputProps()} />

            {/* 드래그 중 오버레이 */}
            {isDragActive && (
              <div className="absolute inset-0 bg-blue-50 bg-opacity-50 rounded-lg flex items-center justify-center">
                <p className="text-blue-600 font-medium">
                  파일을 여기에 놓으세요
                </p>
              </div>
            )}

            {/* 파일 선택 버튼 */}
            <button className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-1 text-md w-[120px] rounded-md flex items-center mx-auto transition-colors ">
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
                  d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
                />
              </svg>
              파일 선택
            </button>

            <p
              className="flex justify-center
            text-[10px]
            sm:text-[10px]
            md:text-[13px]
            lg:text-[16px]
            xl:text-[20px]
            whitespace-nowrap text-gray-500"
            >
              <span>또는 파일을 여기로 드래그하세요</span>
            </p>
          </div>

          {/* 업로드된 파일 표시 */}
          {file && (
            <div className="mt-3">
              <p className="text-lg text-left font-semibold ml-3">
                업로드한 파일:
              </p>
              <div className="flex items-center p-3 bg-blue-50 rounded">
                <svg
                  className="w-5 h-5 text-blue-600 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-5L9 2H4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span
                  className="
                text-[12px]
                lg:text-lg

                text-gray-700 mr-1"
                >
                  {file.name}
                </span>
                <button
                  className="p-0 ml-1.5 bg-blue-50"
                  onClick={handleDeleteFile}
                >
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
                <span
                  className="text-gray-500
                text-sm
                ml-auto"
                >
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
          )}
          <div className="text-right">
            {file && (
              <button
                onClick={onSendFile}
                className="
                text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-500
                px-3 py-1.5 rounded-full text-sm font-md shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:scale-110 transform"
              >
                퀴즈 만들기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
