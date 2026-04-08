import {
  ArrowRight, CalendarHeart, CheckCircle2, Clock,
  CreditCard, Heart, Info, Link, Loader2, Mail, Shield, X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/* ══════════════════════════════════════════ TYPES */
type RadioGroup = "genre" | "situation";

interface FormData {
  prenom: string; nom: string; email: string; tel: string;
  genre: string; situation: string;
  date: string; creneau: string; theme: string; message: string;
}
interface FormErrors {
  prenom?: string; nom?: string; email?: string;
  date?: string; creneau?: string; theme?: string;
}

const GENRE_OPTIONS = [
  { value: "femme", label: "Une femme" },
  { value: "homme", label: "Un homme" },
  { value: "autre", label: "Autre" },
];
const SITUATION_OPTIONS = [
  { value: "celibataire", label: "Célibataire" },
  { value: "en-couple",  label: "En couple" },
  { value: "separation", label: "Séparation" },
];
const THEME_OPTIONS = [
  { value: "rencontres",    label: "Trouver l'amour / Rencontres" },
  { value: "couple",        label: "Améliorer ma relation de couple" },
  { value: "rupture",       label: "Surmonter une rupture" },
  { value: "confiance",     label: "Confiance en soi & séduction" },
  { value: "communication", label: "Communication dans le couple" },
  { value: "mariage",       label: "Préparation au mariage" },
  { value: "autre",         label: "Autre" },
];

const TODAY = new Date().toISOString().split("T")[0];

const EMPTY: FormData = {
  prenom: "", nom: "", email: "", tel: "",
  genre: "", situation: "", date: "", creneau: "", theme: "", message: "",
};

const STEPS = [
  { id: 1, label: "Informations" },
  { id: 2, label: "Paiement" },
  { id: 3, label: "Confirmation" },
];

/* ══════════════════════════════════════════ MODAL PRINCIPAL */
interface CoachingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number;
}

export const CoachingFormModal = ({ isOpen, onClose, initialStep = 1 }: CoachingFormModalProps) => {
  const [form, setForm]         = useState<FormData>(EMPTY);
  const [errors, setErrors]     = useState<FormErrors>({});
  const [step, setStep]         = useState(initialStep);
  const [visible, setVisible]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const t = setTimeout(() => {
        document.body.style.overflow = "";
        setForm(EMPTY); setErrors({}); setStep(1);
        setLoading(false); setPayError(null);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen, initialStep]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  if (!isOpen) return null;

  /* ── Handlers formulaire ── */
  const set = (f: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [f]: e.target.value }));

  const setRadio = (g: RadioGroup, v: string) =>
    setForm(prev => ({ ...prev, [g]: v }));

  const validate = () => {
    const e: FormErrors = {};
    if (!form.prenom.trim()) e.prenom = "Requis";
    if (!form.nom.trim())    e.nom    = "Requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email invalide";
    if (!form.date)    e.date    = "Requis";
    if (!form.creneau) e.creneau = "Requis";
    if (!form.theme)   e.theme   = "Requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) setStep(2); };

  /* ── Handler paiement Naboo ── */
  const handlePay = async () => {
    setLoading(true);
    setPayError(null);

    try {
      // 1. Insérer la demande dans coaching_requests
      const { data: coaching, error: insertError } = await supabase
        .from("coaching_requests")
        .insert({
          first_name:     form.prenom,
          last_name:      form.nom,
          email:          form.email,
          phone:          form.tel || null,
          genre:          form.genre || null,
          situation:      form.situation || null,
          requested_date: form.date,
          time_slot:      form.creneau,
          theme:          form.theme,
          message:        form.message || null,
          status:         "pending",
          payment_status: "unpaid",
        })
        .select("id")
        .single();

      if (insertError || !coaching) {
        throw new Error("Impossible d'enregistrer votre demande. Veuillez réessayer.");
      }

      // 2. Appeler la Edge Function via supabase.functions.invoke
      const { data, error } = await supabase.functions.invoke("naboo-coaching-payment", {
        body: { coachingRequestId: coaching.id },
      });

      if (error) throw new Error(error.message);

      // 3. Parser la réponse (même pattern que SubscriptionButton)
      const parsed = typeof data === "string" ? JSON.parse(data) : data;

      if (!parsed?.url) throw new Error("URL manquante dans la réponse");

      // 4. Rediriger vers la page de paiement Naboo
      window.location.href = parsed.url;

    } catch (err: any) {
      console.error("Erreur paiement coaching:", err);
      setPayError(err.message || "Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  /* ════════════ RENDU ════════════ */
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 transition-all duration-300"
        style={{
          background: "rgba(20,6,6,0.6)",
          backdropFilter: visible ? "blur(6px)" : "blur(0px)",
          opacity: visible ? 1 : 0,
        }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
        <div
          className="pointer-events-auto relative w-full overflow-hidden rounded-2xl shadow-2xl transition-all duration-300"
          style={{
            maxWidth: "860px",
            background: "#FFF5F5",
            border: "1px solid rgba(220,180,170,0.45)",
            boxShadow: "0 32px 80px rgba(20,6,6,0.45)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
          }}
        >
          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full transition-all hover:scale-110"
            style={{ background: "rgba(200,100,80,0.1)", border: "1px solid rgba(200,110,95,0.3)", color: "#9a5a50" }}
          >
            <X size={14} />
          </button>

          <div className="grid md:grid-cols-[240px_1fr]">

            {/* ── Panneau gauche ── */}
            <div
              className="flex flex-col justify-between px-6 py-8"
              style={{ background: "linear-gradient(160deg, #2a1010 0%, #3d1818 100%)" }}
            >
              <div>
                <span className="mb-5 block font-serif text-xs italic tracking-widest" style={{ color: "#c97a6a" }}>
                  ✦ TimaLove
                </span>
                <h2 className="font-serif text-2xl font-normal leading-snug text-white">Coaching</h2>
                <h2 className="mb-4 font-serif text-2xl font-normal italic leading-snug" style={{ color: "#d4897a" }}>
                  vie amoureuse
                </h2>
                <p className="mb-6 text-xs font-light leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Un espace bienveillant pour avancer sereinement dans votre vie amoureuse.
                </p>
                {[
                  { icon: <Clock size={13} />, label: "35 minutes" },
                  { icon: <Shield size={13} />, label: "Validation manuelle" },
                  { icon: <Heart size={13} />, label: "Confidentiel" },
                ].map(({ icon, label }) => (
                  <div key={label} className="mb-3 flex items-center gap-2.5">
                    <span style={{ color: "#c97a6a" }}>{icon}</span>
                    <span className="text-xs font-light" style={{ color: "rgba(255,255,255,0.6)" }}>{label}</span>
                  </div>
                ))}
              </div>

              {/* Prix */}
              <div className="mt-6 rounded-xl px-4 py-4"
                style={{ background: "rgba(200,100,80,0.15)", border: "0.5px solid rgba(220,130,110,0.2)" }}>
                <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>Tarif</p>
                <p className="mt-1 font-serif text-3xl font-normal" style={{ color: "#e09080" }}>
                  40 <span className="text-base" style={{ color: "rgba(224,144,128,0.55)" }}>€</span>
                </p>
                <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>par séance · 35 min</p>
                <div className="mt-3 flex items-start gap-1.5">
                  <Info size={11} className="mt-0.5 shrink-0" style={{ color: "#c97a6a" }} />
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.38)" }}>
                    Lien de réunion envoyé sous{" "}
                    <strong style={{ color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>48h</strong>{" "}
                    après validation du paiement
                  </p>
                </div>
              </div>
            </div>

            {/* ── Panneau droit ── */}
            <div className="flex flex-col px-7 py-7">
              <Stepper current={step} />

              <div className="mt-6 flex-1">
                {step === 1 && (
                  <StepForm
                    form={form} errors={errors}
                    set={set} setRadio={setRadio}
                    onNext={handleNext}
                  />
                )}
                {step === 2 && (
                  <StepPayment
                    form={form}
                    loading={loading}
                    payError={payError}
                    onPay={handlePay}
                    onBack={() => setStep(1)}
                  />
                )}
                {step === 3 && (
                  <StepConfirmation
                    name={`${form.prenom} ${form.nom}`}
                    email={form.email}
                    onClose={onClose}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ══════════════════════════════════════════ STEPPER */
const Stepper = ({ current }: { current: number }) => (
  <div className="flex items-center">
    {STEPS.map((s, i) => {
      const done   = current > s.id;
      const active = current === s.id;
      return (
        <div key={s.id} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? 1 : "none" }}>
          <div className="flex flex-col items-center gap-1">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300"
              style={{
                background: done ? "#c97a6a" : active ? "linear-gradient(135deg,#c96858,#b85a6a)" : "rgba(200,170,160,0.2)",
                color: done || active ? "#fff" : "rgba(100,60,60,0.4)",
                border: active || done ? "none" : "1px solid rgba(200,170,160,0.4)",
                boxShadow: active ? "0 4px 12px rgba(180,80,90,0.3)" : "none",
              }}
            >
              {done ? <CheckCircle2 size={14} /> : s.id}
            </div>
            <span
              className="whitespace-nowrap text-xs"
              style={{ color: active ? "#9a4535" : done ? "#c97a6a" : "rgba(100,60,60,0.38)", fontWeight: active ? 600 : 400 }}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="mb-4 mx-2 flex-1 transition-all duration-500"
              style={{ height: "1px", background: done ? "rgba(200,120,100,0.5)" : "rgba(200,170,160,0.25)" }}
            />
          )}
        </div>
      );
    })}
  </div>
);

/* ══════════════════════════════════════════ ÉTAPE 1 — FORMULAIRE */
interface StepFormProps {
  form: FormData; errors: FormErrors;
  set: (f: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  setRadio: (g: RadioGroup, v: string) => void;
  onNext: () => void;
}

const StepForm = ({ form, errors, set, setRadio, onNext }: StepFormProps) => (
  <div>
    <SL>Vos informations</SL>
    <div className="mb-3 grid grid-cols-2 gap-2.5">
      <F label="Prénom *" error={errors.prenom}>
        <FI placeholder="Votre prénom" value={form.prenom} onChange={set("prenom")} hasError={!!errors.prenom} />
      </F>
      <F label="Nom *" error={errors.nom}>
        <FI placeholder="Votre nom" value={form.nom} onChange={set("nom")} hasError={!!errors.nom} />
      </F>
    </div>
    <div className="mb-3 grid grid-cols-2 gap-2.5">
      <F label="Email *" error={errors.email}>
        <FI type="email" placeholder="votre@email.com" value={form.email} onChange={set("email")} hasError={!!errors.email} />
      </F>
      <F label="Téléphone">
        <FI type="tel" placeholder="+33 6 00 00 00 00" value={form.tel} onChange={set("tel")} />
      </F>
    </div>
    <div className="mb-3">
      <FL>Vous êtes *</FL>
      <div className="mt-1.5 flex gap-2">
        {GENRE_OPTIONS.map(o => (
          <RO key={o.value} label={o.label} active={form.genre === o.value} onClick={() => setRadio("genre", o.value)} />
        ))}
      </div>
    </div>
    <div className="mb-1">
      <FL>Votre situation *</FL>
      <div className="mt-1.5 flex gap-2">
        {SITUATION_OPTIONS.map(o => (
          <RO key={o.value} label={o.label} active={form.situation === o.value} onClick={() => setRadio("situation", o.value)} />
        ))}
      </div>
    </div>
    <div className="my-3" style={{ height: "1px", background: "linear-gradient(90deg,transparent,rgba(200,110,95,0.2),transparent)" }} />
    <SL>Votre rendez-vous</SL>
    <div className="mb-3 grid grid-cols-2 gap-2.5">
      <F label="Date souhaitée *" error={errors.date}>
        <FI type="date" min={TODAY} value={form.date} onChange={set("date")} hasError={!!errors.date} />
      </F>
      <F label="Créneau *" error={errors.creneau}>
        <FS value={form.creneau} onChange={set("creneau")} hasError={!!errors.creneau}>
          <option value="" disabled>Choisir</option>
          <option value="matin">Matin (9h – 12h)</option>
          <option value="aprem">Après-midi (13h – 17h)</option>
          <option value="soir">Soir (18h – 20h)</option>
        </FS>
      </F>
    </div>
    <div className="mb-3">
      <F label="Thème du coaching *" error={errors.theme}>
        <FS value={form.theme} onChange={set("theme")} hasError={!!errors.theme}>
          <option value="" disabled>Sélectionner un thème</option>
          {THEME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </FS>
      </F>
    </div>
    <F label="Message (optionnel)">
      <textarea
        rows={2}
        placeholder="Ce que vous souhaitez aborder lors de votre séance..."
        value={form.message}
        onChange={set("message")}
        className="w-full resize-none rounded-lg px-3 py-2 text-sm outline-none transition-all"
        style={{
          background: "#ffffff", border: "1px solid rgba(220,180,170,0.55)",
          color: "#3d1818", fontSize: "13px", lineHeight: "1.6",
        }}
        onFocus={e => (e.target.style.borderColor = "rgba(200,110,95,0.65)")}
        onBlur={e => (e.target.style.borderColor = "rgba(220,180,170,0.55)")}
      />
    </F>
    <button
      onClick={onNext}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 active:scale-[0.98]"
      style={{ background: "linear-gradient(135deg, #c96858 0%, #b85a6a 100%)", boxShadow: "0 8px 24px rgba(180,80,90,0.28)" }}
    >
      <CalendarHeart size={15} />
      Prendre rendez-vous
      <ArrowRight size={14} />
    </button>
    <p className="mt-2.5 text-center text-xs" style={{ color: "rgba(100,60,60,0.4)" }}>
      Données traitées avec confidentialité par TimaLove.
    </p>
  </div>
);

/* ══════════════════════════════════════════ ÉTAPE 2 — PAIEMENT */
interface StepPaymentProps {
  form: FormData;
  loading: boolean;
  payError: string | null;
  onPay: () => void;
  onBack: () => void;
}

const StepPayment = ({ form, loading, payError, onPay, onBack }: StepPaymentProps) => (
  <div className="flex flex-col gap-4">

    {/* Récapitulatif */}
    <div className="rounded-xl px-4 py-4"
      style={{ background: "rgba(200,100,80,0.07)", border: "1px solid rgba(220,180,170,0.4)" }}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "#c97a6a" }}>
        Récapitulatif
      </p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: "#3d1818" }}>Coaching vie amoureuse & couple</p>
          <p className="text-xs font-light" style={{ color: "rgba(100,60,60,0.6)" }}>
            35 min · {form.date
              ? new Date(form.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
              : "—"
            } · {
              form.creneau === "matin" ? "Matin (9h – 12h)" :
              form.creneau === "aprem" ? "Après-midi (13h – 17h)" :
              form.creneau === "soir"  ? "Soir (18h – 20h)" : "—"
            }
          </p>
          <p className="mt-1 text-xs font-light" style={{ color: "rgba(100,60,60,0.5)" }}>
            Pour : {form.prenom} {form.nom}
          </p>
        </div>
        <p className="font-serif text-2xl font-normal" style={{ color: "#c97a6a" }}>40 €</p>
      </div>
    </div>

    {/* Méthodes de paiement */}
    <div className="rounded-xl px-4 py-4"
      style={{ background: "#ffffff", border: "1px solid rgba(220,180,170,0.45)" }}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "#c97a6a" }}>
        Moyens de paiement acceptés
      </p>
      <div className="flex flex-wrap gap-2">
        {["Wave", "Orange Money", "Carte bancaire"].map(m => (
          <span key={m} className="rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: "rgba(200,100,80,0.08)", border: "1px solid rgba(200,110,95,0.25)", color: "#9a4535" }}>
            {m}
          </span>
        ))}
      </div>
    </div>

    {/* Message erreur */}
    {payError && (
      <div className="rounded-xl px-4 py-3"
        style={{ background: "rgba(220,60,60,0.07)", border: "1px solid rgba(220,80,80,0.3)" }}>
        <p className="text-xs font-medium" style={{ color: "#c0504a" }}>⚠️ {payError}</p>
      </div>
    )}

    {/* Info */}
    <div className="flex items-start gap-2.5 rounded-xl px-4 py-3"
      style={{ background: "rgba(200,100,80,0.07)", border: "1px solid rgba(220,180,170,0.35)" }}>
      <Info size={13} className="mt-0.5 shrink-0" style={{ color: "#c97a6a" }} />
      <p className="text-xs leading-relaxed" style={{ color: "rgba(80,40,40,0.65)" }}>
        Après validation du paiement, un{" "}
        <strong style={{ color: "#9a4535" }}>email de confirmation</strong> vous sera envoyé avec la{" "}
        <strong style={{ color: "#9a4535" }}>date et l'heure exactes</strong> de votre séance ainsi que le{" "}
        <strong style={{ color: "#9a4535" }}>lien de réunion</strong> sous 48h.
      </p>
    </div>

    {/* Bouton paiement */}
    <button
      onClick={onPay}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
      style={{ background: "linear-gradient(135deg, #c96858 0%, #b85a6a 100%)", boxShadow: "0 8px 24px rgba(180,80,90,0.28)" }}
    >
      {loading ? (
        <><Loader2 size={15} className="animate-spin" /> Redirection en cours...</>
      ) : (
        <><CreditCard size={15} /> Procéder au paiement · 40 €</>
      )}
    </button>

    <button onClick={onBack} disabled={loading}
      className="text-xs font-medium transition-all hover:underline disabled:opacity-40"
      style={{ color: "rgba(100,60,60,0.45)", textAlign: "left" }}>
      ← Modifier mes informations
    </button>
  </div>
);

/* ══════════════════════════════════════════ ÉTAPE 3 — CONFIRMATION */
const StepConfirmation = ({ name, email, onClose }: { name: string; email: string; onClose: () => void }) => (
  <div className="flex flex-col items-center gap-4 py-4 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-full"
      style={{ background: "rgba(200,110,90,0.12)", border: "1px solid rgba(200,130,110,0.3)" }}>
      <CheckCircle2 size={26} style={{ color: "#c97a6a" }} />
    </div>
    <div>
      <h3 className="font-serif text-xl font-normal" style={{ color: "#3d1818" }}>Paiement confirmé ✦</h3>
      <p className="mt-1 text-xs font-light" style={{ color: "rgba(100,60,60,0.55)" }}>
        Merci <strong style={{ fontWeight: 600, color: "#7a3a30" }}>{name}</strong> !
      </p>
    </div>
    <div className="w-full rounded-xl px-5 py-4 text-left"
      style={{ background: "rgba(200,100,80,0.07)", border: "1px solid rgba(220,180,170,0.4)" }}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "#c97a6a" }}>
        Prochaines étapes
      </p>
      {[
        {
          icon: <Mail size={13} />,
          title: "Email de confirmation",
          desc: `Un email vient d'être envoyé à ${email} pour confirmer votre réservation.`,
        },
        {
          icon: <CalendarHeart size={13} />,
          title: "Date & heure confirmées sous 48h",
          desc: "Notre équipe vous enverra un email avec la date et l'heure exactes de votre séance.",
        },
        {
          icon: <Link size={13} />,
          title: "Lien de réunion",
          desc: "Le lien de votre séance en ligne vous sera transmis par email avec les détails de connexion.",
        },
      ].map((item, i) => (
        <div key={i} className="mb-3 flex items-start gap-3 last:mb-0">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
            style={{ background: "rgba(200,100,80,0.15)", color: "#c97a6a" }}>
            {item.icon}
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: "#3d1818" }}>{item.title}</p>
            <p className="text-xs font-light leading-relaxed" style={{ color: "rgba(80,40,40,0.58)" }}>{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
    <button onClick={onClose}
      className="mt-1 flex items-center gap-2 rounded-full px-8 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-85"
      style={{ background: "linear-gradient(135deg, #c96858, #b85a6a)" }}>
      Fermer
    </button>
  </div>
);

/* ══════════════════════════════════════════ UI ATOMS */
const SL = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-2.5 flex items-center gap-3">
    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#c97a6a" }}>{children}</span>
    <div className="flex-1" style={{ height: "1px", background: "linear-gradient(90deg,rgba(200,110,95,0.3),transparent)" }} />
  </div>
);

const FL = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(80,40,40,0.5)" }}>
    {children}
  </label>
);

const F = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <FL>{label}</FL>
    {children}
    {error && <span className="text-xs font-medium" style={{ color: "#c0504a" }}>{error}</span>}
  </div>
);

const base = (err?: boolean): React.CSSProperties => ({
  backgroundColor: err ? "rgba(220,90,90,0.04)" : "#ffffff",  // ✅ backgroundColor pas background
  border: `1px solid ${err ? "rgba(200,80,80,0.4)" : "rgba(220,180,170,0.55)"}`,
  borderRadius: "8px", padding: "8px 12px",
  color: "#3d1818", fontSize: "13px", fontWeight: 400,
  width: "100%", outline: "none", transition: "border-color 0.2s",
});

const FI = ({ type = "text", placeholder, value, onChange, hasError, min }: {
  type?: string; placeholder?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasError?: boolean; min?: string;
}) => (
  <input type={type} placeholder={placeholder} value={value} onChange={onChange} min={min}
    style={base(hasError)}
    onFocus={e => (e.target.style.borderColor = "rgba(200,110,95,0.65)")}
    onBlur={e => (e.target.style.borderColor = hasError ? "rgba(200,80,80,0.4)" : "rgba(220,180,170,0.55)")}
  />
);

const FS = ({ value, onChange, hasError, children }: {
  value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  hasError?: boolean; children: React.ReactNode;
}) => (
  <select value={value} onChange={onChange} style={{
    ...base(hasError),
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23c97a6a' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    backgroundSize: "auto",   // ✅ évite le conflit shorthand
    paddingRight: "32px",
    cursor: "pointer",
  }}>
    {children}
  </select>
);

const RO = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button type="button" onClick={onClick}
    className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all"
    style={{
      background: active ? "rgba(200,100,80,0.1)" : "#ffffff",
      border: `1px solid ${active ? "rgba(200,110,95,0.55)" : "rgba(220,180,170,0.55)"}`,
      color: active ? "#9a4535" : "#7a5050", minWidth: "80px",
    }}
  >
    <span className="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full transition-all"
      style={{
        border: `1.5px solid ${active ? "#d48070" : "rgba(200,150,140,0.5)"}`,
        background: active ? "#d48070" : "transparent",
      }}
    >
      {active && <span className="h-1 w-1 rounded-full bg-white" />}
    </span>
    {label}
  </button>
);
