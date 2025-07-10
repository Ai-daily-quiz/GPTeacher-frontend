import { useState } from 'react';

export const Quiz = ({
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
  ); // 객관식 답

  // setIsTopicComplete(false);
  const getOptionStyle = index => {
    // 제출 전
    // 정답 외 #dbdbdb
    if (!isSubmitted) {
      return 'bg-[#efefef] border-2 border-black-500  rounded-xl text-lg';
    }

    // 제출 후
    // 정답 #20d46e
    if (index === correctAnswer) {
      return 'bg-green-100 border-2 border-green-500  rounded-xl text-lg';
    }

    // #ffc8d2
    if (index === selectedAnswer) {
      return 'bg-red-100 border-2 border-red-500  rounded-xl text-lg';
    }
    return 'bg-[#efefef] border-2 border-stone-500  rounded-xl text-lg';
  };
  const handleAnswer = index => {
    setIsSubmitted(true);
    setSelectedAnswer(index);
  };
  const moveNextQuestion = async () => {
    await onClickSubmit(
      selectedTopic.questions[questionIndex].quiz_id,
      selectedTopic.topic_id,
      selectedAnswer, // 선택한 답
      selectedAnswer === correctAnswer ? 'pass' : 'fail', // result
      questionIndex,
      selectedTopic.questions.length - 1
    );
    const nextIndex = questionIndex + 1;

    if (nextIndex >= selectedTopic.questions.length) {
      // debugger;
      setIsTopicComplete(true);
      return;
    }

    setSelectedAnswer(null);
    setIsSubmitted(false);
    setQuestionIndex(nextIndex);
  };

  return (
    <>
      <div className="w-[600px] mx-auto p-10 bg-gray-100 rounded-2xl relative z-20">
        {/* 문제 index / 전체 문제 수 */}
        <div className="text-right text-lg mb-4">
          {questionIndex + 1 + ' / ' + totalQuestion}
        </div>

        {/*주제*/}
        <div className="bg-cyan-500/50 p-3 rounded-xl text-center text-lg font-semibold mb-4">
          {selectedTopic.category}
        </div>

        {/* 문제 */}
        <div className="bg-cyan-500/20 p-6 rounded-xl text-lg mb-6 min-h-[100px]">
          {selectedTopic.questions[questionIndex].question}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* 답 선택 전 보기 */}
          {!isSubmitted &&
            selectedTopic.questions[questionIndex].options.map(
              (option, index) => (
                <div
                  key={index}
                  className="relative bg-white border-2 border-cyan-500 p-4 rounded-xl text-lg cursor-pointer transition-all duration-300 h-[80px] flex items-center justify-center hover:shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:bg-gradient-to-br hover:from-cyan-50 hover:to-white hover:border-cyan-600 transform hover:scale-105"
                  onClick={() => handleAnswer(index)}
                >
                  {option}
                </div>
              )
            )}

          {/* 답 선택 후 보기*/}
          {isSubmitted &&
            selectedTopic.questions[questionIndex].options.map(
              (option, index) => (
                <div
                  key={index}
                  className={`${getOptionStyle(index)} h-[80px] flex items-center justify-center`}
                >
                  {option}
                </div>
              )
            )}
        </div>

        {/* 정답 / 오답 표현 */}
        {isSubmitted && (
          <div className="mb-4">
            {selectedAnswer === correctAnswer ? (
              <div className="bg-[#32a852] text-white p-4 rounded-lg text-center text-lg font-bold">
                정답입니다 ✅
              </div>
            ) : (
              <div className="bg-[#ed6d91] text-white p-4 rounded-lg text-center text-lg font-bold">
                오답입니다 ❌
              </div>
            )}
          </div>
        )}

        {/* 해설 */}
        {isSubmitted && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 min-h-[80px]">
            <span className="text-sm">
              🧐 해설: {selectedTopic.questions[questionIndex].explanation}
            </span>
          </div>
        )}

        {/* 다음 버튼 */}
        {isSubmitted && (
          <div className="flex justify-end">
            <button
              className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium transition-all"
              onClick={() => moveNextQuestion()}
            >
              다음
            </button>
          </div>
        )}
      </div>
    </>
  );
};
