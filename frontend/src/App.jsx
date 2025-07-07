import { useEffect, useState } from 'react';
import { ClipboardPreview } from './components/ClipboardPreview/ClipboardPreview';
import { TopicCards } from './components/TopicCards/TopicCards';
import axios from 'axios';
import { Quiz } from './components/Quiz/Quiz';
import LoginModal from './components/LoginModal/LoginModal';
import supabase from './supabase';

function App() {
  const [isPreview, setIsPreview] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isTopicCards, setIsTopicCards] = useState(false);
  const [isResponse, setIsResponse] = useState(false);
  const [topics, setTopics] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isTopicComplete, setIsTopicComplete] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 인증 상태 변화 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getPendingQuiz = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await axios.get(
        'http://localhost:4000/api/quiz/pending',
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      console.log('풀던 퀴즈 리스트:', response.data);
    } catch (error) {
      console.error('퀴즈 가져오기 오류:', error);
    }
  };

  const submitQuizAnswer = async (quizId, userChoice, result) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await axios.post(
        'http://localhost:4000/api/quiz/submit',
        {
          quizId: quizId,
          userChoice: userChoice,
          result: result,
        },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      console.log('퀴즈 결과 저장됨:', response.data);
    } catch (error) {
      console.error('퀴즈 제출 오류:', error);
    }
  };

  const analyzeClipboard = async clipText => {
    const payload = {
      clipboard: clipText,
      timestamp: new Date().toISOString(),
    };
    const {
      data: { session },
    } = await supabase.auth.getSession();
    // const session = await supabase.auth.getSession();
    const response = await axios.post(
      'http://localhost:4000/api/message',
      payload,
      {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      }
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
      <div>
        {user ? (
          <div>
            <p>안녕하세요, {user.email}!</p>
            <LoginModal />
          </div>
        ) : (
          <div>
            <p>로그인이 필요합니다.</p>
            <LoginModal />
          </div>
        )}
      </div>
      {isPreview && (
        <ClipboardPreview
          analyzeClipboard={analyzeClipboard}
          isLoading={isLoading}
          onSubmit={handleClipBoardSumbit}
          onGetQuizzes={getPendingQuiz}
        />
      )}
      {isLoading && 'Loading Indicator'}
      {selectedTopic && (
        <div className="p-20 bg-gray-100 rounded-2xl">
          <Quiz
            selectedTopic={selectedTopic}
            setIsTopicComplete={setIsTopicComplete}
            onClickSubmit={submitQuizAnswer}
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
