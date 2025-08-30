interface ButtonProps {
  text: string;
  onClick: () => void;
}

export const Button = ({ text, onClick }: ButtonProps) => {
  return (
    <>
      <button className="bg-gray-200 p-1 pl-3 pr-3" onClick={onClick}>
        {text}
      </button>
    </>
  );
};
