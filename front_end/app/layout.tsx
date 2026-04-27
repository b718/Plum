import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SearchProvider } from "@/components/context/SearchContext";

import "./globals.css";

export const metadata: Metadata = {
	title: "Plum",
	description: "Find clothes with words",
	icons: {
		icon: "plum.svg",
		apple: "plum.svg",
		shortcut: "plum.svg",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={"h-full antialiased"}>
			<SearchProvider>
				<body className="min-h-full flex flex-col">{children}</body>
			</SearchProvider>
		</html>
	);
}
