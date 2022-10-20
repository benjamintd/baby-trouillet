import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Submission } from "../models/Submission";
import { useCookie } from "react-use";
import LoadingDots from "../components/LoadingDots";
import classNames from "classnames";

const Home: NextPage = () => {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "error" | "success"
  >("idle");
  const [formState, setFormState] = useState<Partial<Submission>>({
    DateDeNaissance: "2022-12-15",
  });
  const [recordId, setRecordId] = useCookie("recordId");

  const router = useRouter();

  useEffect(() => {
    if (recordId) {
      router.replace(`/${recordId}`);
    }
  });

  const handleInputChange = (event: any) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    setFormState((state) => ({
      ...state,
      [name]: value,
    }));
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();

    setStatus("submitting");
    fetch("/api/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formState),
    })
      .then((res) => res.json())
      .then((data) => {
        setStatus("success");
        setRecordId(data.id, { sameSite: "lax", expires: 365 });
      })
      .catch(() => {
        setStatus("error");
      });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-24 transition-all duration-200 font-intro from-pink-50 bg-gradient-to-br to-blue-50">
      <Head>
        <title>Baby Bensarah</title>
        <link rel="icon" href="/favicon.png" />
        <meta name="robots" content="noindex" />
        {/* description and open graph */}
        <meta name="description" content="Pronistics pour le bébé Tran Mamy." />
        <meta property="og:title" content="Baby Bensarah" />
        <meta
          property="og:image"
          content="https://baby.bensarah.fr/og-image.png"
        />
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 w-full max-w-4xl px-6 text-center md:px-12">
        <h1 className="mb-4 text-6xl text-cyan-800 font-intro-bold">
          Baby Bensarah
        </h1>

        <p className="mb-8 text-lg text-cyan-900">
          Nous attendons avec impatience la naissance de notre bébé. Pour
          l'occasion, nous avons décidé de faire un petit jeu&nbsp;!
          <br />À la clé, une bouteille de champagne 🍾 et une rencontre
          exclusive avec l'enfant 🤗.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="w-full max-w-5xl p-6 text-base font-bold text-left text-gray-900 bg-white border rounded shadow md:text-lg shadow-teal-900/20">
            <p className="mb-4">
              Je pense que le bébé sera{" "}
              <select
                onChange={handleInputChange}
                className="input"
                name="Sexe"
                id="Sexe"
              >
                <option value="" disabled selected>
                  choisir...
                </option>
                <option value="M">un petit garçon</option>
                <option value="F">une petite fille</option>
              </select>{" "}
              qui s'appellera{" "}
              <input
                className="w-40 input"
                required
                type="text"
                placeholder="Prénom"
                name="Prénom"
                autoComplete="off"
                onChange={handleInputChange}
              />
              .
            </p>
            <p className="mb-4">
              {formState.Sexe === "F" ? "Elle" : "Il"} pèsera{" "}
              <input
                className="w-24 input"
                required
                type="number"
                placeholder="Poids"
                name="Poids"
                min={0.0}
                step={0.01}
                lang="fr"
                max={10.0}
                onChange={handleInputChange}
              />{" "}
              kilos et mesurera{" "}
              <input
                lang="fr"
                className="w-24 input"
                required
                type="number"
                placeholder="Taille"
                name="Taille"
                min={0}
                step={1}
                max={100}
                onChange={handleInputChange}
              />{" "}
              centimètres.
            </p>
            <p className="mb-4">
              {formState.Sexe === "F" ? "Elle" : "Il"} aura une tête{" "}
              <select
                onChange={handleInputChange}
                className="input"
                name="Cheveux"
                id="Cheveux"
              >
                <option value="" disabled selected>
                  choisir...
                </option>
                <option value="Aucun">chauve</option>
                <option value="Duvet">duveteuse</option>
                <option value="Cheveux">chevelue</option>
              </select>
              .
            </p>
            <p className="mb-4">
              {formState.Sexe === "F" ? "Elle" : "Il"} naîtra le
              <span className="text-left">
                <input
                  className="input"
                  type="date"
                  required
                  onChange={handleInputChange}
                  name="DateDeNaissance"
                  defaultValue="2022-12-15"
                  min="2022-11-01"
                  max="2022-12-31"
                />{" "}
                à{" "}
                <input
                  onChange={handleInputChange}
                  className="input"
                  required
                  type="time"
                  id="HeureDeNaissance"
                  name="HeureDeNaissance"
                  min="00:00"
                  max="24:00"
                />
                .
              </span>
            </p>
          </div>
          <div className="mb-12">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col items-start mt-6">
                <label htmlFor="Nom">Votre nom</label>
                <input
                  id="Nom"
                  className="w-full secondary-input"
                  type="text"
                  placeholder="Nom"
                  name="Nom"
                  autoComplete="name"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex flex-col items-start mt-6">
                <label htmlFor="Nom">Votre email</label>
                <input
                  className="w-full secondary-input"
                  type="email"
                  autoComplete="email"
                  name="Email"
                  placeholder="Email"
                  required
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="flex flex-col items-start mt-6">
              <label htmlFor="Nom">
                Votre adresse (pour les faire-parts !)
              </label>
              <textarea
                className="w-full secondary-input"
                placeholder="1 rue de la Paix, 75001 Paris"
                name="Adresse"
                autoComplete="street-address"
                required
                onChange={handleInputChange}
              />
            </div>
          </div>

          <button
            className={classNames("mx-auto button text-center", {
              "!text-transparent": status === "submitting",
            })}
            disabled={status === "submitting"}
            type="submit"
          >
            {status === "submitting" && (
              <LoadingDots className="absolute text-white" />
            )}
            {status === "idle" || status === "submitting"
              ? "Envoyer"
              : status === "error"
              ? "Erreur 🙃"
              : status === "success"
              ? "Envoyé ✨"
              : "Envoyer"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default Home;
