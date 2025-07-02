// import { Button } from './Button/Button';

import { useState } from 'react';

export const Quiz = ({ selectedTopic }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const correctAnswer = selectedTopic.questions[questionIndex].correctAnswer; // 객관식 답

  console.log(selectedTopic.questions.length);
  const getOptionStyle = index => {
    // 제출 전
    // 정답 외 #dbdbdb
    if (!isSubmitted) {
      return 'bg-[#efefef] border-2 border-black-500 m-3 p-3 rounded-xl text-xs';
    }

    // 제출 후
    // 정답 #20d46e
    if (index === correctAnswer) {
      return 'bg-green-100 border-2 border-green-500 m-3 p-3 rounded-xl text-xs';
    }

    // #ffc8d2
    if (index === selectedAnswer) {
      return 'bg-red-100 border-2 border-red-500 m-3 p-3 rounded-xl text-xs';
    }
    return 'bg-[#efefef] border-2 border-stone-500 m-3 p-3 rounded-xl text-xs';
  };

  const handleAnswer = index => {
    setIsSubmitted(true);
    setSelectedAnswer(index);
    console.log('내 선택 : ', index + 1);
    if (index === selectedAnswer) {
      console.log('정답');
    } else {
      console.log('오답');
    }
  };
  const moveNextQuestion = () => {
    console.log('move next question');
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setQuestionIndex(questionIndex + 1);
  };
  return (
    <>
      {/* 주제 */}
      <div className="bg-[#dcdcdc] mt-3 p-1 rounded-xl">
        {selectedTopic.category}
      </div>

      {/* 문제 */}
      <div className="bg-[#dcdcdc] mt-3 p-1 rounded-xl text-medium">
        {selectedTopic.questions[questionIndex].question}
      </div>

      <div className="grid grid-cols-4">
        {/* 답 선택 전 보기 */}
        {!isSubmitted &&
          selectedTopic.questions[questionIndex].options.map(
            (option, index) => (
              <div
                className="bg-transparent border border-indigo-500 m-3 p-3 rounded-xl text-xs "
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
                className={getOptionStyle(index)}
                onClick={() => handleAnswer(index)}
              >
                {option}
              </div>
            )
          )}
      </div>

      {/* 정답 / 오답 표현 */}
      {isSubmitted && (
        <div className="text-green">
          {selectedAnswer === correctAnswer ? (
            <div className="bg-[#32a852] text-white mb-20">정답입니다 ✅</div>
          ) : (
            <div className="bg-[#ed6d91] text-white mb-20">오답입니다 ❌</div>
          )}
        </div>
      )}
      {isSubmitted && (
        <div className="text-xs">
          {'🧐 해설 :' + selectedTopic.questions[questionIndex].explanation}
        </div>
      )}

      {/* 다음으로 */}
      <div
        className="bg-[#dcdcdc] rounded-lg float-right w-1/6 mt-1 text-xs"
        onClick={moveNextQuestion}
      >
        {'다음으로'}
      </div>
    </>
  );
};
