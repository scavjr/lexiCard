// Placeholder - será sobrescrito pelo script inject-env.js durante o build
// Para desenvolvimento local, crie um arquivo .env.local com as variáveis

export const ENV_CONFIG = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
};
