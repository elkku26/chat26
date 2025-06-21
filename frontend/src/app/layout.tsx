import type { Metadata } from "next";
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

const beige: MantineColorsTuple = [
  "#fef2f5",
  "#eae6e7",
  "#cdcdcd",
  "#b2b2b2",
  "#9a9a9a",
  "#8b8b8b",
  "#848484",
  "#6e6e6e",
  "#676465",
  "#5e5457",
];

const black: MantineColorsTuple = [
  "#f5f5f5",
  "#e7e7e7",
  "#cdcdcd",
  "#b2b2b2",
  "#9a9a9a",
  "#8b8b8b",
  "#848484",
  "#717171",
  "#656565",
  "#000000",
];
const red: MantineColorsTuple = [
  "#ffe8e8",
  "#ffcfcf",
  "#ff9c9c",
  "#fe6565",
  "#fd3937",
  "#fe1e1a",
  "#fe0e0b",
  "#e80000",
  "#cb0000",
  "#b10000",
];
const theme = createTheme({
  colors: {
    greenish,
    beige,
    black,
    red,
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
