import ReactConfetti from "react-canvas-confetti";
import ClientOnly from "../components/ClientOnly";
import colors from "tailwindcss/colors";
import { useAtom } from "jotai";
import { hasWonAtom, hasWonMotMeleAtom } from "../core/atoms";

const ConfettiCanvas = () => {
  const [hasWon] = useAtom(hasWonAtom);
  const [hasWonMotMele] = useAtom(hasWonMotMeleAtom);

  return (
    <div className="fixed top-0 left-0 right-0 w-screen h-screen pointer-events-none">
      <ReactConfetti
        className="w-full h-full"
        fire={hasWon || hasWonMotMele}
        colors={[
          colors.rose[300],
          colors.pink[200],
          colors.sky[700],
          colors.orange[500],
        ]}
        disableForReducedMotion={true}
        resize={true}
        useWorker={true}
        scalar={1}
        ticks={300}
      />
    </div>
  );
};

const Confetti = () => (
  <ClientOnly>
    <ConfettiCanvas />
  </ClientOnly>
);

export default Confetti;
