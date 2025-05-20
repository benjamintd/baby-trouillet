import ReactConfetti from "react-canvas-confetti";
import { useAtom } from "jotai";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import ClientOnly from "../components/ClientOnly";
import { gameAtom, hasWonMotMeleAtom, validWordsAtom } from "../core/atoms";
import { Submission } from "../models/Submission";
import photo from "../public/dorian.jpeg";
import { hotjar } from "react-hotjar";
import MotsMeles from "../components/MotsMeles";
import { AnimatePresence, motion } from "motion/react";
import colors from "tailwindcss/colors";


// don't forget to change photobb2.png and this data at birth-time. 
export const getServerSideProps: GetServerSideProps = async () => {
  const reveal: Submission = {
    Nom: "",
    Email: "",
    Adresse: "",
    Prénom: "Dorian",
    Sexe: "M",
    Poids: 3.00,
    Taille: 50,
    Cheveux: "Duvet",
    DateDeNaissance: new Date(2022, 5 - 1, 20).toISOString(),
    HeureDeNaissance: "2:11",
  };

  return {
    props: {
      reveal,
    },
  };
};

const Page = ({
  record,
  reveal,
  possibleNames,
}: {
  record: Submission;
  reveal: Submission;
  possibleNames: string[];
}) => {
  const [_, setValidWords] = useAtom(validWordsAtom);
  const [game, setGame] = useAtom(gameAtom);
  const [hasWon] = useAtom(hasWonMotMeleAtom);

  // delayedHasWon is used to switch the view after the confetti animation
  const [delayedHasWon, setDelayedHasWon] = useState(false);
  useEffect(() => {
    if (hasWon) {
      setTimeout(() => {
        setDelayedHasWon(true);
      }, 1500);
    }
  }, [hasWon]);

  useEffect(() => {
    setValidWords(possibleNames);
    if (game === null) {
      setGame({
        word: reveal.Prénom,
        turns: [],
      });
    }
  }, [game]);

  useEffect(() => {
    if (hotjar.initialized() && record?.Email) {
      // Identify the user
      hotjar.identify("USER_ID", { userProperty: record.Email });
    }
  }, [record]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-24 transition-all duration-200 font-nunito from-slate-50 bg-gradient-to-br to-amber-50">
      <Head>
        <title>Baby #2</title>
        <link rel="icon" href="/favicon.png" />
        <meta name="robots" content="noindex" />
        {/* description and open graph */}
        <meta name="description" content="Une bonne nouvelle 🐣" />
        <meta property="og:title" content="Baby #2" />
        <meta
          property="og:image"
          content="https://baby.bensarah.fr/og-image.png"
        />
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 w-full h-full max-w-3xl px-6 text-center md:px-12">
        <h1 className="mb-4 text-4xl xl:text-5xl text-slate-900 font-nunito font-bold">
          👋 La famille s'agrandit&nbsp;!
        </h1>
        <ClientOnly>
          <p className="py-8 text-2xl text-slate-900 text-balance">
            Nous avons accueilli un nouveau membre dans la famille&nbsp;! C'est un
            bébé qui pèse
            <strong className="font-nunito font-bold">{` ${reveal.Poids} kg`}</strong>{" "}
            et mesure
            <strong className="font-nunito font-bold">{` ${reveal.Taille} cm`}</strong>
            , et qui a vu le jour le{" "}
            <strong className="font-nunito font-bold">
              {new Date(reveal.DateDeNaissance).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
              })}
            </strong>{" "}
            à{" "}
            <strong className="font-nunito">
              {reveal.HeureDeNaissance}
            </strong>
            .
          </p>

          <AnimatePresence mode="wait">
            {!delayedHasWon ? (
              <motion.div
                key="game"
                initial={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.8,
                  transition: {
                    duration: 0.5,
                  },
                }}
                className="flex-col items-center justify-center w-full h-full"
              >
                <p className="mb-4 text-2xl text-slate-900 text-balance">
                  Pour trouver{" "}
                  <strong className="font-nunito font-bold">son prénom</strong>, il
                  faudra chercher dans cette grille.
                </p>
                <p className="mb-4 text-slate-900 text-balance">
                  Rayez les prénoms dans la grille (dans toutes les directions,
                  diagonales également !). Vous saurez quand vous aurez trouvé
                  le bon 😉.
                </p>

                <MotsMeles
                  bonusWord={reveal.Prénom.toUpperCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")}
                />
              </motion.div>
            ) : (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.8,
                  scale: { type: "spring", damping: 15, stiffness: 100 },
                }}
              >
                <p className="pb-8 text-2xl text-slate-900">
                  {reveal.Sexe === "M" ? "Il" : "Elle"} s'appelle{" "}
                  <strong className="font-nunito font-bold">{reveal.Prénom}</strong>{" "}
                  ❤️ et nous sommes comblés de bonheur !
                </p>
                <div className="relative w-full overflow-hidden rounded shadow aspect-video">
                  <Image
                    layout="fill"
                    objectFit="cover"
                    src={photo || "/placeholder.svg"}
                    placeholder="blur"
                    alt={`Photo de ${reveal.Prénom}`}
                  />
                </div>
                <p className="mt-2 mb-8 text-gray-800 justify-self-end">
                  <button
                    onClick={() => window.location.reload()}
                    className="border-b border-gray-800 hover:text-slate-700 hover:border-slate-700 transition-colors"
                  >
                    Rejouer
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="fixed top-0 left-0 right-0 w-screen h-screen pointer-events-none">
            <ReactConfetti
              className="w-full h-full"
              fire={hasWon}
              colors={[
                colors.rose[300],
                colors.pink[200],
                colors.slate[700],
                colors.orange[500],
              ]}
              disableForReducedMotion={true}
              resize={true}
              useWorker={true}
              scalar={1}
              ticks={300}
            />
          </div>
        </ClientOnly>
      </main>
    </div>
  );
};

export default Page;
