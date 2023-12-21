import { AppProps } from "next/app";
import { useEffect, useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [render, setRender] = useState(false);
  useEffect(() => setRender(true), []);
  return render ? <Component {...pageProps} /> : null;
}
