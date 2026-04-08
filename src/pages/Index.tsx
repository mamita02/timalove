import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AboutSection } from "@/components/AboutSection";
import { CoachingSection } from "@/components/Coaching";
import { CoachingFormModal } from "@/components/CoachingFormModal";
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
  const [showCoaching, setShowCoaching] = useState(false);
  const [coachingStep, setCoachingStep] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    // Scroll vers une section
    const section = params.get("scroll");
    if (section) {
      const element = document.getElementById(section);
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }

    // Retour après paiement coaching réussi → ouvre le modal à l'étape 3
    if (params.get("coaching") === "success") {
      setCoachingStep(3);
      setShowCoaching(true);
      window.history.replaceState({}, "", "/"); // nettoie ?coaching=success de l'URL
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Modal coaching — déclenché depuis Navbar, CoachingSection ou retour paiement */}
      <CoachingFormModal
        isOpen={showCoaching}
        onClose={() => { setShowCoaching(false); setCoachingStep(1); }}
        initialStep={coachingStep}
      />

      <main>
        <section id="hero"><HeroSection /></section>
        <section id="about"><AboutSection /></section>
        <section id="concept"><ConceptSection /></section>
        <section id="gallery"><GallerySection /></section>
        <section id="Coaching"><CoachingSection /></section>
        <section id="temoignages"><Testimonials /></section>
        <section id="registration"><RegistrationSection /></section>
        <section id="contact"><ContactSection /></section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
