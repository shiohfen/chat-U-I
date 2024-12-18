import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css";
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
const inter = Inter({
  subsets: ['latin'], // Choose the font subsets you need
  weights: [400, 500, 600], // Optional: Set the weights you need
});

export const metadata = {
  title: "Chat U&I",
  description: "A platform for dynamic and interactive conversations, where users can engage in meaningful discussions and explore various topics together.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider  appearance={{
      baseTheme: dark,
    }}>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.className} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}

          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
