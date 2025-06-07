import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles.css";
import "@mantine/core/styles.css";
import {
  ColorSchemeScript,
  createTheme,
  MantineColorsTuple,
  mantineHtmlProps,
  MantineProvider,
} from "@mantine/core";
import StoreProvider from "./StoreProvider";
import { NextIntlClientProvider } from "next-intl";

const orange: MantineColorsTuple = [
  "#fff8e1",
  "#ffefcb",
  "#ffdd9a",
  "#ffca64",
  "#ffba38",
  "#ffb01b",
  "#ffa903",
  "#e39500",
  "#cb8400",
  "#b07100",
];

const greenish: MantineColorsTuple = [
  "#e1ffec",
  "#cbffdd",
  "#99ffbb",
  "#62ff97",
  "#3dff7d",
  "#18ff64",
  "#00ff59",
  "#00e349",
  "#00ca3e",
  "#00af30",
];

const gray: MantineColorsTuple = [
  "#f1f4fe",
  "#e3e5ed",
  "#c7c9d4",
  "#a8abbb",
  "#8d92a5",
  "#7d8299",
  "#747a94",
  "#696f8a",
  "#565c75",
  "#484f69",
];
const theme = createTheme({
  colors: {
    orange,
    greenish,
    gray,
  },
  radius: {
    xs: "1em",
  },
  defaultRadius: "0.25em",

  shadows: {
    md: "1px 10px 3px rgba(0, 0, 0, .25)",
    xl: "5px 5px 3px rgba(0, 0, 0, .25)",
  },

  headings: {
    fontFamily: "Roboto, sans-serif",
    sizes: {
      h1: { fontSize: "3px" },
    },
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
        <MantineProvider theme={theme}>
          <NextIntlClientProvider>
            <StoreProvider>{children}</StoreProvider>
          </NextIntlClientProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
