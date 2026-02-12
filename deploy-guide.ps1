# Script simplifié de déploiement (sans CLI)
# Les fonctions doivent être déployées via l'interface Supabase

Write-Host "📧 Guide de déploiement des fonctions Edge" -ForegroundColor Cyan
Write-Host ""
Write-Host "Les fonctions Edge de Supabase doivent être déployées via l'interface web ou la CLI." -ForegroundColor Yellow
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  MÉTHODE 1 : Interface Web (Plus simple)" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Configurer le secret RESEND_API_KEY" -ForegroundColor Yellow
Write-Host "   → https://supabase.com/dashboard/project/hpclxgpvmnxdnhrqczdz/settings/vault" -ForegroundColor White
Write-Host "   → Cliquez 'New Secret'" -ForegroundColor White
Write-Host "   → Name: RESEND_API_KEY" -ForegroundColor White
Write-Host "   → Value: re_votre_cle_resend" -ForegroundColor White
Write-Host ""
Write-Host "2️⃣  Créer la fonction send-invitation" -ForegroundColor Yellow
Write-Host "   → https://supabase.com/dashboard/project/hpclxgpvmnxdnhrqczdz/functions" -ForegroundColor White
Write-Host "   → Cliquez 'Create a new function'" -ForegroundColor White
Write-Host "   → Name: send-invitation" -ForegroundColor White
Write-Host "   → Copiez le code depuis: supabase\functions\send-invitation\index.ts" -ForegroundColor White
Write-Host "   → Deploy" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣  Créer la fonction create-calendar-event" -ForegroundColor Yellow
Write-Host "   → Même processus avec: supabase\functions\create-calendar-event\index.ts" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  MÉTHODE 2 : CLI Supabase (Plus rapide mais configuration nécessaire)" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si vous voulez utiliser la CLI:" -ForegroundColor Yellow
Write-Host "1. Créez un token: https://supabase.com/dashboard/account/tokens" -ForegroundColor White
Write-Host '2. Exécutez: $env:SUPABASE_ACCESS_TOKEN = "sbp_votre_token"' -ForegroundColor White
Write-Host '3. Exécutez: & "$env:USERPROFILE\.supabase\supabase.exe" link --project-ref hpclxgpvmnxdnhrqczdz' -ForegroundColor White
Write-Host '4. Exécutez: & "$env:USERPROFILE\.supabase\supabase.exe" secrets set RESEND_API_KEY=re_...' -ForegroundColor White
Write-Host '5. Exécutez: & "$env:USERPROFILE\.supabase\supabase.exe" functions deploy send-invitation' -ForegroundColor White
Write-Host '6. Exécutez: & "$env:USERPROFILE\.supabase\supabase.exe" functions deploy create-calendar-event' -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 RECOMMANDATION: Utilisez la MÉTHODE 1 (interface web) pour commencer" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Fichiers à copier:" -ForegroundColor Yellow
Write-Host "   • supabase\functions\send-invitation\index.ts" -ForegroundColor White
Write-Host "   • supabase\functions\create-calendar-event\index.ts" -ForegroundColor White
Write-Host ""
Write-Host "✅ Une fois déployé, testez avec .\test-email.ps1" -ForegroundColor Green
Write-Host ""
