import { Button } from './Button';

export const Preview = ({ preview, showClipboard, onClickPreview }) => {
  return (
    <div className="w-[500px] h-[400px] bg-[#fafafa] rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-2 flex items-center gap-2 border-b border-gray-200">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-sm"></div>
        <div className="w-3 h-3 rounded-full bg-[#febc2e] shadow-sm"></div>
        <div className="w-3 h-3 rounded-full bg-[#28c940] shadow-sm"></div>
        <span className="text-gray-600 text-xs ml-3 font-medium">
          내 클립보드
        </span>
      </div>
      <div className="p-4 overflow-auto h-[calc(100%-40px)] bg-white flex justify-center items-center ">
        <pre className="text-gray-700 text-[9px] md:text-[9px] lg:text-xs 2xl:text-md  font-['SF Mono','Monaco','monospace']">
          {preview}
          <div
            onClick={onClickPreview}
            className="hover:scale-110 transition-all duration-200"
          >
            <span className="text-transparent font-bold bg-clip-text bg-gradient-to-r from-purple-500 to-orange-500">
              붙여넣기
            </span>
            {!preview && showClipboard && (
              <svg
                width="56"
                height="56"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="24" cy="24" r="24" fill="#FF9500" />
                <path
                  d="M34 10H14C12.9 10 12 10.9 12 12V36C12 37.1 12.9 38 14 38H34C35.1 38 36 37.1 36 36V12C36 10.9 35.1 10 34 10Z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M36 30H24"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M28 34L24 30L28 26"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 14H32"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M16 17H32"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M16 20H32"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M16 23H32"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M16 26H24"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
        </pre>
      </div>
    </div>
  );
};
