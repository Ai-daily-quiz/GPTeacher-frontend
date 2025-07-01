import { useEffect, useState } from 'react';
import { ClipboardPreview } from './components/ClipboardPreview/ClipboardPreview';
import { TopicCards } from './components/TopicCards/TopicCards';
import axios from 'axios';

function App() {
  const [isPreview, setIsPreview] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isTopicCards, setIsTopicCards] = useState(false);
  const [isResponse, setIsResponse] = useState(false);
  const [topics, setTopics] = useState(false);

  const analyzeClipboard = async clipText => {
    const payload = {
      clipboard: clipText,
      timestamp: new Date().toISOString(),
    };
    const response = await axios.post(
      'http://localhost:4000/api/message',
      payload
    );
    setIsResponse(true);
    setTopics(response.data.result.topics);
    console.log('LLM 결과 주제 : ', response.data.result.topics);
  };

  const handleClipBoardSumbit = () => {
    setIsPreview(false);
    console.log('제출 버튼 클릭!');
    // 분석이 완료된 경우 isResponse
    // debugger;
    if (isResponse) {
      setIsTopicCards(true);
    } else {
      // 분석이 완료되지 않은 경우 (!isResponse)
      setIsLoading(true);
    }
  };

  useEffect(() => {
    if (isResponse && isLoading) {
      setIsLoading(false);
      setIsTopicCards(true);
    }
  }, [isResponse]);

  return (
    <>
      {isPreview && (
        <ClipboardPreview
          analyzeClipboard={analyzeClipboard}
          isLoading={isLoading}
          onSubmit={handleClipBoardSumbit}
        />
      )}
      {isLoading && 'Loading Indicator'}
      {isTopicCards && <TopicCards topics={topics} />}
    </>
  );
}

export default App;
