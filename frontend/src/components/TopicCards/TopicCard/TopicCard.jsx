export const TopicCard = ({ topic, onClick }) => {
  return (
    <>
      <div onClick={onClick} className="text-3xl">
        {topic.category}
      </div>
    </>
  );
};
