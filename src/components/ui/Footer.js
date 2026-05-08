import Link from "next/link";
import Container from "./Container";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0b0f14]">
      <Container>
        <div className="flex flex-col gap-4 py-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; AXO Created by me/ Mostafa Salah Abdallah @ ITI - Assiut branch Web&UI</p>

          <div className="flex items-center gap-4">
          </div>
        </div>
      </Container>
    </footer>
  );
}
