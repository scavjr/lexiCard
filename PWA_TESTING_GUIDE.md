# PWA Testing & Validation Guide

## 1. Geração de Ícones

**Status:** ⏳ Pendente (execute o script abaixo)

```bash
# Instalar dependência
npm install sharp

# Gerar ícones automaticamente
node scripts/generate-icons.js
```

Ou manualmente em: https://convertio.co/svg-png/

## 2. Validação Local

### Chrome DevTools

1. **F12 → Application → Manifest**
   - ✅ Verificar se `manifest.json` é reconhecido
   - ✅ Verificar ícones (192x192, 512x512)
   - ✅ Verificar `display: "standalone"`
   - ✅ Verificar `start_url: "/"`

2. **F12 → Application → Service Workers**
   - ✅ Service Worker registrado
   - ✅ Status: "activated and running"
   - ✅ Scopes: `/`

3. **F12 → Network**
   - ✅ Throttle para "Offline"
   - ✅ Tentar acessar a app
   - ✅ Deve exibir página offline graciosamente

### Instalação

1. **Desktop (Chrome/Edge)**
   - Clicar ícone de instalação (canto superior direito da barra de endereço)
   - Confirmar instalação
   - Testar abrir via app launcher

2. **Mobile (Android Chrome)**
   - Menu (⋮) → "Instalar app"
   - Aparece na home screen
   - Deve abrir em full-screen sem address bar

## 3. Lighthouse Audit

```bash
# Usando CLI (instalado globalmente)
lighthouse http://localhost:8081 --view

# Ou via Chrome DevTools
# F12 → Lighthouse → Generate report (PWA category)
```

**Checklist de Pontuação:**

- ✅ Web App Manifest: presente com ícones
- ✅ Service Worker: registrado e funcional
- ✅ HTTPS: (não necessário para localhost)
- ✅ Viewport meta tag: presente
- ✅ Theme color: definido

## 4. Teste de Funcionalidade Offline

1. **Antes do teste:**
   - Abrir app no navegador
   - Fazer login
   - Fazer uma requisição (ex: carregar flashcard)

2. **Teste:**
   - Ir a DevTools → Network
   - Throttle para "Offline"
   - Atualizar página (F5)
   - **Esperado:** Página carrega (Service Worker serving cache)

3. **API Fallback:**
   - Com throttle "Offline"
   - Tentar fazer "Acertei" em um flashcard
   - **Esperado:** Erro amigável ou queue para sync

## 5. Background Sync (Opcional)

Para sincronização automática quando voltar online:

```typescript
// No app, após ação offline:
if ("serviceWorker" in navigator && "SyncManager" in window) {
  navigator.serviceWorker.ready.then((sw) => {
    sw.sync.register("sync-progress");
  });
}
```

## 6. Push Notifications (Opcional)

Para lembretes de estudo:

```typescript
// Solicitar permissão
Notification.requestPermission().then((perm) => {
  if (perm === "granted") {
    // Inscrever em push
    navigator.serviceWorker.ready.then((sw) => {
      sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY),
      });
    });
  }
});
```

## 7. Checklist Final

- [ ] Ícones 192x192 e 512x512 gerados
- [ ] manifest.json válido (validar em: https://manifest-validator.appspot.com/)
- [ ] Service Worker registrado
- [ ] Offline gracioso (página offline exibida)
- [ ] Instalação via Chrome menu
- [ ] Lighthouse PWA score ≥ 90
- [ ] Testado em Android (Chrome)
- [ ] Testado em iOS (Safari)
- [ ] Performance bom em 3G throttled

## 8. Troubleshooting

### Service Worker não registra

```javascript
// Verificar no console
navigator.serviceWorker.getRegistrations().then((regs) => {
  console.log("Registrations:", regs);
});
```

### Manifest não aparece

- Verificar MIME type: `Content-Type: application/manifest+json`
- Verificar caminho absoluto no `<link rel="manifest" href="/manifest.json">`

### Ícones não aparecem

- Verificar tamanho dos ícones (192x192, 512x512)
- Verificar formato PNG ou SVG
- Verificar MIME type correto

### Cache quebrado

- Limpar caches: `caches.delete('lexicard-v1')` no console
- Unregister service worker no DevTools
- Hard refresh (Ctrl+Shift+R)

## 9. Próximas Fases

1. **Verificação no OceanDigital:**
   - Deploy em staging
   - Testar PWA em ambiente real
   - Verificar HTTPS (obrigatório para PWA)

2. **Analytics:**
   - Monitorar instalações
   - Erro de Service Worker

3. **Otimizações:**
   - Comprimir assets
   - Cache strategy refinado
   - Code splitting

## Referências

- [MDN: Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Google: Web App Manifest](https://web.dev/add-manifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web.dev: PWA Checklist](https://web.dev/pwa-checklist/)
