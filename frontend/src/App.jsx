import { useEffect, useState } from 'react';
import { ClipboardPreview } from './components/ClipboardPreview/ClipboardPreview';
import { TopicCards } from './components/TopicCards/TopicCards';
import axios from 'axios';
import { Quiz } from './components/Quiz/Quiz';
import LoginModal from './components/LoginModal/LoginModal';
import supabase from './supabase';
import { Button } from './components/ClipboardPreview/Button/Button';

function App() {
  const [isPreview, setIsPreview] = useState(false);
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
      'http://localhost:4000/api/analyze',
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
      if (session?.user) {
        setUser(session?.user ?? null);
        if (!selectedTopic && !isTopicCards) {
          setIsPreview(true);
        }
      }
      countPending();
    }, []);

    // 인증 상태 변화 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser(session?.user ?? null);
        if (!selectedTopic && !isTopicCards) {
          setIsPreview(true);
        }
      } else {
        setUser(null);
        setIsPreview(false);
      }
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

  useEffect(() => {
    console.log('상태 로그:', {
      selectedTopic: !!selectedTopic,
      isTopicCards,
      isPreview,
    });
  }, [selectedTopic, isTopicCards, isPreview]);

  return (
    <div className="min-h-screen relative">
      {/* 배경 - 4분할 컬러 영역 */}
      <div className="fixed inset-0 w-[50vw] h-[100vh] left-[25vw]">
        {/* 좌측 상단 - 오렌지 영역 */}
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-orange-400 opacity-70"></div>

        {/* 우측 상단 - 민트/에메랄드 영역 */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-emerald-400 opacity-70"></div>

        {/* 우측 하단 - 노란색 영역 */}
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-yellow-300 opacity-70"></div>

        {/* 좌측 하단 - 보라색 영역 */}
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-purple-400 opacity-70"></div>
      </div>

      {/* 로그인 하지 않은 경우에만 배경을 반투명하게 */}
      {!user && <div className="absolute inset-0 bg-white/50 z-40"></div>}

      <div className="container mx-auto px-4 py-8">
        {user ? (
          <div className="relative z-20">
            {/* 우측 상단에 고정된 헤더 */}
            <div className="fixed top-4 right-4 flex items-center gap-3 z-50">
              {/* 진행중인 퀴즈 버튼 */}
              {showPendingButton && isPendingQuestion > 0 && !selectedTopic && (
                <button
                  onClick={handleShowTopics}
                  className="bg-white text-gray-700 px-4 py-2.5 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200"
                >
                  진행중인 퀴즈 {isPendingQuestion}개
                </button>
              )}

              {/* 로그아웃 버튼 */}
              <LoginModal user={user} />

              {/* 프로필 이미지 */}
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md">
                <img
                  src={
                    user.user_metadata?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=random`
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="text-center py-12">
              <h1 className="text-5xl font-bold text-blue-600 mb-2">AI 퀴즈</h1>
            </div>
          </div>
        ) : (
          <div className="fixed inset-0 z-50">
            {/* 배경 - 첨부 이미지처럼 4분할 컬러 영역 */}
            <div className="absolute inset-0">
              {/* 좌측 상단 - 오렌지 영역 */}
              <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-orange-400 opacity-70"></div>

              {/* 우측 상단 - 민트/에메랄드 영역 */}
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-emerald-400 opacity-70"></div>

              {/* 우측 하단 - 노란색 영역 */}
              <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-yellow-300 opacity-70"></div>

              {/* 좌측 하단 - 보라색 영역 */}
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-purple-400 opacity-70"></div>
            </div>

            {/* 로그인 모달 - 중앙 정렬 */}
            <div className="relative flex items-center justify-center h-full">
              <div className="bg-white rounded-2xl shadow-2xl p-8 text-center w-[30%] h-[35%] min-w-[320px] max-w-[500px] mx-auto border border-gray-200">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <p className="text-xl text-gray-700 font-medium mb-4">
                    로그인이 필요합니다
                  </p>
                  <p className="text-gray-500 mb-6">
                    퀴즈를 시작하려면 먼저 로그인해주세요
                  </p>
                </div>
                <LoginModal user={user} />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="container mx-auto px-4">
        {!selectedTopic && !isTopicCards && isPreview && (
          <div className="animate-fadeIn max-w-4xl mx-auto relative z-20">
            <div className="relative">
              {/* 배경 블러 효과 */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-purple-400/20 rounded-3xl blur-2xl"></div>

              {/* 메인 컨테이너 */}
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
                {/* 상단 색상 바 */}
                <div className="h-2 bg-gradient-to-r from-orange-400 via-emerald-400 via-yellow-300 to-purple-400"></div>

                <div className="p-8">
                  <div className="text-center mb-8">
                    {/* 아이콘 */}
                    <div className="inline-flex items-center justify-center w-20 h-20 mb-6">
                      <div className="absolute w-20 h-20 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-full animate-pulse"></div>
                      <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
                        <span className="text-3xl">📝</span>
                      </div>
                    </div>
                    {/* 제목 */}
                    <h3 className="text-3xl font-bold text-gray-800 mb-3">
                      새 퀴즈{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-500">
                        만들기
                      </span>
                    </h3>
                    {/* 설명 */}
                    <div>
                      <p className="text-gray-600 text-lg max-w-md mx-auto">
                        클립보드의 내용을 붙여넣고{' '}
                        <span className="font-semibold text-orange-500">
                          AI
                        </span>
                        가 퀴즈를 생성합니다.
                      </p>
                      <div className="flex justify-center gap-2 mt-4">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  <ClipboardPreview
                    analyzeClipboard={analyzeClipboard}
                    isLoading={isLoading}
                    onSubmit={handleClipBoardSumbit}
                    onGetQuizzes={getPendingQuiz}
                    isPendingQuestion={isPendingQuestion}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 ">
            {/* 3개의 점이 튀는 애니메이션 */}
            <div className="flex space-x-2 mb-8">
              <div
                className="w-4 h-4 bg-orange-600 rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              ></div>
              <div
                className="w-4 h-4 bg-emerald-600 rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              ></div>
              <div
                className="w-4 h-4 bg-purple-600 rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              ></div>
            </div>

            {/* 텍스트 */}
            <h3 className="text-2xl font-bold  mb-2">
              AI가 퀴즈를 만들고 있어요
            </h3>
            <p>잠시만 기다려주세요...</p>

            {/* 프로그레스 바 */}
            <div className="w-64 h-2 bg-gray-400 rounded-full mt-6 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}

        {selectedTopic && (
          <div className="animate-slideIn">
            <Quiz
              selectedTopic={selectedTopic}
              setIsTopicComplete={setIsTopicComplete}
              onClickSubmit={submitQuizAnswer}
              totalQuestion={totalQuestion}
            />
          </div>
        )}

        {!selectedTopic && isTopicCards && (
          <div className="relative z-20 w-full max-w-5xl mx-auto px-4">
            <div className="bg-transparent rounded-3xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
                퀴즈 주제를 선택해주세요
              </h2>
              <TopicCards
                topics={topics}
                setIsPreview={setIsPreview}
                onTopicSelect={handleSelectedTopic}
                pendingList={pendingList}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
