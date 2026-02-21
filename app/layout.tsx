import "./globals.css";

export const metadata = {
  title: "ANGELS OF CODES",
  description: "Sistema interno",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}