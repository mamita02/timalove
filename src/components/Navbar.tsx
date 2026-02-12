import logo from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, UserCircle, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/qui-suis-je", label: "Qui suis-je ?" },
  { href: "/?scroll=concept", label: "Comment ça marche" },
  { href: "/?scroll=temoignages", label: "Avis" },
  { href: "/?scroll=contact", label: "Contact" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FFF5F5]/90 backdrop-blur-md border-b border-rose-100/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">

          {/* LOGO */}
          <Link
            to="/"
            className="hover:opacity-80 transition-opacity scale-90 origin-left"
          >
            <img
              src={logo}
              alt="TimaLove Logo"
              className="h-14 md:h-16 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-5 lg:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-xs lg:text-sm font-medium text-slate-600 hover:text-primary transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="outline-none group bg-white/50 p-1 rounded-full border border-rose-100">
                  <UserCircle
                    size={28}
                    className="text-primary transition-transform group-hover:scale-110 duration-200"
                  />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-48 bg-white/95 backdrop-blur-md border-rose-100 shadow-xl rounded-2xl"
              >
                <Link to="/login">
                  <DropdownMenuItem className="cursor-pointer focus:bg-rose-50 focus:text-primary py-2 text-sm">
                    Se connecter
                  </DropdownMenuItem>
                </Link>

                <Link to="/?scroll=registration">
                  <DropdownMenuItem className="cursor-pointer focus:bg-rose-50 focus:text-primary font-medium py-2 text-sm">
                    S'inscrire
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <UserCircle size={24} className="text-primary" />
            <button
              className="p-1 text-slate-700"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-rose-100 animate-fade-up bg-[#FFF5F5]">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm font-medium text-slate-600 hover:text-primary transition-colors py-1 px-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <hr className="border-rose-100" />

              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-primary italic font-medium py-1 px-2 text-sm text-center"
                >
                  Se connecter
                </Link>

                <Link
                  to="/?scroll=registration"
                  onClick={() => setIsOpen(false)}
                  className="bg-primary text-white py-2 px-6 rounded-full font-bold text-center text-sm shadow-md hover:bg-primary/90 transition-colors"
                >
                  S'inscrire
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
