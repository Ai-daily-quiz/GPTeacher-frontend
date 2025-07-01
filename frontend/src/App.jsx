import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const [previewClipBoard, setPreviewClipBoard] = useState(null);
  const myClipBoard = navigator.clipboard;

  const handleClick = () => {};

  const handlePreview = async () => {
    const clipText = await myClipBoard.readText();
    const slicedText = clipText.slice(-100);
    setPreviewClipBoard(slicedText);
    const payload = {
      clipboard: clipText,
      timestamp: new Date().toISOString(),
    };
    const response = await axios.post(
      'http://localhost:4000/api/message',
      payload
    );
    console.log('LLM 결과 주제 : ', response.data);
  };

  return (
    <>
      <div>
        <button onClick={handlePreview}>클립보드 미리보기</button>
      </div>
      <div>
        <textarea
          name="clipboard"
          id="clipboard"
          placeholder="클립보드 미리보기..."
          value={previewClipBoard}
          style={{ fontSize: '8px' }}
        ></textarea>
      </div>
      <div>
        <button onClick={handleClick}>제출</button>
      </div>

      <div className="card">
        <button onClick={() => setCount(count => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  );
}

export default App;
