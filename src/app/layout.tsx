import "./globals.css";

import { Inter, M_PLUS_Rounded_1c, Pacifico } from "next/font/google";

import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { SiteContextProvider } from "@/context/SiteContext";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });
const pacifico = Pacifico({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-pacifico",
});
const hebfont = M_PLUS_Rounded_1c({
    weight: ["500", "800", "900"],
    subsets: ["hebrew"],
});
export const metadata: Metadata = {
    title: "Trip Points",
    description: "Generated by create next app",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html dir="ltr" suppressHydrationWarning={true}>
            <body
                className={cn(
                    pacifico.variable,
                    inter.className,
                    hebfont.className,
                    "font-hebfont"
                )}
            >
                <SiteContextProvider>
                    <Navbar />
                    <Head>
                        <meta
                            name="viewport"
                            content="width=device-width, initial-scale=1, maximum-scale=1"
                        />
                    </Head>

                    <main>{children}</main>
                </SiteContextProvider>
                <Toaster />
            </body>
        </html>
    );
}
