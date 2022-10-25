import useValidateWord from "../hooks/useValidateWord";

const SendButton = () => {
  const validateWord = useValidateWord();

  return (
    <button
      onClick={validateWord}
      className="mx-auto mt-6 button whitespace-nowrap"
    >
      Tester ce prénom
    </button>
  );
};

export default SendButton;
