#!/usr/bin/env node

/**
 * Script de Teste - Verificar busca de palavras na API DictionaryAPI.dev
 *
 * Uso: node test-api-fetch.js [palavra]
 * Exemplo: node test-api-fetch.js hello
 */

const https = require("https");

const DICTIONARY_API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";

function fetchFromAPI(word) {
  return new Promise((resolve, reject) => {
    const url = `${DICTIONARY_API_URL}${word.toLowerCase()}`;
    console.log(`\n🔗 Buscando: ${url}`);

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
              console.log(`❌ Palavra não encontrada: "${word}"`);
              reject(new Error(`Palavra "${word}" não encontrada`));
              return;
            }

            const entry = parsed[0];
            if (!entry) {
              console.log(`⚠️  Resposta vazia para: "${word}"`);
              resolve(null);
              return;
            }

            // Extrair dados
            const meaning = entry.meanings?.[0] || {};
            const definition =
              meaning.definitions?.[0]?.definition || "No definition available";

            // Extrair exemplos
            const examples = [];
            entry.meanings?.forEach((m) => {
              m.definitions?.forEach((d) => {
                if (d.example && examples.length < 3) {
                  examples.push(d.example);
                }
              });
            });

            // Extrair áudio
            let audio_url = null;
            const phonetics = entry.phonetics || [];
            for (const phonetic of phonetics) {
              if (phonetic.audio) {
                audio_url = phonetic.audio;
                break;
              }
            }

            // Part of speech
            const part_of_speech = meaning.partOfSpeech || "noun";

            const result = {
              word: word.toLowerCase(),
              definition,
              examples,
              audio_url,
              part_of_speech,
            };

            console.log(`\n✅ Dados encontrados:`);
            console.log(`   Palavra: ${result.word}`);
            console.log(`   Definição: ${result.definition}`);
            console.log(`   Part of Speech: ${result.part_of_speech}`);
            console.log(`   Áudio: ${result.audio_url ? "SIM" : "NÃO"}`);
            console.log(`   Exemplos: ${result.examples.length}`);
            if (result.examples.length > 0) {
              result.examples.forEach((ex, idx) => {
                console.log(`      ${idx + 1}. ${ex}`);
              });
            }

            resolve(result);
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

async function main() {
  const word = process.argv[2] || "hello";

  console.log("═══════════════════════════════════════════");
  console.log("  🧪 TESTE DE BUSCA NA API");
  console.log("  DictionaryAPI.dev");
  console.log("═══════════════════════════════════════════");

  try {
    await fetchFromAPI(word);
    console.log("\n✅ Teste concluído com sucesso!");
  } catch (err) {
    console.error(`\n❌ Erro: ${err.message}`);
    process.exit(1);
  }
}

main();
