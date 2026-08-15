import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { RegisterSw } from "@/components/register-sw";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "NavOS — 网址导航",
	description: "Apple 风格的网址导航系统",
	manifest: "/manifest.webmanifest",
	icons: { icon: "/icon.svg" },
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="zh-CN" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-b from-neutral-100 via-neutral-50 to-white font-sans antialiased dark:from-neutral-950 dark:via-black dark:to-neutral-900`}
			>
				<ThemeProvider>{children}</ThemeProvider>
				<Toaster richColors position="top-center" />
				<RegisterSw />
			</body>
		</html>
	);
}