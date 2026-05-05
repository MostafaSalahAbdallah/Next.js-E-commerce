import Footer from "@/components/ui/Footer";
import Navbar from "@/components/ui/Navbar";
import Container from "@/components/ui/Container";
import "./globals.css";

export const metadata = {
  title: "Ecommerce App",
  description: "Modern ecommerce store built with Next.js and MongoDB.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-950 antialiased">
        <Navbar />
        <main className="min-h-[calc(100vh-8rem)] py-8">
          <Container>{children}</Container>
        </main>
        <Footer />
      </body>
    </html>
  );
}
