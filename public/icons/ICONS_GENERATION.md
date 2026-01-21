<!-- Documentação: Como Gerar os Ícones PNG

Este arquivo documenta como converter o SVG base em ícones PNG para a PWA.

## Opção 1: Online (Rápido)
1. Ir para https://convertio.co/svg-png/
2. Fazer upload de: ../icon-base.svg
3. Ajustar tamanho: 192x192 e 512x512
4. Download dos PNGs
5. Renomear e colocar em public/icons/

## Opção 2: ImageMagick (Linha de comando)
```bash
cd public
convert icon-base.svg -density 150 -size 192x192 icons/icon-192x192.png
convert icon-base.svg -density 150 -size 512x512 icons/icon-512x512.png
```

## Opção 3: Usando Node.js + sharp
```bash
npm install sharp
node -e "
const sharp = require('sharp');
sharp('public/icon-base.svg')
  .png()
  .resize(192, 192)
  .toFile('public/icons/icon-192x192.png');
sharp('public/icon-base.svg')
  .png()
  .resize(512, 512)
  .toFile('public/icons/icon-512x512.png');
"
```

## Ícones Necessários:
- ✅ icon-192x192.png (App icon padrão)
- ✅ icon-192x192-maskable.png (Versão maskable para bordas)
- ✅ icon-512x512.png (Splash screen)
- ✅ icon-512x512-maskable.png (Versão maskable para splash)
- ✅ favicon-32x32.png (Browser favicon)
- ✅ favicon-16x16.png (Browser tab icon)
- ⚠️ shortcut-192x192.png (Atalhos do menu)
- ⚠️ screenshot-1.png (540x720 - retrato)
- ⚠️ screenshot-2.png (960x720 - paisagem)

## Maskable Icons:
Versões maskable devem ter ícone centralizado com margem de ~20%.
Útil para ícones adaptáveis em diferentes formatos (arredondados, quadrados, etc).

## Próximos Passos:
1. Gerar os ícones usando um dos métodos acima
2. Colocar em: public/icons/
3. Testar no Chrome DevTools → Application → Manifest
4. Validar com Lighthouse PWA audit
-->
