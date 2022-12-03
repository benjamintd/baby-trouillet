import { Transition } from "@headlessui/react";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { errorAtom } from "../core/atoms";

const ErrorDisplay = () => {
  const [error, setError] = useAtom(errorAtom);

  // the display is responsible for depiling errors
  useEffect(() => {
    if (error !== null) {
      const timeout = setTimeout(() => {
        setError(null);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [error, setError]);

  return (
    <div className="relative w-full h-6">
      <Transition
        show={!!error}
        enter="transition-all duration-75 ease-out"
        enterFrom="opacity-0 -mt-6"
        enterTo="opacity-100 mt-0"
        leave="transition-all duration-200 ease-in-out"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="absolute top-0 w-full text-center"
      >
        {error}
      </Transition>
    </div>
  );
};

export default ErrorDisplay;
