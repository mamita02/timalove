import logo from "@/assets/logo.png"; // ✅ Import Vite
import { Facebook, Heart, Instagram, Twitter, Youtube } from "lucide-react";

const footerLinks = [
  { label: "Accueil", href: "#" },
  { label: "Qui suis-je ?", href: "#about" },
  { label: "Comment ça marche", href: "#concept" },
  { label: "Avis", href: "#avis" },
  { label: "Contact", href: "#contact" },
  { label: "Mentions légales", href: "/legal" },
  { label: "CGU", href: "/legal" },
];

export const Footer = () => {
  return (
    <footer className="bg-[#FFF9F9] pt-16 pb-8 border-t border-rose-100">
      <div className="container mx-auto px-4 flex flex-col items-center">
        
        {/* 1. LOGO CENTRAL */}
        <div className="mb-8">
          <img
            src={logo}
            alt="TimaLove Logo"
            className="h-20 w-auto object-contain"
          />
        </div>

        {/* 2. SECTION REJOIGNEZ-NOUS */}
        <div className="w-full max-w-4xl flex items-center gap-6 mb-8">
          <div className="h-[1px] flex-1 bg-primary/30" />
          <h4 className="text-primary font-bold tracking-[0.3em] uppercase text-sm md:text-base whitespace-nowrap">
            Rejoignez-nous
          </h4>
          <div className="h-[1px] flex-1 bg-primary/30" />
        </div>

        {/* 3. RÉSEAUX SOCIAUX */}
        <div className="flex gap-4 mb-10">
          {[
            { Icon: Facebook, href: "#" },
            { Icon: Twitter, href: "#" },
            { Icon: Youtube, href: "#" },
            { Icon: Instagram, href: "#" },
          ].map((social, index) => (
            <a
              key={index}
              href={social.href}
              className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-white hover:bg-primary transition-colors duration-300 shadow-md"
            >
              <social.Icon size={18} />
            </a>
          ))}
        </div>

        {/* 4. NAVIGATION */}
        <nav className="mb-12">
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {footerLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-slate-700 hover:text-primary font-bold text-[11px] md:text-xs uppercase tracking-widest transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* 5. COPYRIGHT */}
        <div className="w-full pt-8 border-t border-rose-100/50 flex flex-col items-center gap-4">
          <p className="text-[10px] md:text-xs text-slate-400 text-center uppercase tracking-wider">
            Copyright © {new Date().getFullYear()} TimaLove. Tous droits réservés.
          </p>
          
          <div className="flex items-center gap-2 text-[10px] text-slate-400 italic">
            <span>Fait avec</span>
            <Heart size={10} className="text-primary fill-primary" />
            <span>pour de vraies rencontres</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
