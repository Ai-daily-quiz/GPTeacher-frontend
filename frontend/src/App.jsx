import { useEffect, useState } from 'react';
import { ClipboardPreview } from './components/ClipboardPreview/ClipboardPreview';
import { TopicCards } from './components/TopicCards/TopicCards';
import axios from 'axios';
import { Quiz } from './components/Quiz/Quiz';

function App() {
  const [isPreview, setIsPreview] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isTopicCards, setIsTopicCards] = useState(false);
  const [isResponse, setIsResponse] = useState(false);
  const [topics, setTopics] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isTopicComplete, setIsTopicComplete] = useState(false);

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
    console.log('보내기 버튼 클릭!');
    // 분석이 완료된 경우 isResponse
    if (isResponse) {
      setIsTopicCards(true);
    } else {
      // 분석이 완료되지 않은 경우 (!isResponse)
      setIsLoading(true);
    }
  };

  const handleSelectedTopic = topic => {
    setSelectedTopic(topic);
  };

  useEffect(() => {
    if (isTopicComplete) {
      setSelectedTopic(null); // 주제 선택 화면으로 돌아가기
      setIsTopicComplete(false); // 상태 초기화
    }
  }, [isTopicComplete]);

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
      {selectedTopic && (
        <div className="p-20 bg-gray-100 rounded-2xl">
          <Quiz
            selectedTopic={selectedTopic}
            setIsTopicComplete={setIsTopicComplete}
          />
        </div>
      )}
      {!selectedTopic && isTopicCards && (
        <TopicCards topics={topics} onTopicSelect={handleSelectedTopic} />
      )}
    </>
  );
}

export default App;
