import { TopicCard } from './TopicCard/TopicCard';
import './TopicCards.css';

export const TopicCards = ({ topics }) => {
  return (
    <>
      <div className="card">
        {topics.map((topic, index) => (
          <TopicCard key={index} topic={topic} />
        ))}
      </div>
    </>
  );
};
