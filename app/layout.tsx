import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Chat App",
  description: "Real-time chat with AI assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('theme');
                  if (stored) {
                    const theme = JSON.parse(stored);
                    const root = document.documentElement;
                    
                    // Remove all theme classes
                    root.classList.remove(
                      'light', 'dark',
                      'theme-pink', 'theme-blue', 'theme-green', 
                      'theme-purple', 'theme-orange', 'theme-teal'
                    );
                    
                    // Apply color theme
                    if (theme.color && theme.color !== 'default') {
                      root.classList.add('theme-' + theme.color);
                    }
                    
                    // Apply mode theme
                    if (theme.mode === 'system') {
                      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                      root.classList.add(systemTheme);
                    } else if (theme.mode) {
                      root.classList.add(theme.mode);
                    }
                  }
                } catch (e) {
                  // Fallback: try legacy format
                  const legacy = localStorage.getItem('theme');
                  if (legacy && ['light', 'dark', 'system'].includes(legacy)) {
                    const root = document.documentElement;
                    root.classList.remove('light', 'dark');
                    if (legacy === 'system') {
                      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                      root.classList.add(systemTheme);
                    } else {
                      root.classList.add(legacy);
                    }
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
