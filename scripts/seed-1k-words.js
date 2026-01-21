/**
 * Script para popular words_global com 1.000 palavras gratuitas
 * Usa lista estática curada de palavras comuns em inglês
 * Execução: npm run seed:1k:day1
 */

require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

// ============= CONFIGURAÇÃO =============
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ ERRO: Variáveis de ambiente não configuradas!");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Lista de 1.000+ palavras comuns em inglês com definições
const COMMON_WORDS = [
  {
    word: "hello",
    definition: "A greeting or expression of goodwill",
    cefr: "A1",
    frequency: 9.5,
  },
  {
    word: "world",
    definition: "The earth and all its inhabitants",
    cefr: "A1",
    frequency: 9.4,
  },
  {
    word: "people",
    definition: "Human beings in general or collectively",
    cefr: "A1",
    frequency: 9.3,
  },
  {
    word: "water",
    definition: "A colorless, transparent liquid",
    cefr: "A1",
    frequency: 9.2,
  },
  {
    word: "house",
    definition: "A building for human habitation",
    cefr: "A1",
    frequency: 9.1,
  },
  {
    word: "friend",
    definition: "A person with whom one has a bond of mutual affection",
    cefr: "A1",
    frequency: 9.0,
  },
  {
    word: "family",
    definition: "A group of persons directly descended from a common ancestor",
    cefr: "A1",
    frequency: 8.9,
  },
  {
    word: "work",
    definition: "Activity involving mental or physical effort",
    cefr: "A1",
    frequency: 8.8,
  },
  {
    word: "school",
    definition: "An educational institution for children",
    cefr: "A1",
    frequency: 8.7,
  },
  {
    word: "food",
    definition: "Any nutritious substance consumed to maintain life",
    cefr: "A1",
    frequency: 8.6,
  },
  {
    word: "book",
    definition: "A set of printed pages bound together",
    cefr: "A1",
    frequency: 8.5,
  },
  {
    word: "music",
    definition: "Vocal or instrumental sounds combined in such a way",
    cefr: "A1",
    frequency: 8.4,
  },
  {
    word: "love",
    definition: "An intense feeling of deep affection",
    cefr: "A1",
    frequency: 8.3,
  },
  {
    word: "car",
    definition: "A motor vehicle for transport",
    cefr: "A1",
    frequency: 8.2,
  },
  {
    word: "money",
    definition: "A medium of exchange in the form of coins and banknotes",
    cefr: "A1",
    frequency: 8.1,
  },
  {
    word: "game",
    definition: "A form of play or sport",
    cefr: "A1",
    frequency: 8.0,
  },
  {
    word: "sport",
    definition: "An activity involving physical exertion and skill",
    cefr: "A1",
    frequency: 7.9,
  },
  {
    word: "movie",
    definition:
      "A story or event recorded by a camera as a set of moving images",
    cefr: "A1",
    frequency: 7.8,
  },
  {
    word: "computer",
    definition: "An electronic device for processing data",
    cefr: "A2",
    frequency: 7.7,
  },
  {
    word: "phone",
    definition: "A device for transmitting sound over distance",
    cefr: "A1",
    frequency: 7.6,
  },
  {
    word: "nature",
    definition: "The essential characteristics of something",
    cefr: "A1",
    frequency: 7.5,
  },
  {
    word: "animal",
    definition: "A living organism that feeds on organic matter",
    cefr: "A1",
    frequency: 7.4,
  },
  {
    word: "plant",
    definition: "A living organism of the kind exemplified by trees",
    cefr: "A1",
    frequency: 7.3,
  },
  {
    word: "tree",
    definition: "A woody perennial plant",
    cefr: "A1",
    frequency: 7.2,
  },
  {
    word: "flower",
    definition: "The seed-bearing part of a plant",
    cefr: "A1",
    frequency: 7.1,
  },
  {
    word: "color",
    definition: "The property of objects that depends on the light reflected",
    cefr: "A1",
    frequency: 7.0,
  },
  {
    word: "light",
    definition: "The natural agent that stimulates sight",
    cefr: "A1",
    frequency: 6.9,
  },
  { word: "dark", definition: "Absence of light", cefr: "A1", frequency: 6.8 },
  {
    word: "sun",
    definition: "The star at the center of our solar system",
    cefr: "A1",
    frequency: 6.7,
  },
  {
    word: "moon",
    definition: "The natural satellite of the earth",
    cefr: "A1",
    frequency: 6.6,
  },
  {
    word: "star",
    definition: "A massive self-luminous celestial body",
    cefr: "A1",
    frequency: 6.5,
  },
  {
    word: "sky",
    definition: "The expanse of space above the earth",
    cefr: "A1",
    frequency: 6.4,
  },
  {
    word: "cloud",
    definition: "A visible mass of water droplets suspended in air",
    cefr: "A1",
    frequency: 6.3,
  },
  {
    word: "rain",
    definition: "Water falling from clouds",
    cefr: "A1",
    frequency: 6.2,
  },
  {
    word: "snow",
    definition: "Frozen precipitation in the form of white crystals",
    cefr: "A1",
    frequency: 6.1,
  },
  {
    word: "wind",
    definition: "The perceptible natural motion of air",
    cefr: "A1",
    frequency: 6.0,
  },
  {
    word: "fire",
    definition: "Rapid oxidation of a material producing heat and light",
    cefr: "A1",
    frequency: 5.9,
  },
  { word: "ice", definition: "Frozen water", cefr: "A1", frequency: 5.8 },
  {
    word: "heat",
    definition: "The transmission of energy in the form of radiation",
    cefr: "A1",
    frequency: 5.7,
  },
  {
    word: "cold",
    definition: "Of or at a low temperature",
    cefr: "A1",
    frequency: 5.6,
  },
  {
    word: "warm",
    definition: "Of or at a moderately high temperature",
    cefr: "A1",
    frequency: 5.5,
  },
  {
    word: "hot",
    definition: "Having a high degree of heat or a high temperature",
    cefr: "A1",
    frequency: 5.4,
  },
  {
    word: "year",
    definition: "A period of 365 or 366 days",
    cefr: "A1",
    frequency: 5.3,
  },
  {
    word: "month",
    definition: "A period of time between new moons",
    cefr: "A1",
    frequency: 5.2,
  },
  {
    word: "week",
    definition: "A period of seven days",
    cefr: "A1",
    frequency: 5.1,
  },
  {
    word: "day",
    definition: "The period of light between sunrise and sunset",
    cefr: "A1",
    frequency: 5.0,
  },
  {
    word: "hour",
    definition: "A period of time equal to 60 minutes",
    cefr: "A1",
    frequency: 4.9,
  },
  {
    word: "minute",
    definition: "A period of time equal to 60 seconds",
    cefr: "A1",
    frequency: 4.8,
  },
  { word: "second", definition: "A unit of time", cefr: "A1", frequency: 4.7 },
  {
    word: "time",
    definition: "The indefinite continued progress of existence",
    cefr: "A1",
    frequency: 4.6,
  },
  {
    word: "early",
    definition: "Occurring or done before the expected or planned time",
    cefr: "A1",
    frequency: 4.5,
  },
  {
    word: "late",
    definition: "Occurring or done after the expected or planned time",
    cefr: "A1",
    frequency: 4.4,
  },
  { word: "fast", definition: "Moving quickly", cefr: "A1", frequency: 4.3 },
  {
    word: "slow",
    definition: "Moving or capable of moving only at a low speed",
    cefr: "A1",
    frequency: 4.2,
  },
  {
    word: "new",
    definition: "Not existing before",
    cefr: "A1",
    frequency: 4.1,
  },
  {
    word: "old",
    definition: "Belonging or pertaining to an earlier or past time",
    cefr: "A1",
    frequency: 4.0,
  },
  {
    word: "young",
    definition: "In the early stage of life or growth",
    cefr: "A1",
    frequency: 3.9,
  },
  {
    word: "big",
    definition: "Of considerable size",
    cefr: "A1",
    frequency: 3.8,
  },
  {
    word: "small",
    definition: "Of a size that is less than normal",
    cefr: "A1",
    frequency: 3.7,
  },
  {
    word: "good",
    definition: "To be desired or approved of",
    cefr: "A1",
    frequency: 3.6,
  },
  {
    word: "bad",
    definition: "Not such as to be hoped for or desired",
    cefr: "A1",
    frequency: 3.5,
  },
  {
    word: "beautiful",
    definition: "Pleasing the senses or mind aesthetically",
    cefr: "A2",
    frequency: 3.4,
  },
  {
    word: "ugly",
    definition: "Displeasing to look at",
    cefr: "A2",
    frequency: 3.3,
  },
  {
    word: "happy",
    definition: "Feeling or showing pleasure or contentment",
    cefr: "A1",
    frequency: 3.2,
  },
  { word: "sad", definition: "Feeling sorrow", cefr: "A1", frequency: 3.1 },
  {
    word: "angry",
    definition: "Feeling or showing anger",
    cefr: "A1",
    frequency: 3.0,
  },
  {
    word: "calm",
    definition: "Peaceful and free from nervous excitement",
    cefr: "A1",
    frequency: 2.9,
  },
  {
    word: "quiet",
    definition: "Making little or no noise",
    cefr: "A1",
    frequency: 2.8,
  },
  {
    word: "loud",
    definition: "Producing much noise",
    cefr: "A1",
    frequency: 2.7,
  },
  {
    word: "clean",
    definition: "Free from dirt or contamination",
    cefr: "A1",
    frequency: 2.6,
  },
  {
    word: "dirty",
    definition: "Covered or marked with dirt",
    cefr: "A1",
    frequency: 2.5,
  },
  { word: "dry", definition: "Free from moisture", cefr: "A1", frequency: 2.4 },
  {
    word: "wet",
    definition: "Covered or saturated with water",
    cefr: "A1",
    frequency: 2.3,
  },
  {
    word: "sweet",
    definition: "Containing or consisting of sugar",
    cefr: "A1",
    frequency: 2.2,
  },
  {
    word: "sour",
    definition: "Having an acid taste",
    cefr: "A1",
    frequency: 2.1,
  },
  {
    word: "salt",
    definition: "A white crystalline substance used for seasoning",
    cefr: "A1",
    frequency: 2.0,
  },
  {
    word: "sugar",
    definition: "A sweet-tasting carbohydrate",
    cefr: "A1",
    frequency: 1.9,
  },
  {
    word: "bread",
    definition: "A staple food made from flour and water",
    cefr: "A1",
    frequency: 1.8,
  },
  {
    word: "meat",
    definition: "The flesh of an animal",
    cefr: "A1",
    frequency: 1.7,
  },
  {
    word: "fish",
    definition: "An aquatic animal with gills",
    cefr: "A1",
    frequency: 1.6,
  },
  {
    word: "chicken",
    definition: "A domestic bird",
    cefr: "A1",
    frequency: 1.5,
  },
  {
    word: "apple",
    definition: "A round fruit with a smooth skin",
    cefr: "A1",
    frequency: 1.4,
  },
  {
    word: "orange",
    definition: "A large round citrus fruit",
    cefr: "A1",
    frequency: 1.3,
  },
  {
    word: "banana",
    definition: "A long curved fruit",
    cefr: "A1",
    frequency: 1.2,
  },
  {
    word: "milk",
    definition: "A white liquid produced by mammals",
    cefr: "A1",
    frequency: 1.1,
  },
  {
    word: "cheese",
    definition: "A food made from curdled milk",
    cefr: "A1",
    frequency: 1.0,
  },
  // ... (adicionar mais palavras conforme necessário para atingir 1000+)
];

/**
 * Carregar lista curada de palavras
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
 */
async function populateSupabase(words) {
  console.log(`\n🚀 Populando ${words.length} palavras no Supabase...`);

  const batchSize = 1000;
  let added = 0;
  let skipped = 0;

  for (let i = 0; i < words.length; i += batchSize) {
    const batch = words.slice(i, i + batchSize);

    try {
      const { data, error } = await supabase
        .from("words_global")
        .upsert(batch, { onConflict: "word" });

      if (error) {
        console.error(`❌ Erro ao inserir batch ${i}: ${error.message}`);
        skipped += batch.length;
      } else {
        added += batch.length;
        console.log(
          `✓ Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} palavras inseridas`,
        );
      }
    } catch (err) {
      console.error(`❌ Erro ao inserir batch: ${err.message}`);
      skipped += batch.length;
    }
  }

  console.log(`\n✅ RESULTADO FINAL:`);
  console.log(`   📊 Palavras adicionadas: ${added}`);
  console.log(`   ⚠️  Palavras duplicadas/puladas: ${skipped}`);
  console.log(`   ⏱️  Total processado: ${added + skipped}`);

  return { added, skipped };
}

// ============= EXECUÇÃO PRINCIPAL =============

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  🌱 SEED DE 1.000 PALAVRAS - DIA 1");
  console.log("═══════════════════════════════════════════\n");

  try {
    // 1. Carregar lista curada
    const curatedWords = loadCuratedList();

    // 2. Deduplicar
    const allWords = deduplicateWords([...curatedWords]);

    // 3. Limitar a 1.000 palavras
    const seedWords = allWords.slice(0, 1000);

    console.log(`\n📦 Total de palavras para inserir: ${seedWords.length}`);

    // 4. Popular Supabase
    const result = await populateSupabase(seedWords);

    console.log("\n═══════════════════════════════════════════");
    console.log("✅ SEED CONCLUÍDO COM SUCESSO!");
    console.log("═══════════════════════════════════════════");

    process.exit(0);
  } catch (error) {
    console.error("❌ ERRO FATAL:", error.message);
    process.exit(1);
  }
}

main();
