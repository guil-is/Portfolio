import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { site } from "@/content/site";

// Google Fonts are loaded via a runtime stylesheet link (instead of
// next/font/google) because the build sandbox cannot reach fonts.googleapis.com.
// The user's browser will fetch these at runtime. Neueaugenblick is served
// locally from /public/fonts/ via @font-face in globals.css.
const googleFontsHref =
  "https://fonts.googleapis.com/css2" +
  "?family=Inter:wght@300;400;500;600;700" +
  "&family=Public+Sans:wght@400;500;600;700" +
  "&display=swap";

export const metadata: Metadata = {
  metadataBase: new URL("https://guil.is"),
  title: site.metaTitle,
  description: site.description,
  openGraph: {
    title: site.metaTitle,
    description: site.description,
    type: "website",
    url: "https://guil.is",
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: site.metaTitle,
    description: site.description,
    creator: "@guil_is",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={googleFontsHref} />
      </head>
      <body className="min-h-full bg-bg text-body">
        {/* Set dark mode if user's local hour is before 7am or after 7pm,
            unless they've already chosen a theme via the toggle. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme');if(!s||s==='"system"'){var h=new Date().getHours();document.documentElement.classList.toggle('dark',h<7||h>=19)}}catch(e){}})()`,
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
