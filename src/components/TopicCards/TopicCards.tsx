import { useEffect } from 'react';

type Topic = {
  topic_id: string;
  category: string;
  title: string;
  description: string;
  questions: [
    {
      quiz_id: string;
      type: 'mulitple';
      options: string[];
      correct_answer: number;
      explanation: string;
    },
    {
      quiz_id: string;
      type: 'ox';
      questions: string;
      options: string[];
      correct_answer: number;
      explanation: string;
    },
  ];
};

type TopicCardsProps = {
  topics: Topic[];
  onTopicSelect: (category: string, topic: Topic) => void;
  setIsPreview: (value: boolean) => void;
  quizMode: string;
};

export const TopicCards = ({
  topics,
  onTopicSelect,
  setIsPreview,
  quizMode,
}: TopicCardsProps) => {
  useEffect(() => {
    setIsPreview(false);
  }, []);

  const handleTopic = (category: string, topic: Topic) => {
    onTopicSelect(category, topic);
  };

  const getTopicCardColor = (quizMode: string) => {
    if (quizMode === 'incorrect') {
      return 'red';
    } else if (quizMode === 'free-quiz') {
      return 'green';
    } else {
      return 'blue';
    }
  };

  // Tailwind 동적 클래스를 위한 전체 클래스명 정의
  const colorClasses = {
    red: {
      gradient: 'from-red-400 to-red-600',
      blur: 'bg-gradient-to-br from-red-300 to-red-600',
    },
    green: {
      gradient: 'from-green-400 to-green-600',
      blur: 'bg-gradient-to-br from-green-300 to-green-600',
    },
    blue: {
      gradient: 'from-cyan-400 to-cyan-600',
      blur: 'bg-gradient-to-br from-cyan-300 to-cyan-600',
    },
  };

  const currentColor = getTopicCardColor(quizMode);
  const colorClass = colorClasses[currentColor];

  return (
    <>
      <div className="flex justify-center">
        <div className="grid grid-cols-2 gap-6">
          {topics.map((topic: Topic) => (
            <div
              key={topic.topic_id}
              className="relative w-[160px] h-[220px] group cursor-pointer transform transition-all duration-300"
              onClick={e => {
                const card = e.currentTarget;

                // 카드 선택 애니메이션
                card.style.transform = 'scale(0.95)';
                card.style.filter = 'brightness(1.2)';

                // 파동 효과
                const ripple = document.createElement('div');
                ripple.className =
                  'absolute inset-0 bg-white rounded-2xl animate-ping opacity-30';
                card.appendChild(ripple);

                setTimeout(() => {
                  card.style.transform = 'scale(1.1) translateY(-10px)';
                  setTimeout(() => {
                    handleTopic(topic.category, topic);
                  }, 150);
                }, 100);
              }}
            >
              <div
                className={`absolute inset-0 ${colorClass.blur} rounded-2xl blur-sm`}
              ></div>
              <div
                className="relative h-full backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 p-6
                transition-all duration-300 hover:-translate-y-2 hover:bg-white/20"
              >
                <div className="flex flex-col h-full items-center justify-center">
                  <div className="text-5xl mb-4">
                    <img
                      src="/assets/quiz-icon.png"
                      width={'60px'}
                      height={'60px'}
                      alt=""
                    />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">
                    {topic.category}
                  </h3>
                  <p className="text-white/80 text-md">
                    {topic.questions.length}문제
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
