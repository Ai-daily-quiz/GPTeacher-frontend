import './TopicCard.css';

export const TopicCard = ({ topic }) => {
  return (
    <>
      <div className="TopicCard">{topic.category}</div>
    </>
  );
};
