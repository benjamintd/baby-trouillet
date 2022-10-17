import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Submission } from "../models/Submission";
import { useLocalStorage } from "react-use";

const Home: NextPage = () => {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "error" | "success"
  >("idle");
  const [formState, setFormState] = useState<Partial<Submission>>({});
  const [recordId, setRecordId] = useLocalStorage("recordId", null);

  const router = useRouter();

  useEffect(() => {
    if (recordId) {
      router.replace(`/${recordId}`);
    }
  });

  console.log(formState);

  const handleInputChange = (event: any) => {
    console.log(event.target.type, event.target.value);
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
        setRecordId(data.id);
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
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 w-full max-w-4xl px-20 text-center">
        <h1 className="mb-4 text-6xl text-cyan-800 font-intro-bold">
          Baby Bensarah
        </h1>

        <p className="mb-8 text-lg text-cyan-900">
          Nous attendons avec impatience la naissance de notre bébé. Pour
          l'occasion, nous avons décidé de faire un petit jeu&nbsp;!
        </p>

        <form onSubmit={handleSubmit}>
          <div className="p-6 font-bold text-gray-900 bg-white border rounded shadow-lg">
            <p className="text-lg leading-relaxed">
              Je pense que le bébé sera
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
              qui s'appellera
              <input
                className="input"
                required
                type="text"
                placeholder="Prénom"
                name="Prénom"
                autoComplete="off"
                onChange={handleInputChange}
              />
              , qui pèsera
              <input
                className="w-24 input"
                required
                type="number"
                placeholder="Poids"
                name="Poids"
                min={0.0}
                step={0.1}
                max={10.0}
                onChange={handleInputChange}
              />{" "}
              kilos et qui mesurera
              <input
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
              <br />
              {formState.Sexe === "F" ? "Elle" : "Il"} aura une tête
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
              <br />
              {formState.Sexe === "F" ? "Elle" : "Il"} naîtra le
              <input
                className="input"
                type="date"
                required
                onChange={handleInputChange}
                name="DateDeNaissance"
                defaultValue="2022-12-15"
                min="2022-11-01"
                max="2022-12-31"
              />
              à
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
            className="px-10 py-4 text-2xl text-white transition-all rounded-full hover:-translate-y-px hover:shadow-lg shadow-pink-600/50 bg-gradient-to-br from-pink-800 to-blue-800 font-intro-bold"
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
