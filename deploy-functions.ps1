# Script de déploiement des fonctions Supabase
# Exécutez ce script après avoir configuré les secrets

Write-Host "🚀 Déploiement des fonctions TimaLove Match" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Supabase CLI est installé
Write-Host "Vérification de Supabase CLI..." -ForegroundColor Yellow
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI installé: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI non installé" -ForegroundColor Red
    Write-Host "Installez-le avec: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Vérifier la connexion au projet
Write-Host "Vérification de la connexion au projet..." -ForegroundColor Yellow
$projectRef = "hpclxgpvmnxdnhrqczdz"

try {
    supabase projects list 2>&1 | Out-Null
    Write-Host "✅ Connecté à Supabase" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Non connecté - Connexion en cours..." -ForegroundColor Yellow
    supabase login
}

Write-Host ""

# Lier le projet si nécessaire
Write-Host "Liaison avec le projet..." -ForegroundColor Yellow
supabase link --project-ref $projectRef

Write-Host ""

# Vérifier les secrets
Write-Host "Vérification des secrets..." -ForegroundColor Yellow
$secrets = supabase secrets list

if ($secrets -match "RESEND_API_KEY") {
    Write-Host "✅ RESEND_API_KEY configuré" -ForegroundColor Green
} else {
    Write-Host "⚠️  RESEND_API_KEY non configuré" -ForegroundColor Yellow
    Write-Host "Configurez-le avec: supabase secrets set RESEND_API_KEY=re_..." -ForegroundColor Cyan
    $continue = Read-Host "Continuer quand même? (y/n)"
    if ($continue -ne "y") {
        exit 0
    }
}

Write-Host ""

# Déployer les fonctions
Write-Host "📧 Déploiement de send-invitation..." -ForegroundColor Yellow
supabase functions deploy send-invitation --no-verify-jwt

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ send-invitation déployé" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors du déploiement de send-invitation" -ForegroundColor Red
}

Write-Host ""
Write-Host "📅 Déploiement de create-calendar-event..." -ForegroundColor Yellow
supabase functions deploy create-calendar-event --no-verify-jwt

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ create-calendar-event déployé" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors du déploiement de create-calendar-event" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Déploiement terminé!" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Testez l'envoi d'email dans l'interface admin" -ForegroundColor White
Write-Host "2. Vérifiez les logs avec: supabase functions logs send-invitation" -ForegroundColor White
Write-Host "3. Consultez EMAIL-SETUP.md pour plus de détails" -ForegroundColor White
Write-Host ""
