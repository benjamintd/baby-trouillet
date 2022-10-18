import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Submission } from "../models/Submission";
import { useCookie } from "react-use";

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
        </p>

        <form onSubmit={handleSubmit}>
          <div className="w-full max-w-3xl p-6 text-lg font-bold text-gray-900 bg-white border rounded shadow-lg">
            <div className="flex flex-col items-baseline justify-between sm:flex-row">
              <p>Je pense que le bébé sera</p>
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
              </select>
            </div>
            <div className="flex flex-col items-baseline justify-between sm:flex-row">
              <p> qui s'appellera</p>
              <input
                className="input"
                required
                type="text"
                placeholder="Prénom"
                name="Prénom"
                autoComplete="off"
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col items-baseline justify-between sm:flex-row">
              <p>qui pèsera</p>
              <span className="font-mono font-light">
                <input
                  className="w-24 input"
                  required
                  type="number"
                  placeholder="Poids"
                  name="Poids"
                  min={0.0}
                  step="any"
                  lang="fr"
                  max={10.0}
                  onChange={handleInputChange}
                />{" "}
                kg&nbsp;
              </span>
            </div>
            <div className="flex flex-col items-baseline justify-between sm:flex-row">
              <p>et qui mesurera</p>
              <span className="font-mono font-light">
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
                cm.
              </span>
            </div>
            <div className="flex flex-col items-baseline justify-between sm:flex-row">
              <p>{formState.Sexe === "F" ? "Elle" : "Il"} aura une tête</p>
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
            </div>
            <div className="flex flex-col items-baseline justify-between sm:flex-row">
              <p>{formState.Sexe === "F" ? "Elle" : "Il"} naîtra le</p>
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
            </div>
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
            className="button"
            disabled={status === "submitting"}
            type="submit"
          >
            Envoyer
          </button>
        </form>
      </main>
    </div>
  );
};

export default Home;
