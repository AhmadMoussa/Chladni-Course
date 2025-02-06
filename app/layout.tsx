import { Fira_Code } from 'next/font/google';
import './globals.css';
import 'katex/dist/katex.min.css';

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
});

export const metadata = {
  title: 'Code Embed Demo',
  description: 'Simple demo page for code embeds',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${firaCode.className} ${firaCode.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
