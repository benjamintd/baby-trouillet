import { useAtom } from "jotai";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import ClientOnly from "../components/ClientOnly";
import Confetti from "../components/Confetti";
import { gameAtom, hasWonMotMeleAtom, validWordsAtom } from "../core/atoms";
import { Submission } from "../models/Submission";
import photo from "../public/photobb2.png";
import { hotjar } from "react-hotjar";
import MotsMeles from "../components/MotsMeles";
import { AnimatePresence, motion } from "motion/react";

export const getServerSideProps: GetServerSideProps = async () => {
  const reveal: Submission = {
    Nom: "",
    Email: "",
    Adresse: "",
    Prénom: "Sarah",
    Sexe: "F",
    Poids: 3.21,
    Taille: 51,
    Cheveux: "Duvet",
    DateDeNaissance: new Date(2022, 5 - 1, 27).toISOString(),
    HeureDeNaissance: "7:11",
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
    <div className="flex flex-col items-center justify-center min-h-screen py-24 transition-all duration-200 font-intro from-rose-50 bg-gradient-to-br to-indigo-100">
      <Head>
        <title>Baby Bensarah</title>
        <link rel="icon" href="/favicon.png" />
        <meta name="robots" content="noindex" />
        {/* description and open graph */}
        <meta name="description" content="La famille s'agrandit ! 🐣" />
        <meta property="og:title" content="Baby Bensarah" />
        <meta
          property="og:image"
          content="https://baby.bensarah.fr/og-image.png"
        />
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 w-full h-full max-w-3xl px-6 text-center md:px-12">
        <h1 className="mb-4 text-6xl text-sky-900 font-intro-bold">
          👋 La famille s'agrandit&nbsp;!
        </h1>
        <ClientOnly>
          <p className="py-8 text-2xl text-sky-900">
            Nous avons accueilli un nouveau membre dans la famille ! C'est un
            beau bébé qui pèse
            <strong className="font-intro-bold">{` ${reveal.Poids} kg`}</strong>{" "}
            et mesure
            <strong className="font-intro-bold">{` ${reveal.Taille} cm`}</strong>
            , et qui a vu le jour le{" "}
            <strong className="font-intro-bold">
              {new Date(reveal.DateDeNaissance).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
              })}
            </strong>{" "}
            à{" "}
            <strong className="font-intro-bold">
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
                <p className="mb-2 text-lg text-sky-900">
                  Pour trouver{" "}
                  <strong className="font-intro-bold">son prénom</strong>, il
                  faudra chercher dans cette grille ! 🧩
                </p>
                <p className="mb-4 text-sky-900">
                  Rayez les prénoms dans la grille (dans toutes les directions).
                  Vous saurez quand vous aurez trouvé le bon 😉.
                </p>

                <MotsMeles bonusWord={reveal.Prénom.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")} />
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
                <p className="pb-8 text-2xl text-sky-900">
                  {reveal.Sexe === "M" ? "Il" : "Elle"} s'appelle{" "}
                  <strong className="font-intro-bold">{reveal.Prénom}</strong>{" "}
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
                    className="border-b border-gray-800 hover:text-sky-700 hover:border-sky-700 transition-colors"
                  >
                    Rejouer
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </ClientOnly>

        <Confetti />
      </main>
    </div>
  );
};

export default Page;

