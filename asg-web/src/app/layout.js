import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Avinash Professional Platform",
  description: "Avinash Professional Profile, E-Commerce, Webinars, and Consulting",
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import Particles from "@/components/Particles";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <CartProvider>
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '1080px',
            height: '1080px',
            zIndex: -1,
            pointerEvents: 'none'
          }}>
            <Particles
              particleCount={200}
              particleSpread={10}
              speed={0.1}
              particleColors={["#000000", "#000000"]}
              moveParticlesOnHover
              particleHoverFactor={1}
              alphaParticles={false}
              particleBaseSize={100}
              sizeRandomness={1}
              cameraDistance={20}
              disableRotation={false}
            />
          </div>
          <Navbar />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
