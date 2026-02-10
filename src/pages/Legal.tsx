import { Link } from 'react-router-dom';

const Legal = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F5] py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#5F5751]">
      <div className="max-w-4xl mx-auto">
        
        {/* Bouton Retour */}
        <Link to="/" className="inline-flex items-center text-[#D48B8B] hover:text-[#B56B6B] mb-8 transition-colors">
          <span className="mr-2">←</span> Retour à l'accueil
        </Link>

        <div className="bg-white shadow-sm rounded-3xl overflow-hidden border border-[#F3E5E0]">
          
          {/* Header avec Logo */}
          <div className="bg-[#F9E8E2] p-10 text-center">
            {/* Emplacement du Logo */}
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#F3E5E0]">
                {/* Remplace l'icône par ton image : <img src="/logo.png" alt="TimaLove" /> */}
                <span className="text-3xl text-[#D48B8B] font-serif"><img src="src/assets/TYMA LOVEPlan de travail 2.png" alt="TimaLove" /></span>
              </div>
            </div>
            <h1 className="text-4xl font-serif text-[#D48B8B] mb-2 italic">TimaLove Match</h1>
            <p className="text-[#8B7E74] uppercase tracking-widest text-sm">Mentions Légales & Conditions Générales</p>
          </div>

          <div className="p-8 md:p-12">
            
            {/* Sommaire */}
            <nav className="mb-12 p-6 bg-[#FDF8F5] rounded-2xl border border-[#F9E8E2]">
              <h2 className="text-[#D48B8B] font-semibold mb-4 uppercase text-sm tracking-wider">Sommaire</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <li>
                  <button onClick={() => scrollToSection('mentions')} className="hover:text-[#D48B8B] transition-colors text-left">
                    1. Mentions Légales
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('concept')} className="hover:text-[#D48B8B] transition-colors text-left">
                    2. Concept Humain
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('photos')} className="hover:text-[#D48B8B] transition-colors text-left">
                    3. Galerie & Photos
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('paiement')} className="hover:text-[#D48B8B] transition-colors text-left">
                    4. Tarifs & Paiement
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('responsabilite')} className="hover:text-[#D48B8B] transition-colors text-left">
                    5. Responsabilité
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('confidentialite')} className="hover:text-[#D48B8B] transition-colors text-left">
                    6. Confidentialité
                  </button>
                </li>
              </ul>
            </nav>

            {/* Contenu */}
            <div className="space-y-16">
              
              <section id="mentions">
                <h2 className="text-2xl font-serif text-[#D48B8B] mb-6 flex items-center">
                  <span className="mr-4 text-sm bg-[#F9E8E2] px-3 py-1 rounded-full text-[#D48B8B]">01</span>
                  Mentions Légales
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-2">Éditeur</h3>
                    <p>TimaLove </p>
                    <p>Fatimata Ba </p>
                    <p>0033 77 970 9465 </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Conception</h3>
                    <p>Agence MCE [cite: 17]</p>
                    <p>Dakar, Sénégal </p>
                  </div>
                </div>
              </section>

              <section id="concept">
                <h2 className="text-2xl font-serif text-[#D48B8B] mb-6 flex items-center">
                  <span className="mr-4 text-sm bg-[#F9E8E2] px-3 py-1 rounded-full text-[#D48B8B]">02</span>
                  Concept & Positionnement
                </h2>
                <p>TimaLove propose une mise en relation amoureuse sérieuse orientée vers le mariage[cite: 33]. Notre service est strictement humain et non automatisé : chaque étape est validée manuellement par l'administratrice[cite: 34].</p>
              </section>

              <section id="photos" className="bg-[#FDF8F5] p-8 rounded-2xl border border-[#F9E8E2]">
                <h2 className="text-2xl font-serif text-[#D48B8B] mb-6 flex items-center">
                  <span className="mr-4 text-sm bg-white px-3 py-1 rounded-full text-[#D48B8B]">03</span>
                  Système de Photos
                </h2>
                <p>Pour garantir l'exclusivité et la sécurité de nos membres, les photos sont affichées de manière volontairement floue[cite: 56]. Le défloutage est strictement conditionné à un paiement sécurisé[cite: 57].</p>
              </section>

              <section id="paiement">
                <h2 className="text-2xl font-serif text-[#D48B8B] mb-6 flex items-center">
                  <span className="mr-4 text-sm bg-[#F9E8E2] px-3 py-1 rounded-full text-[#D48B8B]">04</span>
                  Conditions de Paiement
                </h2>
                <p>Un tarif de lancement est appliqué pour accéder aux visuels de la galerie[cite: 58]. Ce paiement unique est sécurisé et non remboursable une fois l'accès aux photos activé.</p>
              </section>

              <section id="responsabilite">
                <h2 className="text-2xl font-serif text-[#D48B8B] mb-6 flex items-center">
                  <span className="mr-4 text-sm bg-[#F9E8E2] px-3 py-1 rounded-full text-[#D48B8B]">05</span>
                  Responsabilité
                </h2>
                <p>Conformément à notre charte, TimaLove est soumis à une clause de non-obligation de résultat[cite: 49]. Nous fournissons les outils et l'accompagnement, mais l'aboutissement d'une union dépend de l'interaction humaine entre les membres.</p>
              </section>

              <section id="confidentialite">
                <h2 className="text-2xl font-serif text-[#D48B8B] mb-6 flex items-center">
                  <span className="mr-4 text-sm bg-[#F9E8E2] px-3 py-1 rounded-full text-[#D48B8B]">06</span>
                  Confidentialité
                </h2>
                <p>Toutes les données confiées lors de l'inscription sont traitées avec une confidentialité totale[cite: 27]. Le site intègre une sécurité anti-spam et des sauvegardes régulières pour protéger votre vie privée[cite: 71].</p>
              </section>

            </div>
          </div>

          <div className="bg-[#F9E8E2] p-8 text-center text-sm text-[#8B7E74]">
            &copy; 2026 TimaLove Match. Tous droits réservés. 
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;