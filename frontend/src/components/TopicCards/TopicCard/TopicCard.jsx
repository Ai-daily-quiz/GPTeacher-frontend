export const TopicCard = ({ topic, onClick }) => {
  return (
    <>
      <div onClick={onClick} className="text-lg">
        {topic.category}
      </div>
    </>
  );
};
