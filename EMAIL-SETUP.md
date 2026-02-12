# 📧 Configuration Complète : Emails + Google Calendar

Ce guide vous montre comment configurer l'envoi automatique des invitations par email avec Resend et l'intégration Google Calendar.

---

## 🚀 Configuration Rapide (5 minutes)

### Étape 1 : Installer Supabase CLI

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter
supabase login

# Lier votre projet
supabase link --project-ref hpclxgpvmnxdnhrqczdz
```

---

## 📧 PARTIE 1 : Configuration Resend (Emails)

### Option 1 : Resend (Recommandé - Gratuit jusqu'à 3000 emails/mois)

### 1. Créer un compte Resend
1. Allez sur **https://resend.com**
2. Créez un compte gratuit (avec votre email professionnel)
3. Vérifiez votre email

### 2. Configurer votre domaine (ou utilisez le sandbox)

**Option A - Sandbox (pour tests immédiats)** :
- Utilisez `onboarding@resend.dev` comme expéditeur
- Les emails iront uniquement aux adresses que vous vérifiez
- Parfait pour tester !

**Option B - Domaine personnalisé (pour production)** :
1. Dashboard Resend → Domains → Add Domain
2. Ajoutez `timalove.com`
3. Configurez les enregistrements DNS (SPF, DKIM, DMARC)
4. Attendez la vérification (quelques minutes)

### 3. Obtenir votre clé API Resend

1. Dashboard Resend → **API Keys**
2. Cliquez sur **Create API Key**
3. Nom : `TimaLove Production`
4. Permission : **Full Access**
5. **Copiez la clé** (format: `re_...`) - vous ne la reverrez plus !

### 4. Configurer dans Supabase

```bash
# Dans votre terminal (à la racine du projet)
cd c:\Users\USER\Documents\MCE\timalove-match

# Définir le secret Resend
supabase secrets set RESEND_API_KEY=re_VOTRE_CLE_ICI

# Déployer la fonction d'envoi d'email
supabase functions deploy send-invitation
```

### 5. Tester l'envoi d'email

Ouvrez la console Supabase SQL Editor et exécutez :

```sql
SELECT extensions.http((
  'POST',
  'https://hpclxgpvmnxdnhrqczdz.supabase.co/functions/v1/send-invitation',
  ARRAY[
    extensions.http_header('Authorization', 'Bearer VOTRE_ANON_KEY'),
    extensions.http_header('Content-Type', 'application/json')
  ],
  'application/json',
  '{"to":"VOTRE_EMAIL@example.com","recipientName":"Jean Dupont","partnerName":"Marie Martin","date":"2026-02-20T14:00:00","meetLink":"https://meet.google.com/abc-defg-hij","calendarLink":"https://calendar.google.com/..."}'
)::text);
```

✅ **Vérifiez votre boîte mail** - vous devriez recevoir l'invitation !

---

## 📅 PARTIE 2 : Configuration Google Calendar API

### Option 1 : Liens Google Calendar (Simple - Déjà configuré ✅)

C'est **déjà fonctionnel** dans votre code ! Les utilisateurs reçoivent un lien pour ajouter l'événement à leur calendrier Google.

**Avantages** :
- ✅ Aucune configuration nécessaire
- ✅ Fonctionne immédiatement
- ✅ Utilisateurs gardent le contrôle

**Inconvénient** :
- ⚠️ Les utilisateurs doivent cliquer pour ajouter manuellement

### Option 2 : Google Calendar API (Avancé - Création automatique)

Pour créer **automatiquement** les événements dans les calendriers des utilisateurs.

#### 2.1. Créer un projet Google Cloud

1. Allez sur **https://console.cloud.google.com**
2. Créez un nouveau projet : `TimaLove Match`
3. Activez l'API Google Calendar :
   - Menu → APIs & Services → Library
   - Cherchez "Google Calendar API"
   - Cliquez **Enable**

#### 2.2. Créer un compte de service

1. APIs & Services → **Credentials**
2. Create Credentials → **Service Account**
3. Nom : `timalove-calendar-bot`
4. Rôle : `Project → Editor`
5. **Create Key** → JSON
6. Téléchargez le fichier JSON

#### 2.3. Activer la délégation de domaine

1. Dans votre compte de service, cliquez **Show domain-wide delegation**
2. Activez **Enable Google Workspace Domain-wide Delegation**
3. Notez le **Client ID**

#### 2.4. Configurer dans Google Workspace Admin (si applicable)

Si vous utilisez Google Workspace pour `timalove.com` :

1. Admin Console → Security → API Controls
2. Domain-wide Delegation → Add new
3. Client ID : (celui du compte de service)
4. OAuth Scopes : `https://www.googleapis.com/auth/calendar`

#### 2.5. Configurer dans Supabase

```bash
# Convertir le fichier JSON en une seule ligne
# Sur Windows PowerShell :
$json = Get-Content service-account.json -Raw | ConvertFrom-Json | ConvertTo-Json -Compress
supabase secrets set GOOGLE_SERVICE_ACCOUNT="$json"

# Déployer la fonction Calendar
supabase functions deploy create-calendar-event
```

#### 2.6. Mettre à jour matching.ts pour utiliser l'API

Le code est déjà préparé ! Une fois l'API configurée, les événements seront créés automatiquement.

---

## 📋 PARTIE 3 : Vérification Finale

### Checklist de configuration

- [ ] ✅ Compte Resend créé
- [ ] ✅ Clé API Resend obtenue
- [ ] ✅ Secret `RESEND_API_KEY` configuré dans Supabase
- [ ] ✅ Fonction `send-invitation` déployée
- [ ] ✅ Email de test reçu
- [ ] ✅ Google Calendar (liens manuels) : Déjà fonctionnel ✅
- [ ] ⏳ Google Calendar API (optionnel) : Si vous voulez la création automatique

### Test complet du workflow

1. **Connectez-vous à l'admin** : http://localhost:8080/admin
2. **Allez dans Matching** : Menu → Matching
3. **Créez un match** :
   - Sélectionnez un homme
   - Sélectionnez une femme
   - Choisissez une date/heure
   - Cliquez "Prévisualiser"
   - Cliquez "Créer le match"

4. **Vérifiez** :
   - ✅ Console navigateur (F12) : "📧 Envoi des invitations par email..."
   - ✅ Console navigateur : "✅ Email envoyé à: xxx@example.com" (x2)
   - ✅ Boîte mail de l'homme : Email reçu avec lien Meet + Calendrier
   - ✅ Boîte mail de la femme : Email reçu avec lien Meet + Calendrier

---

## 🎯 Configuration Recommandée pour Production

### Pour démarrer rapidement (MAINTENANT) :
```bash
# 1. Configurer Resend (5 minutes)
supabase secrets set RESEND_API_KEY=re_VOTRE_CLE
supabase functions deploy send-invitation

# 2. Tester
# Créez un match dans l'interface admin
# Vérifiez les emails
```

### Pour la production complète (PLUS TARD) :
1. ✅ Resend avec domaine vérifié `timalove.com`
2. ✅ Google Calendar API avec compte de service
3. ✅ Certificat SSL pour le domaine
4. ✅ Monitoring des emails (webhooks Resend)

---

## 🔧 Commandes Utiles

```bash
# Voir les secrets configurés
supabase secrets list

# Voir les logs de la fonction
supabase functions logs send-invitation

# Redéployer après modification
supabase functions deploy send-invitation --no-verify-jwt

# Tester localement
supabase functions serve send-invitation
```

---

## 🆘 Dépannage

### ❌ Erreur : "RESEND_API_KEY is not set"
```bash
# Vérifier
supabase secrets list

# Reconfigurer
supabase secrets set RESEND_API_KEY=re_...
supabase functions deploy send-invitation
```

### ❌ Les emails ne partent pas
1. Vérifiez la console navigateur (F12) pour les erreurs
2. Vérifiez les logs Supabase : `supabase functions logs send-invitation`
3. Vérifiez que la clé API Resend est valide (Dashboard Resend)

### ❌ Emails en spam
- Vérifiez les enregistrements DNS (SPF, DKIM)
- Utilisez un domaine vérifié (pas `@gmail.com`)
- Ajoutez un lien de désinscription

### ❌ Google Calendar ne fonctionne pas
- Option 1 (liens manuels) : Déjà fonctionnelle ✅
- Option 2 (API) : Vérifiez les permissions du compte de service

---

## 💡 Conseils

1. **Commencez simple** : Utilisez Resend + liens Calendar manuels
2. **Testez avec vos emails** avant d'inviter de vrais utilisateurs
3. **Mode Sandbox Resend** : Parfait pour le développement
4. **Domaine vérifié** : Indispensable pour la production
5. **Surveillance** : Configurez les webhooks Resend pour tracker les ouvertures/clics

---

## 📞 Support

- Resend : https://resend.com/docs
- Google Calendar API : https://developers.google.com/calendar
- Supabase Functions : https://supabase.com/docs/guides/functions

Besoin d'aide ? Vérifiez les logs avec `supabase functions logs send-invitation`
