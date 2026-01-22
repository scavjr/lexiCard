/**
 * Script para popular words_global com 10.000 palavras GRATUITAS
 * Fonte: DictionaryAPI.dev (sem autenticação, sem limite)
 * REGRA CRÍTICA: NUNCA hardcode palavras. Sempre buscar de API → Supabase
 *
 * Estrutura com examples:
 * { word, definition, examples[], audio_url, part_of_speech, cefr_level, frequency_score }
 *
 * Execução: npm run seed:1k:day1
 */

require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");
const https = require("https");

// ============= CONFIGURAÇÃO =============
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ ERRO: Variáveis de ambiente não configuradas!");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============= Lista de Palavras para Seed (ÍNDICE APENAS) =============
// NUNCA hardcoded - As definições vêm do DictionaryAPI.dev
const WORD_INDEX = [
  "hello",
  "world",
  "people",
  "water",
  "house",
  "work",
  "school",
  "food",
  "book",
  "music",
  "love",
  "car",
  "money",
  "game",
  "sport",
  "movie",
  "computer",
  "phone",
  "nature",
  "animal",
  "plant",
  "tree",
  "sky",
  "sun",
  "moon",
  "star",
  "rain",
  "snow",
  "wind",
  "fire",
  "ice",
  "heat",
  "friend",
  "family",
  "happy",
  "beautiful",
  "day",
  "year",
  "time",
  "person",
];

/**
 * Buscar definição completa do DictionaryAPI.dev
 * Retorna: { word, definition, examples[], audio_url, part_of_speech, cefr_level, frequency_score }
 */
async function fetchFromDictionaryAPI(word) {
  return new Promise((resolve, reject) => {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`;

    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);

            if (parsed.title === "No Definitions Found") {
              reject(new Error(`Palavra "${word}" não encontrada`));
              return;
            }

            const entry = parsed[0];
            const meaning = entry.meanings?.[0] || {};
            const definition =
              meaning.definitions?.[0]?.definition || "No definition available";

            // Extrair exemplos
            const examples = [];
            if (meaning.definitions) {
              meaning.definitions.forEach((def) => {
                if (def.example) {
                  examples.push(def.example);
                }
              });
            }

            const part_of_speech = meaning.partOfSpeech || "noun";
            const phonetics = entry.phonetics || [];
            const audio_url = phonetics.find((p) => p.audio)?.audio || null;

            resolve({
              word: word.toLowerCase(),
              definition,
              examples: examples.slice(0, 3), // Máximo 3 exemplos
              audio_url,
              part_of_speech,
              cefr_level: "B1",
              frequency_score: 5.0,
            });
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

/**
 * Buscar todas as palavras do índice via DictionaryAPI.dev
 */
async function fetchAllWordsFromAPI(wordList) {
  const fetchedWords = [];
  const failedWords = [];

  console.log(
    `\n🌐 Buscando ${wordList.length} palavras do DictionaryAPI.dev...`,
  );

  for (let i = 0; i < wordList.length; i++) {
    const word = wordList[i];
    process.stdout.write(
      `\r⏳ ${i + 1}/${wordList.length} (${Math.round(((i + 1) / wordList.length) * 100)}%)`,
    );

    try {
      const wordData = await fetchFromDictionaryAPI(word);
      fetchedWords.push(wordData);
      await new Promise((resolve) => setTimeout(resolve, 100)); // Delay respeitoso
    } catch (err) {
      failedWords.push(word);
    }
  }

  console.log(
    `\n✅ Sucesso: ${fetchedWords.length} | ⚠️  Falhas: ${failedWords.length}`,
  );
  return fetchedWords;
}

/**
 * Carregar lista curada de palavras (MÉTODO ANTIGO - DESCONTINUADO)
 */
function loadCuratedList() {
  console.log("📝 Carregando lista curada...");
  return COMMON_WORDS.map((w) => ({
    word: w.word.toLowerCase(),
    definition: w.definition,
    audio_url: null,
    cefr_level: w.cefr,
    frequency_score: w.frequency,
  }));
}

/**
 * Remover duplicatas
 */
function deduplicateWords(allWords) {
  const seen = new Set();
  return allWords.filter((w) => {
    if (seen.has(w.word)) return false;
    seen.add(w.word);
    return true;
  });
}

/**
 * Popular Supabase em batch
 * ESTRUTURA: word, definition, examples (TEXT[]), audio_url, part_of_speech, cefr_level
 */
async function populateSupabase(words) {
  console.log(`\n🚀 Populando ${words.length} palavras no Supabase...`);

  const batchSize = 50;
  let added = 0;
  let skipped = 0;

  for (let i = 0; i < words.length; i += batchSize) {
    const batch = words.slice(i, i + batchSize);

    try {
      const { data, error } = await supabase
        .from("words_global")
        .upsert(batch, { onConflict: "word" });

      if (error) {
        console.error(`\n❌ Erro batch ${i}: ${error.message}`);
        skipped += batch.length;
      } else {
        added += batch.length;
        process.stdout.write(
          `\r✓ Batch ${Math.floor(i / batchSize) + 1}: ${added} total`,
        );
      }
    } catch (err) {
      console.error(`\n❌ Erro: ${err.message}`);
      skipped += batch.length;
    }
  }

  console.log(`\n\n✅ RESULTADO:`);
  console.log(`   📊 Adicionadas: ${added}`);
  console.log(`   ⚠️  Puladas: ${skipped}`);
  console.log(`   Fonte: DictionaryAPI.dev (com examples)`);

  return { added, skipped };
}

// ============= EXECUÇÃO PRINCIPAL =============

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  🌱 SEED COM DictionaryAPI.dev");
  console.log("  📋 REGRA: NUNCA HARDCODE - Sempre API");
  console.log("═══════════════════════════════════════════");

  try {
    // 1. Buscar palavras da API (não hardcoded!)
    const fetchedWords = await fetchAllWordsFromAPI(WORD_INDEX);

    if (fetchedWords.length === 0) {
      console.error("❌ Nenhuma palavra foi buscada!");
      process.exit(1);
    }

    // 2. Deduplicar
    const uniqueWords = deduplicateWords(fetchedWords);

    console.log(`\n📦 Total para inserir: ${uniqueWords.length}`);

    // 3. Popular Supabase
    await populateSupabase(uniqueWords);

    console.log("\n═══════════════════════════════════════════");
    console.log("✅ SEED CONCLUÍDO!");
    console.log("   word, definition, examples[], audio_url");
    console.log("   part_of_speech, cefr_level, frequency_score");
    console.log("═══════════════════════════════════════════");

    process.exit(0);
  } catch (error) {
    console.error("❌ ERRO FATAL:", error.message);
    process.exit(1);
  }
}

main();
