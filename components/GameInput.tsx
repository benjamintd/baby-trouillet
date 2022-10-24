import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { isMobile } from "react-device-detect";
import { currentTypedAtom } from "../core/atoms";
import useTypeWord from "../hooks/useTypeWord";
import useValidateWord from "../hooks/useValidateWord";

const GameInput = () => {
  const [currentTyped] = useAtom(currentTypedAtom);
  const validateWord = useValidateWord();
  const typeWord = useTypeWord();

  // force autofocus on mount,
  // except for mobile devices to avoid showing the virtual keyboard.
  const el = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (el.current && !isMobile) {
      el.current.focus();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    typeWord(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { key } = e;
    if (key === "Enter") {
      validateWord();
    }
  };

  return (
    <input
      className="w-0 h-0 overflow-hidden bg-transparent border-none focus:border-none focus:ring-0"
      ref={el}
      id="input"
      value={currentTyped}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      type="text"
      autoFocus={!isMobile}
      onBlur={(e) => e.currentTarget.focus()}
    />
  );
};

export default GameInput;
