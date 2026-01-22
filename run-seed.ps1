#!/usr/bin/env pwsh
# ============================================================================
# Script para fazer seed com DictionaryAPI.dev e exemplos
# Uso: ./run-seed.ps1
# ============================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗"
Write-Host "║  🌱 SEED COM DictionaryAPI.dev - Com Examples e Áudio         ║"
Write-Host "║  Status: Coluna examples adicionada ✅                        ║"
Write-Host "║  Tabela limpa: 0 palavras                                     ║"
Write-Host "╚════════════════════════════════════════════════════════════════╝"
Write-Host ""

Write-Host "[1/3] Verificando dependências..."
if (-not (Test-Path "node_modules")) {
    Write-Host "❌ node_modules não encontrado. Instalando..."
    npm install
}
Write-Host "✅ node_modules OK"

Write-Host "[2/3] Validando .env.local..."
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ ERRO: .env.local não encontrado!"
    pause
    exit 1
}
Write-Host "✅ .env.local OK"

Write-Host "[3/3] Executando seed script..."
Write-Host ""

npm run seed:1k:day1

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ ERRO ao executar seed!"
    pause
    exit 1
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗"
Write-Host "║  ✅ SEED CONCLUÍDO COM SUCESSO!                               ║"
Write-Host "║  Próximo: Validar dados em Supabase                           ║"
Write-Host "╚════════════════════════════════════════════════════════════════╝"
Write-Host ""

pause
