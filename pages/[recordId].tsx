import Airtable from "airtable";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { Submission } from "../models/Submission";

const Page = ({ record }: { record: Submission }) => {
  return (
    <div>
      <Head>
        <title>Baby Bensarah</title>
        <link rel="icon" href="/favicon.png" />
        <meta name="robots" content="noindex" />
      </Head>

      <h1>{JSON.stringify(record)}</h1>
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
