import { TopicCard } from './TopicCard/TopicCard';

export const TopicCards = ({
  topics,
  onTopicSelect,
  setIsPreview,
  // handleQuizStart,
  pendingList,
}) => {
  setIsPreview(false);
  // handleQuizStart;
  const handleTopic = (category, topic) => {
    onTopicSelect(category, topic);
  };

  return (
    <>
      <div className="font-medium mb-5">주제를 선택해주세요</div>
      <div className="grid grid-cols-2 gap-6">
        {topics.map(topic => (
          <div className="bg-cyan-500/50 rounded-lg shadow-lg p-5">
            <TopicCard
              key={topic.topic_id}
              topic={topic}
              onClick={() => handleTopic(topic.category, topic)}
            />
          </div>
        ))}
      </div>
    </>
  );
};
