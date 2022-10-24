import Airtable from "airtable";
import { useAtom } from "jotai";
import { RESET } from "jotai/utils";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useEffect } from "react";
import Confetti from "../../components/Confetti";
import ErrorDisplay from "../../components/ErrorDisplay";
import GameGrid from "../../components/GameGrid";
import GameInput from "../../components/GameInput";
import Keyboard from "../../components/Keyboard";
import ResponseCard from "../../components/ResponseCard";
import SendButton from "../../components/SendButton";
import { gameAtom, hasWonAtom, validWordsAtom } from "../../core/atoms";
import fr from "../../lib/dictionnaries/fr";
import normalizeString from "../../lib/normalizeString";
import { Submission } from "../../models/Submission";

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
  const [_1, setGame] = useAtom(gameAtom);
  const [hasWon] = useAtom(hasWonAtom);
  useEffect(() => {
    setValidWords(possibleNames);
    setGame({
      word: reveal.Prénom,
      turns: [],
    });
  }, []);

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
        <h1 className="mb-4 text-6xl text-sky-800 font-intro-bold">
          👋 Une bonne nouvelle
        </h1>

        {record && (
          <>
            <p className="mb-8 text-lg text-sky-900">{`Notre bébé est arrivé ! Tu avais parié:`}</p>
            <div className="text-sm">
              <ResponseCard record={record} />
            </div>
          </>
        )}

        <p className="mt-2 text-sky-800 justify-self-end">
          Nous avons{" "}
          {reveal.Sexe && reveal.Sexe !== reveal.Sexe ? "en fait " : ""}
          accueilli{" "}
          {reveal.Sexe === "M" ? "un petit garçon" : "une petite fille"} de
          {` ${reveal.Poids} kg`} et
          {` ${reveal.Taille} cm`} !
          <br />
          {reveal.Sexe === "M" ? "Il est né" : "Elle est née"} le{" "}
          {new Date(reveal.DateDeNaissance).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
          })}{" "}
          à {reveal.HeureDeNaissance}
        </p>

        {!hasWon && (
          <div className="flex-col justify-center w-full h-full">
            <p>Pour trouver son prénom, il faudra résoudre ce puzzle ! 🧩</p>
            <GameGrid />
            <ErrorDisplay />
            <GameInput />
            <Keyboard />
            <SendButton />
          </div>
        )}

        <Confetti />

        {hasWon && (
          <>
            <div className="relative w-full h-64 border">
              {/* here goes some image I guess */}
            </div>
            <p className="mt-2 text-gray-800 justify-self-end">
              <button
                onClick={() => setGame(RESET)}
                className="border-b border-gray-800"
              >
                Rejouer
              </button>
            </p>

            <a
              className="mt-12 button whitespace-nowrap"
              href="https://bientot9mois.fr/liste-naissance/ef1a218c-4a2f-4a91-b621-796ec909d7a4"
            >
              Voir la liste de naissance
            </a>
          </>
        )}
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
    Prénom: "Candide",
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
