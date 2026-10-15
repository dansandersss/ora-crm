import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
    weight: [
        "100",
        "200",
        "300",
        "400",
        "500",
        "600",
        "700",
        "800",
        "900",
    ],
});

export const metadata: Metadata = {
    title: {
        default: "ORA Control Panel",
        template: "%s | ORA Control Panel",
    },
    description: "Panoul securizat pentru echipa ORA.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="ro"
            className={`${inter.variable} h-full antialiased`}
        >
        <body className="min-h-full">{children}</body>
        </html>
    );
}