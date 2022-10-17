import type { NextApiRequest, NextApiResponse } from "next";
import Airtable from "airtable";

const base = Airtable.base(process.env.AIRTABLE_BASE_ID!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ id: string }>
) {
  const {
    Nom,
    Email,
    Adresse,
    Sexe,
    Prénom,
    Poids,
    Cheveux,
    DateDeNaissance,
    HeureDeNaissance,
    Taille,
  } = req.body;

  const data = await base("Pronos").create([
    {
      fields: {
        Nom,
        Email,
        Adresse,
        Sexe,
        Prénom,
        Poids: +Poids,
        Cheveux,
        Taille: +Taille,
        DateDeNaissance,
        HeureDeNaissance,
      },
    },
  ]);

  return res.status(200).json({ id: data[0].getId() });
}
