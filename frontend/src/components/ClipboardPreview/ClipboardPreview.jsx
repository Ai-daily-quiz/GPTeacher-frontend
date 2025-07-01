import { useState } from 'react';
import './ClipboardPreview.css';
import { Button } from './Button/Button';
import { Textarea } from './Button/Textarea';

export const ClipboardPreview = ({ analyzeClipboard, onSubmit }) => {
  const [preview, setPreview] = useState(null);
  const myClipBoard = navigator.clipboard;

  const handleClipBoard = () => {
    onSubmit();
  };

  const handlePreview = async () => {
    // 미리보기 버튼
    const clipText = await myClipBoard.readText();
    const slicedText = clipText.slice(-500);
    setPreview(slicedText);
    analyzeClipboard(clipText);
  };

  return (
    <>
      <div>
        <Button onClick={handlePreview} text={'클립보드 미리보기'} />
      </div>
      <div>
        <Textarea preview={preview} />
      </div>
      <div>
        <Button onClick={handleClipBoard} text={'제출'} />
      </div>
    </>
  );
};
