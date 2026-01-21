#!/usr/bin/env node

/**
 * Script para gerar ícones PNG a partir do SVG base
 *
 * Instalação: npm install sharp
 * Execução: node scripts/generate-icons.js
 */

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const ICON_BASE = path.join(__dirname, "../public/icon-base.svg");
const ICONS_DIR = path.join(__dirname, "../public/icons");

// Garantir que o diretório existe
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

async function generateIcon(size, isMaskable = false) {
  const suffix = isMaskable ? "-maskable" : "";
  const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}${suffix}.png`);

  try {
    await sharp(ICON_BASE)
      .resize(size, size, {
        fit: "contain",
        background: isMaskable
          ? { r: 0, g: 0, b: 0, alpha: 0 }
          : { r: 248, g: 250, b: 252, alpha: 1 },
      })
      .png()
      .toFile(outputPath);

    console.log(`✅ Gerado: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Erro ao gerar ${outputPath}:`, error.message);
  }
}

async function generateFavicon(size) {
  const outputPath = path.join(ICONS_DIR, `favicon-${size}x${size}.png`);

  try {
    await sharp(ICON_BASE)
      .resize(size, size, {
        fit: "contain",
        background: { r: 248, g: 250, b: 252, alpha: 1 },
      })
      .png()
      .toFile(outputPath);

    console.log(`✅ Gerado: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Erro ao gerar ${outputPath}:`, error.message);
  }
}

async function main() {
  console.log("🎨 Gerando ícones PWA...\n");

  try {
    // Gerar ícones principais
    await generateIcon(192, false);
    await generateIcon(192, true);
    await generateIcon(512, false);
    await generateIcon(512, true);

    // Gerar favicons
    await generateFavicon(32);
    await generateFavicon(16);

    console.log("\n✨ Ícones gerados com sucesso!");
    console.log("📍 Localização: " + ICONS_DIR);
    console.log("\n💡 Próximos passos:");
    console.log(
      "1. Validar manifest.json em: Chrome DevTools → Application → Manifest",
    );
    console.log(
      "2. Testar modo offline em: Chrome DevTools → Network (throttle)",
    );
    console.log("3. Validar PWA com Lighthouse");
    console.log("4. Testar instalação em dispositivo real");
  } catch (error) {
    console.error("❌ Erro ao gerar ícones:", error);
    process.exit(1);
  }
}

main();
