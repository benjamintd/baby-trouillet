import Airtable from "airtable";
import { useAtom } from "jotai";
import { RESET } from "jotai/utils";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect } from "react";
import ClientOnly from "../components/ClientOnly";
import Confetti from "../components/Confetti";
import ErrorDisplay from "../components/ErrorDisplay";
import GameGrid from "../components/GameGrid";
import GameInput from "../components/GameInput";
import Keyboard from "../components/Keyboard";
import ResponseCard from "../components/ResponseCard";
import SendButton from "../components/SendButton";
import { gameAtom, hasWonAtom, validWordsAtom } from "../core/atoms";
import fr from "../lib/dictionnaries/fr";
import normalizeString from "../lib/normalizeString";
import { Submission } from "../models/Submission";
import photo from "../public/photo.jpg";
import fs from "fs";
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
  const [hasWon] = useAtom(hasWonAtom);
  useEffect(() => {
    setValidWords(possibleNames);
    if (game === null) {
      setGame({
        word: reveal.Prénom,
        turns: [],
      });
    }
  }, [game]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-24 transition-all duration-200 font-intro from-rose-50 bg-gradient-to-br to-indigo-100">
      <Head>
        <title>Baby Bensarah</title>
        <link rel="icon" href="/favicon.png" />
        <meta name="robots" content="noindex" />
        {/* description and open graph */}
        <meta name="description" content="Une bonne nouvelle 🐣" />
        <meta property="og:title" content="Baby Bensarah" />
        <meta
          property="og:image"
          content="https://baby.bensarah.fr/og-image.png"
        />
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 w-full h-full max-w-4xl px-6 text-center md:px-12">
        <h1 className="mb-4 text-6xl text-sky-900 font-intro-bold">
          👋 Une bonne nouvelle
        </h1>
        {record && (
          <>
            <p className="mb-2 text-sm text-sky-900">{`Notre bébé est arrivé ! Voilà ce que tu avais parié :`}</p>
            <div className="mx-auto text-sm">
              <ResponseCard record={record} />
            </div>
          </>
        )}
        <ClientOnly>
          <p className="py-8 text-2xl text-sky-900">
            Nous avons{" "}
            {record?.Sexe &&
              (reveal.Sexe !== record.Sexe ? "en fait " : "en effet ")}
            accueilli{" "}
            <strong className="font-intro-bold">
              {reveal.Sexe === "M"
                ? "un petit garçon 👶🏻"
                : "une petite fille 🐣"}
            </strong>{" "}
            ! {reveal.Sexe === "M" ? "Il" : "Elle"} pèse
            <strong className="font-intro-bold">{` ${reveal.Poids} kg`}</strong>{" "}
            et mesure
            <strong className="font-intro-bold">{` ${reveal.Taille} cm`}</strong>
            .
            <br />
            {reveal.Sexe === "M" ? "Il est né" : "Elle est née"} le{" "}
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

          {!hasWon && (
            <div className="flex-col items-center justify-center w-full h-full">
              <p className="mb-2 text-lg text-sky-900">
                Pour trouver{" "}
                <strong className="font-intro-bold">son prénom</strong>, il
                faudra résoudre ce puzzle ! 🧩
              </p>
              <p className="mb-4 text-sm text-sky-900">
                Tapez un prénom qui rentre dans la grille. Les lettres en rouge
                🔴 sont bien placées, les lettres en orange 🔶 sont dans la
                solution mais mal placées.
              </p>

              <GameGrid />
              <ErrorDisplay />
              <GameInput />
              <Keyboard />
              <SendButton />
            </div>
          )}

          {hasWon && (
            <>
              <p className="pb-8 text-2xl text-sky-900">
                {reveal.Sexe === "M" ? "Il" : "Elle"} s'appelle{" "}
                <strong className="font-intro-bold">{reveal.Prénom}</strong> ❤️
              </p>
              <div className="relative w-full overflow-hidden rounded shadow aspect-video">
                <Image
                  layout="fill"
                  objectFit="cover"
                  src={photo}
                  placeholder="blur"
                />
              </div>
              <p className="mt-2 mb-8 text-gray-800 justify-self-end">
                <button
                  onClick={() => setGame(RESET)}
                  className="border-b border-gray-800"
                >
                  Rejouer
                </button>
              </p>

              <a
                className="pt-8 text-lg underline text-sky-700 whitespace-nowrap underline-offset-2"
                href="https://bientot9mois.fr/liste-naissance/ef1a218c-4a2f-4a91-b621-796ec909d7a4"
              >
                Voir la liste de naissance
              </a>
            </>
          )}
        </ClientOnly>

        <Confetti />
      </main>
    </div>
  );
};

export default Page;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const base = Airtable.base(process.env.AIRTABLE_BASE_ID!);
  const { recordId } = context.req.cookies;

  const reveal: Submission = {
    Nom: "",
    Email: "",
    Adresse: "",
    Prénom: "Constant",
    Sexe: "M",
    Poids: 4.1,
    Taille: 52,
    Cheveux: "Duvet",
    DateDeNaissance: new Date(2022, 11, 15).toISOString(),
    HeureDeNaissance: "23:00",
  };

  const possibleNames = fr
    .replace(/\n/g, " ")
    .split(" ")
    .map(normalizeString)
    .filter((word) => {
      return word.length === reveal.Prénom.length;
    });

  try {
    const rec = await base.table("Pronos").find(recordId as string);

    return {
      props: {
        record: JSON.parse(JSON.stringify(rec.fields)),
        reveal,
        possibleNames,
      },
    };
  } catch (error) {
    return {
      props: {
        reveal,
        possibleNames,
      },
    };
  }
};
