# 🚀 Guide de Démarrage Rapide - TimaLove Match

## Configuration en 10 minutes

### 1️⃣ Créer un compte Resend (2 min)

1. Allez sur https://resend.com
2. Créez un compte gratuit
3. Vérifiez votre email

### 2️⃣ Obtenir la clé API Resend (1 min)

1. Dashboard → **API Keys**
2. **Create API Key**
3. Copiez la clé (commence par `re_...`)

### 3️⃣ Configurer Supabase (5 min)

Ouvrez PowerShell dans le dossier du projet :

```powershell
# Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref hpclxgpvmnxdnhrqczdz

# Configurer la clé Resend
supabase secrets set RESEND_API_KEY=re_VOTRE_CLE_ICI

# Déployer les fonctions
.\deploy-functions.ps1
```

### 4️⃣ Tester (2 min)

```powershell
# Tester l'envoi d'email
.\test-email.ps1
```

Ou testez directement dans l'interface :
1. http://localhost:8080/admin
2. Menu **Matching**
3. Créez un match
4. ✅ Vérifiez votre boîte mail !

---

## ✅ Checklist

- [ ] Compte Resend créé
- [ ] Clé API obtenue
- [ ] Supabase CLI installé
- [ ] Projet lié
- [ ] Secret configuré
- [ ] Fonctions déployées
- [ ] Test effectué
- [ ] Email reçu 🎉

---

## 🆘 Problème ?

### ❌ "supabase: command not found"
```powershell
npm install -g supabase
```

### ❌ "RESEND_API_KEY is not set"
```powershell
supabase secrets set RESEND_API_KEY=re_VOTRE_CLE
supabase functions deploy send-invitation
```

### ❌ Email non reçu
1. Vérifiez les spams
2. En mode sandbox, vérifiez votre email dans Resend Dashboard
3. Regardez les logs : `supabase functions logs send-invitation`

---

## 📚 Documentation Complète

Consultez **EMAIL-SETUP.md** pour :
- Configuration avancée de Google Calendar
- Configuration d'un domaine personnalisé
- Webhooks et monitoring
- Production deployment

---

## 🎯 Prochaines Étapes

1. ✅ Configurez Resend (vous êtes ici)
2. 📧 Testez l'envoi d'emails
3. 🗄️ Exécutez les scripts SQL dans Supabase
4. 🚀 Créez vos premiers matchs !

Bon matching ! 💕
