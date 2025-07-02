export const Textarea = ({ preview }) => {
  return (
    <>
      <textarea
        className="rounded-lg"
        name="clipboard"
        id="clipboard"
        placeholder=" 클립보드 미리보기..."
        value={preview}
        style={{ fontSize: '10px', width: '500px', height: '300px' }}
      ></textarea>
    </>
  );
};
