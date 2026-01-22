#!/usr/bin/env node

/**
 * Script para migrar palavras de seeds/words-list.json para words_global
 *
 * Estratégia:
 * - Lê arquivo JSON com lista de palavras
 * - Insere apenas coluna 'word' em words_global (lazy loading)
 * - Outras colunas (definition, audio_url, etc) são preenchidas sob demanda
 *
 * Execução: npm run seed:init
 */

require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// ============= CONFIGURAÇÃO =============
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ ERRO: Variáveis de ambiente não configuradas!");
  console.error(
    "   Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY em .env.local",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============= FUNÇÕES =============

async function loadWords() {
  const seedPath = path.join(__dirname, "..", "seeds", "words-list.json");

  if (!fs.existsSync(seedPath)) {
    console.error(`❌ ERRO: Arquivo não encontrado: ${seedPath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
  const words = Array.isArray(data) ? data : data.words || [];

  if (!Array.isArray(words) || words.length === 0) {
    console.error("❌ ERRO: Arquivo JSON inválido ou vazio");
    process.exit(1);
  }

  return words.map((w) => w.toLowerCase().trim()).filter((w) => w.length > 0);
}

async function seedWords() {
  console.log("\n🚀 Iniciando seed de palavras para words_global...\n");

  try {
    // 1. Carregar palavras
    console.log("📂 Carregando seeds/words-list.json...");
    const words = await loadWords();
    console.log(`📊 Total de palavras: ${words.length}\n`);

    // 2. Verificar words existentes
    console.log("🔍 Verificando palavras existentes...");
    const { data: existingWords, error: selectError } = await supabase
      .from("words_global")
      .select("word");

    if (selectError) {
      console.error("❌ Erro ao consultar banco:", selectError.message);
      process.exit(1);
    }

    const existingSet = new Set(existingWords.map((w) => w.word.toLowerCase()));
    const newWords = words.filter((w) => !existingSet.has(w.toLowerCase()));

    console.log(`✅ Palavras existentes: ${existingWords.length}`);
    console.log(`✨ Palavras novas para inserir: ${newWords.length}\n`);

    if (newWords.length === 0) {
      console.log("ℹ️  Nenhuma palavra nova para inserir.");
      process.exit(0);
    }

    // 3. Preparar batch de inserção
    const BATCH_SIZE = 500;
    let totalInserted = 0;
    let totalErrors = 0;

    console.log(`🔄 Inserindo em batches de ${BATCH_SIZE}...\n`);

    for (let i = 0; i < newWords.length; i += BATCH_SIZE) {
      const batch = newWords.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(newWords.length / BATCH_SIZE);

      process.stdout.write(`   Batch ${batchNum}/${totalBatches}: `);

      // Preparar records para inserção
      const records = batch.map((word) => ({
        word: word.toLowerCase(),
      }));

      // Inserir batch (UPSERT para evitar duplicatas)
      const { data, error } = await supabase
        .from("words_global")
        .upsert(records, { onConflict: "word" });

      if (error) {
        console.log(`❌ ERRO: ${error.message.substring(0, 50)}...`);
        totalErrors += batch.length;
      } else {
        console.log(`✅ ${batch.length} palavras`);
        totalInserted += batch.length;
      }

      // Pequeno delay para não sobrecarregar
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // 4. Resumo final
    console.log("\n" + "=".repeat(50));
    console.log("📊 RESUMO DA EXECUÇÃO:");
    console.log("=".repeat(50));
    console.log(`✅ Inseridas: ${totalInserted}`);
    console.log(`❌ Erros: ${totalErrors}`);
    console.log(`💾 Tabela: words_global`);
    console.log(`📝 Colunas preenchidas: word`);
    console.log(
      `⏳ Colunas vazias: definition, audio_url, examples, part_of_speech, cefr_level`,
    );
    console.log(`📌 Próximo: Enriquecimento sob demanda via DictionaryAPI.dev`);
    console.log("=".repeat(50) + "\n");

    if (totalErrors > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ ERRO:", error.message);
    process.exit(1);
  }
}

// ============= EXECUÇÃO =============
seedWords();
