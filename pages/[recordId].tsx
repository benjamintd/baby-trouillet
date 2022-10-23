import Airtable from "airtable";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useCookie } from "react-use";
import { Submission } from "../models/Submission";

const Page = ({ record }: { record: Submission }) => {
  const [_recordId, _setRecordId, restart] = useCookie("recordId");
  const router = useRouter();

  useEffect(() => {
    if (!record) {
      restart();
      router.replace("/");
    }
  }, []);

  const replay = () => {
    restart();
    router.push("/");
  };

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-24 transition-all duration-200 font-intro from-rose-50 bg-gradient-to-br to-indigo-100" />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-24 transition-all duration-200 font-intro from-rose-50 bg-gradient-to-br to-indigo-100">
      <Head>
        <title>Baby Bensarah</title>
        <link rel="icon" href="/favicon.png" />
        <meta name="robots" content="noindex" />
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 w-full h-full max-w-4xl px-6 text-center md:px-12">
        <h1 className="mb-4 text-6xl text-sky-800 font-intro-bold">
          Baby Bensarah
        </h1>

        <p className="mb-8 text-lg text-sky-900">{`Merci ${record.Nom} d'avoir joué avec nous ! ❤️`}</p>

        <div className="w-full max-w-2xl p-6 font-bold text-gray-900 bg-white border rounded shadow-lg">
          <p className="text-lg leading-relaxed">
            Je pense que le bébé sera{" "}
            <span className="text-sky-700 font-intro-bold">
              {record.Sexe === "M" ? "un petit garçon" : "une petite fille"}
            </span>{" "}
            qui s'appellera{" "}
            <span className="text-sky-700 font-intro-bold">
              {record.Prénom}
            </span>
            . {record.Sexe === "F" ? "Elle" : "Il"} pèsera{" "}
            <span className="text-sky-700 font-intro-bold">
              {record.Poids} kilos
            </span>{" "}
            et mesurera{" "}
            <span className="text-sky-700 font-intro-bold">
              {record.Taille} centimètres
            </span>
            .
            <br />
            {record.Sexe === "F" ? "Elle" : "Il"} aura une tête{" "}
            <span className="text-sky-700 font-intro-bold">
              {record.Cheveux === "Aucun"
                ? "chauve"
                : record.Cheveux === "Duvet"
                ? "duveteuse"
                : "chevelue"}
            </span>
            .
            <br />
            {record.Sexe === "F" ? "Elle" : "Il"} naîtra le{" "}
            <span className="text-sky-700 font-intro-bold">
              {new Date(record.DateDeNaissance).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
              })}
            </span>{" "}
            à{" "}
            <span className="text-sky-700 font-intro-bold">
              {record.HeureDeNaissance}
            </span>
            .
          </p>
        </div>
        <p className="mt-2 text-gray-800 justify-self-end">
          Vous voulez changer votre pari ?{" "}
          <button onClick={replay} className="border-b border-gray-800">
            Rejouer
          </button>
        </p>

        <a
          className="mt-12 button whitespace-nowrap"
          href="https://bientot9mois.fr/liste-naissance/ef1a218c-4a2f-4a91-b621-796ec909d7a4"
        >
          Voir la liste de naissance
        </a>
      </main>
    </div>
  );
};

export default Page;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const base = Airtable.base(process.env.AIRTABLE_BASE_ID!);

  const { recordId } = context.query;
  try {
    const rec = await base.table("Pronos").find(recordId as string);

    return {
      props: {
        record: JSON.parse(JSON.stringify(rec.fields)),
      },
    };
  } catch (error) {
    return {
      props: {},
    };
  }
};
