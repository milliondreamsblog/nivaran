import "./globals.css";

export const metadata = {
  title: "Nivaran | CPGRAMS, rebuilt for citizens",
  description:
    "Describe your problem like you'd tell a friend. Nivaran routes it to the right department, drafts the grievance, and tracks it in plain language.",
};

// Runs before paint so a saved theme preference never flashes light-then-dark.
const THEME_INIT = `
try {
  var t = localStorage.getItem("nivaran-theme");
  if (t === "dark") document.documentElement.setAttribute("data-theme", "dark");
} catch (e) {}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
