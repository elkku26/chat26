import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  ColorSchemeScript,
  createTheme,
  mantineHtmlProps,
  MantineProvider,
} from "@mantine/core";
import StoreProvider from "./StoreProvider";
import { NextIntlClientProvider } from "next-intl";

const theme = createTheme({
  headings: {
    fontFamily: "Trebuchet MS",
  },
});

export const metadata: Metadata = {
  title: "Chat26",
  description: "Chat app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <NextIntlClientProvider>
          <StoreProvider>
            <MantineProvider theme={theme}>{children}</MantineProvider>
          </StoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
