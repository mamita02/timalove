import { AboutSection } from "@/components/AboutSection";
import { ConceptSection } from "@/components/ConceptSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { GallerySection } from "@/components/GallerySection";
import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { RegistrationSection } from "@/components/RegistrationSection";
// 1. Importation de la section Avis
import { Testimonials } from "@/components/Testimonials";
const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection /> 
        <ConceptSection />
        <GallerySection />
        
        {/* 2. Ajout de la section Testimonials ici */}
        <Testimonials /> 

        <section id="registration">
        <RegistrationSection />
      </section>
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;