import Airtable from "airtable";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useLocalStorage } from "react-use";
import { Submission } from "../models/Submission";

const Page = ({ record }: { record: Submission }) => {
  const [_a, _b, restart] = useLocalStorage("recordId", null);
  const router = useRouter();

  const replay = () => {
    restart();
    router.push("/");
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-24 transition-all duration-200 font-intro from-pink-50 bg-gradient-to-br to-blue-50">
      <Head>
        <title>Baby Bensarah</title>
        <link rel="icon" href="/favicon.png" />
        <meta name="robots" content="noindex" />
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 w-full h-full max-w-4xl px-20 text-center">
        <h1 className="mb-4 text-6xl text-cyan-800 font-intro-bold">
          Baby Bensarah
        </h1>

        <p className="mb-8 text-lg text-cyan-900">{`Merci ${record.Nom} d'avoir joué avec nous ! ❤️`}</p>

        <div className="p-6 font-bold text-gray-900 bg-white border rounded shadow-lg">
          <p className="text-lg leading-relaxed">
            Je pense que le bébé sera{" "}
            <span className="text-cyan-700 font-intro-bold">
              {record.Sexe === "M" ? "un petit garçon" : "une petite fille"}
            </span>{" "}
            qui s'appellera{" "}
            <span className="text-cyan-700 font-intro-bold">
              {record.Prénom}
            </span>
            , qui pèsera{" "}
            <span className="text-cyan-700 font-intro-bold">
              {record.Poids} kilos
            </span>{" "}
            et qui mesurera{" "}
            <span className="text-cyan-700 font-intro-bold">
              {record.Taille} centimètres
            </span>
            .
            <br />
            {record.Sexe === "F" ? "Elle" : "Il"} aura une tête{" "}
            <span className="text-cyan-700 font-intro-bold">
              {record.Cheveux === "Aucun"
                ? "chauve"
                : record.Cheveux === "Duvet"
                ? "duveteuse"
                : "chevelue"}
            </span>
            .
            <br />
            {record.Sexe === "F" ? "Elle" : "Il"} naîtra le{" "}
            <span className="text-cyan-700 font-intro-bold">
              {new Date(record.DateDeNaissance).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
              })}
            </span>{" "}
            à{" "}
            <span className="text-cyan-700 font-intro-bold">
              {record.HeureDeNaissance}
            </span>
            .
          </p>
        </div>
        <p className="mt-2 text-gray-800 justify-self-end">
          Ce n'est pas mon pari !{" "}
          <button onClick={replay} className="border-b border-gray-800">
            Rejouer
          </button>
        </p>
      </main>
    </div>
  );
};

export default Page;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const base = Airtable.base(process.env.AIRTABLE_BASE_ID!);

  const { recordId } = context.query;
  const rec = await base.table("Pronos").find(recordId as string);
  console.log(rec, rec.fields);
  return {
    props: {
      record: JSON.parse(JSON.stringify(rec.fields)),
    },
  };
};
