import { Fira_Code } from 'next/font/google';
import './globals.css';
import 'katex/dist/katex.min.css';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
});

export const metadata = {
  title: 'Code Embed Demo',
  description: 'Simple demo page for code embeds',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body className={`${firaCode.className} ${firaCode.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
