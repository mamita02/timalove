import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { AboutSection } from "@/components/AboutSection";
import { ConceptSection } from "@/components/ConceptSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { GallerySection } from "@/components/GallerySection";
import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { RegistrationSection } from "@/components/RegistrationSection";
import { Testimonials } from "@/components/Testimonials";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("scroll");

    if (section) {
      const element = document.getElementById(section);

      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>

        <section id="hero">
          <HeroSection />
        </section>

        <section id="about">
          <AboutSection />
        </section>

        <section id="concept">
          <ConceptSection />
        </section>

        <section id="gallery">
          <GallerySection />
        </section>

        <section id="temoignages">
          <Testimonials />
        </section>

        <section id="registration">
          <RegistrationSection />
        </section>

        <section id="contact">
          <ContactSection />
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Index;
