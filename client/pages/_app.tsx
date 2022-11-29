import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Flowbite, useThemeMode } from 'flowbite-react'
import Header from '../components/Header'
import { useEffect, useState } from 'react'
import { ActivePage } from '../interfaces/Client'
import Main from '../components/Main'
import DsFooter from '../components/DsFooter'
import { useRouter } from 'next/router'
import Head from 'next/head'


export default function App({ Component, pageProps }: AppProps) {
  const [mode, setMode, toggleMode] = useThemeMode(true);
  const activePath = useRouter().pathname;
  const currentPath = () => {
    let basePath = activePath.split("/")[1];
    switch (basePath) {
      case "":
        return ActivePage.Home;
      case "blog":
        return ActivePage.Blog;
      case "series":
        return ActivePage.Series;
      case "services":
        return ActivePage.Services;
      case "contact":
        return ActivePage.Contact;
      default:
        return ActivePage.Home;
    }
  }

  const [activePage, setActivePage] = useState<ActivePage>(currentPath())
  useEffect(() => setMode("dark"))
  return (
    <Flowbite>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Main>
        <header className="sticky top-0 z-50">
          <Header activePage={activePage} setActivePage={setActivePage} />
        </header>
        <Component {...pageProps} />
        <DsFooter />
      </Main>
      
    </Flowbite>)
}
