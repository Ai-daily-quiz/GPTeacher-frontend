import { useEffect, useState } from 'react';
import { ClipboardPreview } from './components/ClipboardPreview/ClipboardPreview';
import { TopicCards } from './components/TopicCards/TopicCards';
import axios from 'axios';
import { Quiz } from './components/Quiz/Quiz';
import LoginModal from './components/LoginModal/LoginModal';
import supabase from './supabase';
import { Button } from './components/ClipboardPreview/Button/Button';

function App() {
  const [isPreview, setIsPreview] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isTopicCards, setIsTopicCards] = useState(false);
  const [isResponse, setIsResponse] = useState(false);
  const [topics, setTopics] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isTopicComplete, setIsTopicComplete] = useState(false);
  const [isPendingQuestion, setIsPendingQuestion] = useState(null);
  const [user, setUser] = useState(null);
  const [showPendingButton, setShowPendingButton] = useState(true);
  const [totalQuestion, setTotalQuestion] = useState(null);
  const [pendingList, setPendingList] = useState(null);
  const [isNewQuiz, setIsNewQuiz] = useState(false);

  const countPending = async () => {
    // 최초 로그인시 동작
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await axios.get(
        'http://localhost:4000/api/quiz/count-pending',
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      const pendingQuizzes = response.data.pending_count;
      console.log(
        '로그인 확인 및 진행중인 퀴즈 수:',
        response.data.pending_count
      );
      console.log(`isPendingQuestion : ${isPendingQuestion}`);
      console.log(`pendingQuizzes : ${pendingQuizzes}`);

      setIsPendingQuestion(pendingQuizzes);
      // setTopics(response.data.result);
      // setIsTopicCards(true);
      return response.data.pending_count;
    } catch (error) {
      console.error('퀴즈 가져오기 오류:', error);
    }
  };

  const handleShowTopics = async () => {
    // 진행중인 퀴즈 버튼 클릭시
    console.log('토픽 페이지를 보여주세요');
    // 로그인 언마운트
    // 진행중인 퀴즈 버튼 언마운트
    setShowPendingButton(false);
    setIsNewQuiz(false);
    setIsPreview(false);
    await getPendingQuiz();
  };

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

      console.log('남은 퀴즈 리스트:', response.data.result);
      setPendingList(response.data.result);
      console.log('남은 퀴즈 수:', response.data.pending_count);
      if (response.data.pending_count === 0) {
        setIsTopicCards(false);
        setIsPreview(true);
        return;
      }
      setTopics(response.data.result);
      setIsTopicCards(true);
      setTotalQuestion(response.data.pending_count);
    } catch (error) {
      console.error('남은 퀴즈 가져오기 오류:', error);
    }
  };

  const submitQuizAnswer = async (
    quizId,
    topicId,
    userChoice,
    result,
    questionIndex,
    totalIndex
  ) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await axios.post(
        'http://localhost:4000/api/quiz/submit',
        {
          quizId: quizId,
          topicId: topicId,
          userChoice: userChoice,
          result: result,
          questionIndex: questionIndex,
          totalIndex: totalIndex,
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
    setIsNewQuiz(true);
    setTopics(response.data.result.topics);
    // setTotalQuestion(response.data.total_question);
    console.log('LLM 결과 주제 : ', response.data.result.topics);
    console.log('response.data:', response.data);
    console.log('생성 퀴즈 갯수 : ', response.data.total_question); // 분모
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

  const handleSelectedTopic = (category, topic) => {
    setSelectedTopic(topic);

    const foundTopic = topics.find(element => element.category === category);
    // const foundTopic = pendingList.find(
    //   element => element.category === category
    // );
    console.log(foundTopic);
    if (foundTopic) {
      const questionsLength = foundTopic.questions.length;
      console.log('questionsLength :', questionsLength);
      setTotalQuestion(questionsLength);
    }
  };

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      countPending();
    }, []);

    // 인증 상태 변화 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleTopicComplete = async () => {
      if (isTopicComplete) {
        if (isNewQuiz) {
          const remainingTopics = topics.filter(
            topic => topic.category !== selectedTopic.category
          );
          setTopics(remainingTopics);

          if (remainingTopics.length === 0) {
            setIsTopicCards(false);
            setIsPreview(true);
            setIsNewQuiz(false);
          }
        } else {
          await getPendingQuiz();
        }
        setSelectedTopic(null); // 주제 선택 화면으로 돌아가기
        setIsTopicComplete(false); // 상태 초기화
      }
    };
    handleTopicComplete();
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
            {showPendingButton && isPendingQuestion > 0 && !selectedTopic && (
              // 로그인 상태 && pendingQuestion > 0
              <Button
                onClick={handleShowTopics}
                text={'진행중인 퀴즈가 있어요!'}
              />
            )}
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
          isPendingQuestion={isPendingQuestion}
        />
      )}
      {isLoading && 'Loading Indicator'}
      {selectedTopic && (
        // <div className="p-20 bg-gray-100 rounded-2xl">
        <Quiz
          selectedTopic={selectedTopic}
          setIsTopicComplete={setIsTopicComplete}
          onClickSubmit={submitQuizAnswer}
          totalQuestion={totalQuestion}
        />
        // </div>
      )}
      {/* 풀다 만 퀴즈가 있어요! */}
      {!selectedTopic && isTopicCards && (
        <TopicCards
          topics={topics}
          setIsPreview={setIsPreview}
          onTopicSelect={handleSelectedTopic}
          pendingList={pendingList}
        />
      )}
    </>
  );
}

export default App;
