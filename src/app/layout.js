import Footer from "@/components/ui/Footer";
import Navbar from "@/components/ui/Navbar";
import Container from "@/components/ui/Container";
import "./globals.css";

export const metadata = {
  title: "AXO",
  description: "E-commerce for accessories to practice NEXT.js that we have learned in ITI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0b0f14] text-white antialiased">
        <Navbar />
        <main className="min-h-[calc(100vh-8rem)] py-8">
          <Container>{children}</Container>
        </main>
        <Footer />
      </body>
    </html>
  );
}
