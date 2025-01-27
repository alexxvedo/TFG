import "./globals.css";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Providers } from "@/components/providers";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "FlashMaster",
  description: "Tu app de flashcards inteligente",
};

// Configuración del viewport según la nueva API
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark h-full">
        <body className={`${inter.className} h-full bg-[#0a0b0f] text-white antialiased`}>
          <Providers>
            <div className="relative flex h-full">
              <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-background/95">
                <main className="flex-1 relative">
                  <div className="no-flicker">{children}</div>
                </main>
              </div>
            </div>
            <ToastContainer
              position="bottom-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
              toastClassName="glass"
            />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
