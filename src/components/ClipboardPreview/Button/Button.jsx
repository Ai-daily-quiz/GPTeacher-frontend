export const Button = ({ text, onClick }) => {
  return (
    <>
      <button className="bg-gray-200 p-1 pl-3 pr-3" onClick={onClick}>
        {text}
      </button>
    </>
  );
};
