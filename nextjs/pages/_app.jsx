import Head from 'next/head'
import { NextUIProvider } from '@nextui-org/react';

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import '../app/globals.css'

import { Outfit } from 'next/font/google'
const outfit = Outfit({ subsets: ['latin'] })

function App({ Component, pageProps, ...rest}) {
    return (
        <>
            <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0,user-scalable=0" />
            </Head>

            <main className={outfit.className}>
                <NextUIProvider>
                    <Header />
                    <Component {...pageProps} />
                    <Footer />
                </NextUIProvider>
            </main>
        </>
    );
}

export default App