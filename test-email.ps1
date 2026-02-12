# Script de test des fonctions d'envoi d'email
# Remplacez TEST_EMAIL par votre email pour recevoir un test

$testEmail = Read-Host "Entrez votre email pour recevoir un test"
$anonKey = Read-Host "Entrez votre SUPABASE_ANON_KEY (depuis .env)"

Write-Host ""
Write-Host "📧 Envoi d'un email de test à $testEmail..." -ForegroundColor Cyan

$body = @{
    to = $testEmail
    recipientName = "Test Utilisateur"
    partnerName = "Personne Test"
    date = "2026-02-20T14:00:00"
    meetLink = "https://meet.google.com/abc-defg-hij"
    calendarLink = "https://calendar.google.com/calendar/render?action=TEMPLATE"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $anonKey"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod `
        -Uri "https://hpclxgpvmnxdnhrqczdz.supabase.co/functions/v1/send-invitation" `
        -Method Post `
        -Headers $headers `
        -Body $body

    Write-Host "✅ Email envoyé avec succès!" -ForegroundColor Green
    Write-Host "Réponse:" -ForegroundColor Yellow
    $response | ConvertTo-Json
    Write-Host ""
    Write-Host "Vérifiez votre boîte mail: $testEmail" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur lors de l'envoi:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Vérifications:" -ForegroundColor Yellow
    Write-Host "1. RESEND_API_KEY est-il configuré? supabase secrets list" -ForegroundColor White
    Write-Host "2. La fonction est-elle déployée? supabase functions list" -ForegroundColor White
    Write-Host "3. L'ANON_KEY est-il correct? Vérifiez dans .env" -ForegroundColor White
}

Write-Host ""
