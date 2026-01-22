#!/usr/bin/env ts-node
/**
 * Script para preencher audio_url em words_global quando a API dictionaryapi.dev tem áudio.
 * Uso:
 *   npx ts-node scripts/fix-missing-audio.ts
 */

const SUPABASE_URL = "https://vmyhvjpnwqmhwqkcbvuk.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZteWh2anBud3FtaHdxa2NidnVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5Mzg2NDgsImV4cCI6MjA4NDUxNDY0OH0.Y7cec5VrQ6sm315G3ek6RH1CwpU2zwvU7MlI0fSlim8";

const DICTIONARY_API_BASE_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";

async function fetchAudio(word: string): Promise<string | null> {
  try {
    const res = await fetch(`${DICTIONARY_API_BASE_URL}${encodeURIComponent(word.toLowerCase())}`);
    if (!res.ok) return null;
    const json: any = await res.json();
    if (!Array.isArray(json) || json.length === 0) return null;
    const entry = json[0];
    const phonetics: any[] = entry?.phonetics || [];
    const withAudio = phonetics.find((p) => p.audio && p.audio.trim().length > 0);
    return withAudio?.audio || null;
  } catch (err) {
    console.warn(`fetchAudio error for ${word}:`, err);
    return null;
  }
}

async function getWordsWithoutAudio(): Promise<any[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/words_global?audio_url=is.null&limit=5000&select=id,word`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );
  if (!res.ok) {
    throw new Error(`Erro ao buscar palavras: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function updateWordAudio(id: string, audioUrl: string): Promise<boolean> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/words_global?id=eq.${id}`,
    {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ audio_url: audioUrl }),
    }
  );
  if (!res.ok) {
    console.warn(`Erro ao atualizar ID ${id}: ${res.status} ${res.statusText}`);
    return false;
  }
  return true;
}

async function main() {
  console.log("🔍 Buscando palavras sem audio_url...");
  try {
    const data = await getWordsWithoutAudio();
    const words = data || [];
    console.log(`Encontradas ${words.length} palavras sem áudio.`);

    let updated = 0;
    for (const w of words) {
      const audio = await fetchAudio(w.word);
      if (!audio) {
        console.log(`✗ ${w.word} - sem áudio na API`);
        continue;
      }

      const success = await updateWordAudio(w.id, audio);
      if (!success) continue;

      updated += 1;
      console.log(`✓ ${w.word} -> ${audio}`);
      await new Promise((r) => setTimeout(r, 120));
    }

    console.log(`✅ Finalizado. Atualizadas ${updated}/${words.length} palavras.`);
  } catch (err) {
    console.error("❌ Erro fatal:", err);
    process.exit(1);
  }
}

main();