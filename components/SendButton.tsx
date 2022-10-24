import useValidateWord from "../hooks/useValidateWord";

const SendButton = () => {
  const validateWord = useValidateWord();

  return (
    <button onClick={validateWord} className="mt-12 button whitespace-nowrap">
      Tester ce prénom
    </button>
  );
};

export default SendButton;
