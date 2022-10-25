import { Submission } from "../models/Submission";

const ResponseCard = ({ record }: { record: Submission }) => {
  return (
    <div className="w-full max-w-2xl p-6 font-bold text-gray-900 bg-white border rounded shadow-lg">
      <p className="leading-relaxed">
        « Je pense que le bébé sera{" "}
        <span className="text-sky-700 font-intro-bold">
          {record.Sexe === "M" ? "un petit garçon" : "une petite fille"}
        </span>{" "}
        qui s'appellera{" "}
        <span className="text-sky-700 font-intro-bold">{record.Prénom}</span>.{" "}
        {record.Sexe === "F" ? "Elle" : "Il"} pèsera{" "}
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
        . »
      </p>
    </div>
  );
};

export default ResponseCard;
