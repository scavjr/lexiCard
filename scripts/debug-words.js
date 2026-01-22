import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
);

async function debugWords() {
  console.log("🔍 Debugando palavras na base de dados...\n");

  try {
    // 1. Contar total de palavras
    const { count: totalWords, error: countError } = await supabase
      .from("words_global")
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;
    console.log(`📊 Total de palavras: ${totalWords}\n`);

    // 2. Pegar primeiras 10 palavras
    const { data: firstWords, error: firstError } = await supabase
      .from("words_global")
      .select("id, word, definition, audio_url, examples")
      .limit(10);

    if (firstError) throw firstError;
    console.log("📝 Primeiras 10 palavras:");
    firstWords.forEach((w, i) => {
      console.log(
        `  ${i + 1}. ${w.word} - ${w.definition || "(sem definição)"}`,
      );
    });

    // 3. Contar palavras com definição
    const { count: wordsWithDef, error: defError } = await supabase
      .from("words_global")
      .select("*", { count: "exact", head: true })
      .not("definition", "is", null);

    if (defError) throw defError;
    console.log(`\n✅ Palavras COM definição: ${wordsWithDef}`);
    console.log(`❌ Palavras SEM definição: ${totalWords - wordsWithDef}`);

    // 4. Testar query de seleção (como ExerciseSelector faz)
    const { data: selectedWords, error: selectError } = await supabase
      .from("words_global")
      .select("id, word, definition, audio_url, examples")
      .order("word", { ascending: true })
      .limit(200);

    if (selectError) throw selectError;
    console.log(`\n🎯 Limite 200 palavras: ${selectedWords.length} obtidas`);

    // 5. Verificar user_progress para entender "completadas"
    const { data: progress, error: progError } = await supabase
      .from("user_progress")
      .select("word_id, acertos")
      .gte("acertos", 3)
      .limit(50);

    if (progError) throw progError;
    console.log(`\n📈 Palavras com acertos >= 3: ${progress.length}`);

    const completedIds = new Set(progress.map((p) => p.word_id));

    // 6. Simular o filtro do ExerciseSelector
    const filtered = selectedWords
      .filter((w) => !completedIds.has(w.id))
      .slice(0, 20);

    console.log(`\n✨ Após filtro (removendo completadas e pegando 20):`);
    console.log(`   Total: ${filtered.length} palavras\n`);

    if (filtered.length > 0) {
      console.log("   Exemplo das palavras que seriam mostradas:");
      filtered.slice(0, 5).forEach((w, i) => {
        console.log(`   ${i + 1}. ${w.word}`);
      });
    } else {
      console.log("   ⚠️ NENHUMA PALAVRA! Todas estão completadas!");
    }
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

debugWords();
