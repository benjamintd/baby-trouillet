import Airtable from "airtable";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useCookie } from "react-use";
import ResponseCard from "../components/ResponseCard";
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
        {/* description and open graph */}
        <meta
          name="description"
          content="Pronostics pour le bébé Tran Mamy 🐣"
        />
        <meta property="og:title" content="Baby Bensarah" />
        <meta
          property="og:image"
          content="https://baby.bensarah.fr/og-image.png"
        />
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 w-full h-full max-w-4xl px-6 text-center md:px-12">
        <h1 className="mb-4 text-6xl text-sky-900 font-intro-bold">
          Baby Bensarah
        </h1>

        <p className="mb-8 text-lg text-sky-900">{`Merci ${record.Nom} d'avoir joué avec nous ! ❤️`}</p>

        <ResponseCard record={record} />

        <p className="mt-2 text-gray-800 justify-self-end">
          Vous voulez changer votre pari ?{" "}
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
