import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { ConditionalNavbar } from "@/components/common/ConditionalNavbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        default: "ProjectNova - Defense-Ready Software Projects",
        template: "%s | ProjectNova"
    },
    description: "Premium academic software projects with viva preparation. Get code, videos, documentation, and expert support for your final year project.",
    keywords: ["academic projects", "software projects", "viva preparation", "MERN stack", "ML projects", "AI projects"],
    authors: [{ name: "ProjectNova" }],
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://projectnova.com",
        siteName: "ProjectNova",
        title: "ProjectNova - Defense-Ready Software Projects",
        description: "Premium academic software projects with viva preparation",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "ProjectNova"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "ProjectNova - Defense-Ready Software Projects",
        description: "Premium academic software projects with viva preparation",
        images: ["/og-image.png"],
    },
    robots: {
        index: true,
        follow: true,
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark smooth-scroll">
            <body className={`${inter.className} custom-scrollbar`}>
                <Providers>
                    <ConditionalNavbar />
                    {children}
                    <Toaster />
                </Providers>
            </body>
        </html>
    );
}
