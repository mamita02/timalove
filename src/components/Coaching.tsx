import { CalendarHeart, Heart, MessageCircleHeart, Shield, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import { CoachingFormModal } from "../components/CoachingFormModal";

const benefits = [
  {
    icon: <Heart size={20} />,
    title: "Séance sur-mesure",
    desc: "Chaque accompagnement est adapté à votre histoire, vos besoins et vos objectifs.",
  },
  {
    icon: <Shield size={20} />,
    title: "Espace confidentiel",
    desc: "Vos échanges restent strictement privés. Liberté de parole totale garantie.",
  },
  {
    icon: <MessageCircleHeart size={20} />,
    title: "Écoute bienveillante",
    desc: "Une approche douce, sans jugement, centrée sur votre épanouissement.",
  },
  {
    icon: <Sparkles size={20} />,
    title: "Résultats concrets",
    desc: "Des outils pratiques pour avancer, décider et retrouver confiance en vous.",
  },
];

const themes = [
  "Trouver l'amour",
  "Surmonter une rupture",
  "Vie de couple",
  "Confiance en soi",
  "Communication",
  "Préparation au mariage",
];

const testimonial = {
  text: "Une séance qui m'a vraiment aidée à voir les choses autrement. Je me sens enfin prête à avancer.",
  author: "Fatou D.",
  stars: 5,
};

export const CoachingSection = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
    <CoachingFormModal isOpen={showModal} onClose={() => setShowModal(false)} />
    <section className="relative overflow-hidden bg-[#1a0808] py-24 px-4">

      {/* ── Arrière-plan décoratif ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 75% 20%, rgba(196,100,80,0.18) 0%, transparent 55%), radial-gradient(ellipse at 15% 85%, rgba(170,70,90,0.14) 0%, transparent 50%)",
        }}
      />
      {/* Ligne décorative haut */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(210,120,100,0.4), transparent)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">

        {/* ── En-tête de section ── */}
        <div className="mb-14 text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-800/40 bg-rose-900/20 px-5 py-2 text-xs font-medium uppercase tracking-widest text-rose-300">
            <CalendarHeart size={13} />
            Coaching individuel
          </span>

          <h2 className="mb-4 font-serif text-4xl font-normal leading-tight text-white md:text-5xl">
            Prenez soin de votre{" "}
            <em className="font-serif italic text-rose-400">vie amoureuse</em>
          </h2>

          <p className="mx-auto max-w-xl text-base font-light leading-relaxed text-white/55">
            Un espace rien que pour vous. Posez vos questions, libérez vos
            émotions, et repartez avec des clés concrètes pour avancer.
          </p>
        </div>

        {/* ── Contenu principal : carte info + bénéfices ── */}
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">

          {/* Colonne gauche — carte principale */}
          <div
            className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-rose-900/40 p-8"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            {/* Lueur interne */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full"
              style={{ background: "rgba(196,100,80,0.12)", filter: "blur(40px)" }}
            />

            {/* Thèmes abordés */}
            <div className="mb-8">
              <p className="mb-4 text-xs font-medium uppercase tracking-widest text-rose-400/80">
                Thèmes abordés
              </p>
              <div className="flex flex-wrap gap-2">
                {themes.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-rose-800/35 bg-rose-900/20 px-3 py-1 text-xs font-bold text-white"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Détails séance */}
            <div
              className="mb-8 rounded-2xl border border-rose-800/30 p-5"
              style={{ background: "rgba(200,90,80,0.1)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40">
                    Durée
                  </p>
                  <p className="mt-1 text-2xl font-serif font-normal text-white">
                    35 <span className="text-base text-white/60">min</span>
                  </p>
                </div>
                <div
                  className="h-10 w-px"
                  style={{ background: "rgba(200,100,80,0.25)" }}
                />
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40">
                    Tarif
                  </p>
                  <p className="mt-1 text-2xl font-serif font-normal text-rose-400">
                    40 <span className="text-base text-rose-300/70">€</span>
                  </p>
                </div>
                <div
                  className="h-10 w-px"
                  style={{ background: "rgba(200,100,80,0.25)" }}
                />
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40">
                    Format
                  </p>
                  <p className="mt-1 text-sm font-light text-white/75">
                    En ligne
                  </p>
                </div>
              </div>
            </div>

            {/* Validation manuelle */}
            <div className="mb-8 flex items-start gap-3 text-xs font-light leading-relaxed text-white/45">
              <Shield size={14} className="mt-0.5 shrink-0 text-rose-400/70" />
              <span>
                Chaque demande est{" "}
                <span className="text-white/70 font-normal">validée manuellement</span>{" "}
                par l'administratrice. Votre rendez-vous est confirmé sous 48h.
              </span>
            </div>

            {/* CTA */}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 py-4 text-sm font-semibold text-white shadow-lg shadow-rose-900/40 transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 w-full"
            >
              <CalendarHeart size={16} />
              Réserver ma séance
            </button>

            {/* Témoignage */}
            <div
              className="mt-6 rounded-2xl border border-rose-900/30 p-4"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <div className="mb-2 flex gap-0.5">
                {Array.from({ length: testimonial.stars }).map((_, i) => (
                  <Star key={i} size={11} className="fill-rose-400 text-rose-400" />
                ))}
              </div>
              <p className="text-xs font-light italic leading-relaxed text-white/55">
                "{testimonial.text}"
              </p>
              <p className="mt-2 text-xs font-medium text-rose-400/80">
                — {testimonial.author}
              </p>
            </div>
          </div>

          {/* Colonne droite — bénéfices */}
          <div className="flex flex-col gap-4">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-2xl border border-rose-900/30 p-5 transition-all duration-200 hover:border-rose-700/40"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-rose-400"
                  style={{ background: "rgba(200,90,80,0.15)" }}
                >
                  {b.icon}
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-medium text-white">
                    {b.title}
                  </h3>
                  <p className="text-sm font-light leading-relaxed text-white/50">
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}

            {/* Encart "Comment ça marche" */}
            <div
              className="mt-2 rounded-2xl border border-rose-800/30 p-6"
              style={{ background: "rgba(200,90,80,0.08)" }}
            >
              <p className="mb-4 text-xs font-medium uppercase tracking-widest text-rose-400/80">
                Comment ça marche ?
              </p>
              <ol className="flex flex-col gap-3">
                {[
                  "Remplissez le formulaire de prise de rendez-vous",
                  "Votre demande est examinée et validée sous 48h",
                  "Vous recevez la confirmation et le lien de paiement",
                  "Votre séance a lieu en visio à l'heure convenue",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-rose-300"
                      style={{ background: "rgba(200,90,80,0.25)" }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm font-light leading-relaxed text-white/55">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Ligne décorative bas */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(210,120,100,0.3), transparent)",
        }}
      />
    </section>
    </>
  );
};
