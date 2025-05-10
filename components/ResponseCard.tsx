import { Submission } from "../models/Submission";

const ResponseCard = ({ record }: { record: Submission }) => {
  return (
    <div className="w-full max-w-2xl p-6 font-bold text-gray-900 bg-white border rounded shadow-lg">
      <p className="leading-relaxed">
        « Je pense que le bébé sera{" "}
        <span className="text-slate-700 font-nunito">
          {record.Sexe === "M" ? "un petit garçon" : "une petite fille"}
        </span>{" "}
        qui s'appellera{" "}
        <span className="text-slate-700 font-nunito">{record.Prénom}</span>.{" "}
        {record.Sexe === "F" ? "Elle" : "Il"} pèsera{" "}
        <span className="text-slate-700 font-nunito">
          {record.Poids} kilos
        </span>{" "}
        et mesurera{" "}
        <span className="text-slate-700 font-nunito">
          {record.Taille} centimètres
        </span>
        .
        <br />
        {record.Sexe === "F" ? "Elle" : "Il"} naîtra le{" "}
        <span className="text-slate-700 font-nunito">
          {new Date(record.DateDeNaissance).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
          })}
        </span>{" "}
        à{" "}
        <span className="text-slate-700 font-nunito">
          {record.HeureDeNaissance}
        </span>
        . »
      </p>
    </div>
  );
};

export default ResponseCard;
