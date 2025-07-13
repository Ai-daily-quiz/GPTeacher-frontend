import { useState } from 'react';

export const Quiz = ({
  quizMode,
  clickEnd,
  selectedTopic,
  setIsTopicComplete,
  onClickSubmit,
  totalQuestion,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const correctAnswer = Number(
    selectedTopic.questions[questionIndex].correct_answer
  );
  const dbResult = selectedTopic.questions[questionIndex].result;

  const getOptionStyle = index => {
    if (!isSubmitted) {
      return 'bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transform transition-all hover:scale-[1.02] hover:shadow-md';
    }

    if (index === correctAnswer) {
      return 'bg-green-50 border-2 border-green-500 text-green-700';
    }

    if (index === selectedAnswer) {
      return 'bg-red-50 border-2 border-red-500 text-red-700';
    }
    return 'bg-gray-50 border border-gray-300 opacity-60';
  };

  const handleAnswer = index => {
    setIsSubmitted(true);
    setSelectedAnswer(index);
  };

  const moveNextQuestion = async () => {
    await onClickSubmit(
      selectedTopic.questions[questionIndex].quiz_id,
      selectedTopic.topic_id,
      selectedAnswer,
      selectedAnswer === correctAnswer ? 'pass' : 'fail',
      questionIndex,
      selectedTopic.questions.length - 1,
      dbResult
    );
    const nextIndex = questionIndex + 1;
    if (nextIndex >= selectedTopic.questions.length) {
      if (dbResult !== 'fail') {
        setIsTopicComplete(true);
      }
      return;
    }

    setSelectedAnswer(null);
    setIsSubmitted(false);
    setQuestionIndex(nextIndex);
  };

  return (
    <div className="w-[650px] mx-auto relative z-30">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-orange-400 to-purple-500 p-6 text-white">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">{questionIndex + 1}</span>
              <span className="text-lg opacity-80">/ {totalQuestion}</span>
            </div>
            <button
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-all"
              onClick={() => clickEnd(quizMode)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              종료하기
            </button>
          </div>

          {/* 진행 바 */}
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{
                width: `${((questionIndex + 1) / totalQuestion) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="p-8">
          {/* 카테고리 */}
          <div className="inline-flex items-center gap-2  text-gray-900 px-4 py-2 rounded-full text-2xl font-medium mb-6">
            <img
              src="/assets/quiz-icon.png"
              width={'40px'}
              height={'40px'}
              alt=""
            />
            {selectedTopic.category}
          </div>

          {/* 문제 */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-medium text-gray-800 leading-relaxed">
              {selectedTopic.questions[questionIndex].question}
            </h2>
          </div>

          {/* 선택지 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {selectedTopic.questions[questionIndex].options.map(
              (option, index) => (
                <div
                  key={index}
                  className={`${getOptionStyle(index)} rounded-xl p-5 text-center font-medium transition-all`}
                  onClick={() => !isSubmitted && handleAnswer(index)}
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-lg">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                  </div>
                </div>
              )
            )}
          </div>

          {/* 결과 표시 */}
          {isSubmitted && (
            <div
              className={`rounded-2xl p-4 mb-6 text-center font-bold text-lg ${
                selectedAnswer === correctAnswer
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                  : 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
              }`}
            >
              {selectedAnswer === correctAnswer ? (
                <div className="flex items-center justify-center gap-2">
                  <span>🎉</span> 정답입니다!
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>😢</span> 오답입니다
                </div>
              )}
            </div>
          )}

          {/* 해설 */}
          {isSubmitted && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
              <div className="flex text-left items-start gap-3">
                <div>
                  <div className="flex text-left items-center">
                    <span className="text-2xl">💡</span>
                    <p className="font-semibold text-blue-900 mt12">해설</p>
                  </div>
                  <p className="text-blue-700 leading-relaxed ml-3">
                    {selectedTopic.questions[questionIndex].explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 다음 버튼 */}
          {isSubmitted && (
            <div className="flex justify-end">
              <button
                className="flex items-center justify-center w-[80px] h-[40px] bg-gradient-to-r from-orange-400 to-purple-500 hover:from-orange-400 hover:to-purple-500 text-white py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02]"
                onClick={() => moveNextQuestion()}
              >
                {questionIndex === selectedTopic.questions.length - 1
                  ? '완료'
                  : '다음'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
