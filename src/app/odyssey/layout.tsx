import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Odyssey | Guil Maueler",
  description: "Private pitch page",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function OdysseyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
