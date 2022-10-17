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
        setRecordId(data.id);
      })
      .catch(() => {
        setStatus("error");
      });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Baby Bensarah</title>
        <link rel="icon" href="/favicon.png" />
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 w-full px-20 text-center">
        <h1>Baby Bensarah</h1>

        <p>
          Nous attendons avec impatience la naissance de notre bébé. Pour
          l'occasion, nous avons décidé de faire un petit jeu&nbsp;!
        </p>

        <form className="flex flex-col" onSubmit={handleSubmit}>
          <select name="Sexe" id="Sexe">
            <option value="" disabled selected>
              Select your option
            </option>
            <option value="M">un petit garçon</option>
            <option value="F">une petite fille</option>
          </select>

          <input
            required
            type="text"
            placeholder="Prénom"
            name="Prénom"
            autoComplete="off"
            onChange={handleInputChange}
          />

          <input
            required
            type="number"
            placeholder="Poids"
            name="Poids"
            min={0.0}
            step={0.1}
            max={10.0}
            onChange={handleInputChange}
          />

          <select name="Cheveux" id="Cheveux">
            <option value="" disabled selected>
              Select your option
            </option>
            <option value="Aucun">Aucun</option>
            <option value="Duvet">Duvet</option>
            <option value="Cheveux">Cheveux</option>
          </select>

          <input
            type="date"
            required
            onChange={handleInputChange}
            name="DateDeNaissance"
            value="2022-12-15"
            min="2022-11-01"
            max="2022-12-31"
          />

          <input
            required
            type="time"
            id="HeureDeNaissance"
            name="HeureDeNaissance"
            min="00:00"
            max="24:00"
          />

          <input
            type="text"
            placeholder="Nom"
            name="Nom"
            autoComplete="name"
            onChange={handleInputChange}
            required
          />
          <input
            type="email"
            autoComplete="email"
            name="Email"
            placeholder="Email"
            required
            onChange={handleInputChange}
          />
          <textarea
            placeholder="Adresse"
            name="Adresse"
            autoComplete="street-address"
            required
            onChange={handleInputChange}
          />

          <button disabled={status === "submitting"} type="submit">
            submit
          </button>
        </form>
      </main>
    </div>
  );
};

export default Home;
