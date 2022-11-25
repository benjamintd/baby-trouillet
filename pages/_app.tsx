import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { hotjar } from "react-hotjar";

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    hotjar.initialize(1787488, 6);
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
