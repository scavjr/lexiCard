# ✅ Task 3.2: Testes Rápidos - Guia Prático

## 🎯 Testes de 5 Minutos

### ✅ Teste 1: Validar Manifest (2 min)

1. **Abrir Chrome DevTools**
   - Pressione `F12`
2. **Ir para Application → Manifest**
   - Na aba esquerda: `Application` (Chrome) ou `Storage` (Firefox)
   - Selecione `Manifest`
3. **Verificar Metadados**

   ```
   ✅ Name: "LexiCard - Aprenda Vocabulário"
   ✅ Short Name: "LexiCard"
   ✅ Description: "Aprenda vocabulário em inglês..."
   ✅ Start URL: "/"
   ✅ Display: "standalone"
   ✅ Theme Color: "#4F46E5"
   ✅ Background Color: "#F8FAFC"
   ✅ Orientation: "portrait-primary"
   ```

4. **Verificar Ícones**
   - Role para baixo até seção "Icons"
   - Deve aparecer:
     ```
     ✅ /icons/icon-192x192.png (192x192)
     ✅ /icons/icon-192x192-maskable.png (192x192, maskable)
     ✅ /icons/icon-512x512.png (512x512)
     ✅ /icons/icon-512x512-maskable.png (512x512, maskable)
     ```

5. **Verificar Screenshots**
   - Deve aparecer 2 screenshots:
     ```
     ✅ /icons/screenshot-1.png (540x720, narrow, narrow)
     ✅ /icons/screenshot-2.png (960x720, wide, wide)
     ```

6. **Resultado Esperado**
   - Ícones aparecem com preview visual
   - Nenhuma mensagem de erro em vermelho

---

### ✅ Teste 2: Validar Service Worker (1.5 min)

1. **Chrome DevTools → Application → Service Workers**

2. **Verificar Registro**
   - Deve aparecer:
     ```
     Scope: http://localhost:8081/
     Status: ✅ activated and running
     Last Update Time: [timestamp recente]
     ```

3. **Clicar em "lexicard-v1"** se listing de registrations
   - Deve mostrar status detalhado

4. **Resultado Esperado**
   - Status verde com "activated and running"
   - Nenhum erro em vermelho

---

### ✅ Teste 3: Validar Cache Storage (1 min)

1. **Chrome DevTools → Application → Cache Storage**

2. **Verificar Caches Criados**
   - Deve aparecer 3 caches:
     ```
     ✅ lexicard-v1
     ✅ lexicard-runtime-v1
     ✅ lexicard-api-v1
     ```

3. **Expandir "lexicard-v1"**
   - Deve conter arquivos em cache:
     ```
     ✅ / (index.html)
     ✅ /manifest.json
     ✅ /icons/icon-*.png
     ```

4. **Resultado Esperado**
   - Todos 3 caches aparecem
   - Arquivos em cache são listados

---

### ✅ Teste 4: Modo Offline (1 min)

1. **Chrome DevTools → Network tab**

2. **Throttle para Offline**
   - Na aba Network, encontre dropdown que diz "No throttling"
   - Mude para "Offline"

3. **Atualizar Página**
   - Pressione `F5` ou `Ctrl+R`

4. **Resultado Esperado**
   - ✅ Página carrega normalmente (do cache)
   - ✅ Offline indicator pode aparecer no topo
   - ✅ Nenhuma mensagem de erro de rede

5. **Voltar Online**
   - Mude throttle de volta para "No throttling"
   - Pressione F5 novamente

---

### ✅ Teste 5: Instalação PWA (Opcional - 1 min)

#### **Desktop (Chrome/Edge):**

1. Abrir a app em http://localhost:8081
2. Olhar para a **address bar** (onde escreve URL)
3. Deve aparecer **ícone de instalação** (depende do navegador):
   - Chrome: Ícone quadrado + "Instalar"
   - Edge: Ícone + "Instalar este aplicativo"
4. Clicar no ícone
5. Confirmar instalação no popup
6. **Resultado Esperado:**
   - ✅ App aparece no app launcher (Windows: Start → LexiCard)
   - ✅ Abre em modo standalone (sem barra de endereço)

#### **Mobile (Android Chrome):**

1. Abrir em https://localhost:8081 (requer HTTPS em prod)
2. Menu (⋮) no canto superior direito
3. Selecionar "Instalar app"
4. Confirmar
5. **Resultado Esperado:**
   - ✅ Ícone aparece na home screen
   - ✅ Abre em full-screen, sem UI do navegador

---

## 📋 Checklist de Testes

| Teste              | Resultado                 | Status     |
| ------------------ | ------------------------- | ---------- |
| Manifest metadados | Aparecem corretamente     | ⏳ A fazer |
| Ícones no manifest | 4 ícones aparecem         | ⏳ A fazer |
| Service Worker     | "activated and running"   | ⏳ A fazer |
| Caches             | 3 caches em Cache Storage | ⏳ A fazer |
| Offline mode       | Página carrega do cache   | ⏳ A fazer |
| Instalação         | Ícone/menu de install     | ⏳ A fazer |

---

## 🔍 Troubleshooting Rápido

### Manifest não aparece em DevTools

- **Solução:** Fazer hard refresh `Ctrl+Shift+R`
- **Verificar:** `<link rel="manifest" href="/manifest.json">` em index.html

### Service Worker não aparece

- **Solução:** Fazer hard refresh `Ctrl+Shift+R`
- **Console:** Digitar `navigator.serviceWorker.getRegistrations()` e ver resultado

### Página não carrega offline

- **Verificar:** Se offline indicator está visível (vermelho no topo)
- **Console:** Abrir F12 → Console e procurar por erros

### Ícones não aparecem no manifest

- **Solução:** Verificar se `/icons/*.png` existem (pasta public/icons/)
- **Path:** Deve ser absoluto `/icons/` não relativo `./icons/`

---

## 💡 Dicas

1. **Hard Refresh (Ctrl+Shift+R):** Limpa cache do navegador + recarrega Service Worker
2. **DevTools sempre aberto:** F12 durante testes para ver erros em tempo real
3. **Console:** `navigator.onLine` mostra status online/offline atual
4. **Local Storage:** DevTools → Application → Local Storage para ver dados persistidos

---

## 🎬 Próxima Ação

Após completar os 5 testes acima:

1. ✅ Testar offline
2. ✅ Testar instalação
3. ➜ Partir para **Task 4.1: Docker Configuration**

---

**Tempo total:** ~5 minutos ⏱️

Se tiver dúvidas durante os testes, consulte [PWA_TESTING_GUIDE.md](PWA_TESTING_GUIDE.md) para mais detalhes.
