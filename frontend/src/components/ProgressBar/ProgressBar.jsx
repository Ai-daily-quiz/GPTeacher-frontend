import { useEffect, useRef, useState } from 'react';
import ProgressBar from '@ramonak/react-progress-bar';

export default function TimeBar({ isSubmitted, questionIndex, handleAnswer }) {
  const [progress, setProgress] = useState(0);
  const [sec, setSec] = useState(0);
  const intervalRef = useRef(null);
  const startRef = useRef(0);

  // 답 제출
  // 프로그래스바 멈춤
  //

  const quizLimitSec = 20;
  useEffect(() => {
    // 1️⃣ 다음 문제로 넘어가거나, 2️⃣ 답을 제출하거나
    if (isSubmitted) {
      // 답 제출시에만
      clearInterval(intervalRef.current);
      setProgress((Date.now() - startRef.current) / (quizLimitSec * 10));
    }
  }, [isSubmitted]);

  // 다음버튼 클릭
  // 프로그래스바 초기화
  //

  useEffect(() => {
    // 초기화 추가
    setSec(0); //
    setProgress(0); //
    clearInterval(intervalRef.current); // 이전 타이머 정리

    // 약간의 딜레이 후 시작
    setTimeout(() => {
      setProgress(100);
    }, 50);

    startRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setSec(prevSec => {
        const nextSec = prevSec + 1;
        if (nextSec === quizLimitSec) {
          clearInterval(intervalRef.current);
          setProgress((Date.now() - startRef.current) / (quizLimitSec * 10));
          // 타임 오버 실패 함수 호출
          console.log('타임오버');
          handleAnswer();
        }
        return nextSec;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [questionIndex]);

  return (
    <>
      <div className="flex items-center mt-2 ml-5">
        <img
          src="/assets/clock2.png"
          className="w-9 h-9 "
          alt="clockImageError"
        />
        <ProgressBar
          key={questionIndex}
          className="ml-1"
          completed={progress} // 0 → 100으로 변경됨
          maxCompleted={100} // 최대값 100
          height="10px"
          width="550px"
          borderRadius="50px"
          isLabelVisible={false}
          baseBgColor="#dcdcdc"
          bgColor="linear-gradient(to right, #ffc700, red)"
          transitionDuration={isSubmitted ? '0s' : `${quizLimitSec}s`} // 10초 동안 천천히 채워짐
          transitionTimingFunction="linear" // 일정한 속도로
          animateOnRender={true}
        />
        <div className="ml-2 text-xl">{sec}</div>
      </div>
    </>
  );
}
