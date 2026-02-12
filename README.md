# 💕 TimaLove Match - Plateforme de Rencontres

Application de gestion de rencontres avec système d'inscription, matching intelligent et envoi automatique d'invitations.

## 🚀 Démarrage Rapide

```powershell
# Installation
npm install

# Configuration Supabase + Resend (10 min)
# Suivez le guide: QUICK-START.md

# Démarrer le serveur
npm run dev
```

➡️ **[Guide de démarrage en 10 minutes](QUICK-START.md)** ⬅️

---

## ✨ Fonctionnalités

### Pour les utilisateurs
- ✅ Inscription complète avec photo
- ✅ Validation de profil
- ✅ Notifications par email
- ✅ Google Calendar intégré
- ✅ Visioconférences Google Meet

### Pour l'admin
- ✅ Dashboard complet
- ✅ Gestion des inscriptions
- ✅ Système de matching intelligent
- ✅ Notifications en temps réel
- ✅ Envoi automatique d'invitations
- ✅ Gestion des paiements
- ✅ Avis et témoignages

---

## 📋 Configuration

### 1. Variables d'environnement

Créez un fichier `.env` :

```env
VITE_SUPABASE_URL=https://hpclxgpvmnxdnhrqczdz.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon
```

### 2. Base de données Supabase

Exécutez les scripts SQL dans l'ordre :

1. **supabase-migration.sql** - Tables principales
2. **supabase-add-gender.sql** - Colonne gender
3. **supabase-matches-migration.sql** - Table matches
4. **supabase-diagnostic-matching.sql** - RLS policies

### 3. Configuration des emails

```powershell
# Suivez le guide complet
.\deploy-functions.ps1
```

📧 **[Guide complet email + calendar](EMAIL-SETUP.md)**

---

## 🛠️ Technologies

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Storage + Functions)
- **Email**: Resend
- **Validation**: React Hook Form + Zod
- **Routing**: React Router v6
- **Icons**: Lucide React

---

## 📁 Structure

```
src/
├── components/
│   ├── admin/
│   │   ├── AdminLayout.tsx        # Layout admin avec sidebar
│   │   ├── NotificationCenter.tsx # Centre de notifications
│   │   ├── MatchingManager.tsx    # Interface de matching
│   │   └── ...
│   ├── ui/                        # Composants Shadcn
│   └── RegistrationSection.tsx    # Formulaire d'inscription
├── lib/
│   ├── supabase.ts               # Client Supabase
│   ├── matching.ts               # Logique de matching
│   └── notifications.ts          # Gestion notifications
├── pages/
│   ├── Admin.tsx                 # Dashboard admin
│   ├── Matching.tsx              # Page matching
│   └── ...
└── hooks/                        # Hooks personnalisés

supabase/
└── functions/
    ├── send-invitation/          # Envoi emails
    └── create-calendar-event/    # Google Calendar
```

---

## 🧪 Scripts Disponibles

```powershell
# Développement
npm run dev

# Build production
npm run build

# Tests
npm run test

# Déployer les fonctions Supabase
.\deploy-functions.ps1

# Tester l'envoi d'email
.\test-email.ps1
```

---

## 📚 Documentation

- **[QUICK-START.md](QUICK-START.md)** - Configuration en 10 minutes
- **[EMAIL-SETUP.md](EMAIL-SETUP.md)** - Configuration complète emails + Google Calendar
- **[supabase-diagnostic-matching.sql](supabase-diagnostic-matching.sql)** - Diagnostic et fix RLS

---

## 🔐 Sécurité

- ✅ RLS (Row Level Security) activé sur toutes les tables
- ✅ Validation des données côté client et serveur
- ✅ Secrets Supabase pour les clés API
- ✅ HTTPS obligatoire en production

---

## 🚀 Déploiement

### Development
```powershell
npm run dev
```

### Production
```powershell
# Build
npm run build

# Déployer sur Vercel/Netlify
# Les fonctions Supabase sont déjà déployées via deploy-functions.ps1
```

---

## 🆘 Support

### Problèmes courants

**Notifications ne s'affichent pas ?**
- Vérifiez que le code `crypto.randomUUID` a été remplacé (notifications.ts)
- Rafraîchissez la page (F5)

**Selects vides dans Matching ?**
- Exécutez `supabase-diagnostic-matching.sql` pour fixer les RLS policies
- Vérifiez que vous avez des inscriptions avec status='approved'

**Emails non reçus ?**
- Suivez [EMAIL-SETUP.md](EMAIL-SETUP.md)
- Vérifiez les logs : `supabase functions logs send-invitation`
- En mode sandbox Resend, vérifiez que votre email est validé

---

## 📞 Contact

Pour toute question : contact@timalove.com

---

## 📄 Licence

Propriétaire - TimaLove Match © 2026

---

## Project info (Lovable)

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
