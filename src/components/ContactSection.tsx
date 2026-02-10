  import { toast } from "@/hooks/use-toast";
import { Mail, MessageCircle, Phone, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

  export const ContactSection = () => {
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      message: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      toast({
        title: "Message envoyé !",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });
      setFormData({ name: "", email: "", message: "" });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
      // FOND BLANC PUR
      <section id="contact" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          
          {/* Header */}
          <div className="text-center mb-20">
            <span className="text-primary font-bold text-[11px] tracking-[0.4em] uppercase mb-4 block">
              Une question ?
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-slate-900 mb-6">
              Parlons-en ensemble
            </h2>
            <div className="h-1 w-16 bg-primary/30 mx-auto rounded-full" />
          </div>

          {/* 1. BLOCS HORIZONTAUX */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto mb-20">
            
            {/* Email */}
            <div className="bg-slate-50/50 p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-rose-50">
                <Mail size={24} className="text-primary" />
              </div>
              <h3 className="font-serif text-xl text-slate-800 mb-2">Email</h3>
              <p className="text-sm text-slate-400 mb-4 italic">Réponse sous 24h</p>
              <a href="mailto:contact@timalove.com" className="text-primary font-semibold hover:opacity-70 transition-opacity">
                contact@timalove.com
              </a>
            </div>

          {/* WhatsApp */}
            <div className="bg-primary p-10 rounded-[2.5rem] shadow-2xl shadow-primary/20 flex flex-col items-center text-center text-white group hover:scale-[1.03] transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                <MessageCircle size={28} />
              </div>
              <h3 className="font-serif text-xl mb-2">WhatsApp</h3>
              <p className="text-sm text-rose-100/80 mb-4 italic">Conseil instantané</p>
              <a href="https://wa.me/33600000000" target="_blank" className="font-bold border-b-2 border-white/30 hover:border-white transition-all pb-1 text-sm">
                Démarrer un chat
              </a>
            </div>
            
            {/* Téléphone */}
            <div className="bg-slate-50/50 p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-rose-50">
                <Phone size={24} className="text-primary" />
              </div>
              <h3 className="font-serif text-xl text-slate-800 mb-2">Téléphone</h3>
              <p className="text-sm text-slate-400 mb-4 italic">Lun - Ven, 9h - 18h</p>
              <a href="tel:+33600000000" className="text-primary font-semibold hover:opacity-70 transition-opacity">
                +33 6 00 00 00 00
              </a>
            </div>

            

          </div>

          {/* 2. FORMULAIRE CENTRÉ */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-50/30 p-10 md:p-16 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
              <h3 className="font-serif text-2xl text-center text-slate-900 mb-12 italic">Envoyez-nous un message discret</h3>
              
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-[0.2em] text-slate-400 ml-1">Nom complet</Label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="h-12 border-0 border-b-2 border-slate-200 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-primary transition-all text-lg placeholder:text-slate-200"
                      placeholder="Votre nom"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-[0.2em] text-slate-400 ml-1">Email</Label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="h-12 border-0 border-b-2 border-slate-200 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-primary transition-all text-lg placeholder:text-slate-200"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-slate-400 ml-1">Votre message</Label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="min-h-[150px] border-2 border-slate-100 rounded-3xl bg-white focus:border-primary transition-all p-6 text-slate-700 italic shadow-sm"
                    placeholder="Comment pouvons-nous vous aider ?"
                    required
                  />
                </div>

                <div className="flex justify-center pt-4">
                  <Button type="submit" variant="romantic" className="w-full md:w-[320px] h-16 rounded-full text-lg font-bold shadow-2xl shadow-primary/30 hover:scale-[1.05] transition-all duration-300">
                    <Send size={20} className="mr-3" />
                    Envoyer le message
                  </Button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </section>
    );
  };