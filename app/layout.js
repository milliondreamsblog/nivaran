import "./globals.css";

export const metadata = {
  title: "Nivaran | CPGRAMS, rebuilt for citizens",
  description:
    "Describe your problem like you'd tell a friend. Nivaran routes it to the right department, drafts the grievance, and tracks it in plain language.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
