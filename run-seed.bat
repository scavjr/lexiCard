@echo off
REM ============================================================================
REM Script para fazer seed com DictionaryAPI.dev e exemplos
REM ============================================================================

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  🌱 SEED COM DictionaryAPI.dev - Com Examples e Áudio         ║
echo ║  Status: Coluna examples adicionada ✅                        ║
echo ║  Tabela limpa: 0 palavras                                     ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo [1/3] Verificando dependências...
if not exist node_modules (
  echo ❌ node_modules não encontrado. Instalando...
  call npm install
)

echo [2/3] Validando .env.local...
if not exist .env.local (
  echo ❌ ERRO: .env.local não encontrado!
  pause
  exit /b 1
)
echo ✅ .env.local OK

echo [3/3] Executando seed script...
echo.
call npm run seed:1k:day1

if %errorlevel% neq 0 (
  echo.
  echo ❌ ERRO ao executar seed!
  pause
  exit /b 1
)

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  ✅ SEED CONCLUÍDO COM SUCESSO!                               ║
echo ║  Próximo: Validar dados em Supabase                           ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

pause
