# PRD: LexiCard - PWA para Aquisição de Vocabulário

## 1. Visão Geral

O LexiCard é um micro-SaaS de educação focado na memorização de vocabulário através de flashcards. O projeto utiliza uma abordagem **Offline-First**, garantindo que o usuário possa estudar mesmo sem conexão, sincronizando os dados com a nuvem assim que houver internet.

**Deployment:** OceanDigital (máquina dedicada com Docker/Kubernetes)

---

## 2. Stack Tecnológica (Arquitetura)

### Frontend
- **Framework:** Expo (React Native for Web) - Suporte a PWA, Android e iOS com código único
- **Linguagem:** TypeScript (Tipagem estrita para segurança de dados)
- **Estilização:** NativeWind (Tailwind CSS para interfaces fluidas)
- **Persistência Local:** AsyncStorage (Cache offline com sincronização)

### Backend & Dados
- **Banco de Dados:** Supabase (PostgreSQL + Auth + RLS)
  - Multi-tenant com isolamento por `organization_id`
  - Estratégia híbrida: `words_global` (compartilhadas) + `words` (org-specific)
- **APIs Externas:** dictionaryapi.dev (Dados semânticos e áudio)

### DevOps & Deployment
- **Hospedagem:** OceanDigital (Droplet com Docker)
- **CI/CD:** GitHub Actions (build e deploy automático)
- **Containerização:** Docker + docker-compose
- **Web Server:** Nginx (reverse proxy + gzip + cache headers)
- **SSL/TLS:** Let's Encrypt com auto-renewal

---

## 3. Regras de Negócio e Fluxo de Dados

### 3.1. Estratégia de Cache (Híbrida)

Sempre que o usuário buscar uma palavra, o sistema deve seguir esta ordem:

1. **Local:** Verificar se a palavra existe no AsyncStorage (org-specific namespace)
2. **Cloud:** Se não estiver local, buscar no Supabase
   - Buscar em `words_global` (compartilhada entre orgs)
   - Buscar customizações em `words` (organization_id filtered)
3. **API:** Se não existir em nenhum lugar, buscar na dictionaryapi.dev
4. **Sincronização:** Após a busca na API, salvar:
   - Base em `words_global` (1x, UNIQUE constraint)
   - Customizações em `words` (org-specific)
   - Cache em AsyncStorage (local)

### 3.2. Funcionalidade do Flashcard

**Frente do Card:**
- Palavra principal em Inglês
- Ícone de Áudio: Reproduz MP3 da URL gravada (requer internet)
- Ícone de Exemplo: Revela frase de exemplo e definição (em inglês)
- Ícone de Tradução: Gatilho visual indicativo
- Interação: Clique Central aciona animação de Flip (giro) para o verso

**Verso do Card:**
- Tradução para Português
- Botões de Feedback: Ícone de "Acerto" (Verde ✓) e "Erro" (Vermelho ✗)

---

## 4. Metodologia Científica de Progresso

O sistema de pontuação é baseado no **CEFR** (Common European Framework of Reference for Languages) e nos estudos de **Laufer e Nation** sobre densidade lexical.

### 4.1. Níveis de Vocabulário

| Palavras "Mastered" | Nível CEFR | Capacidade Real de Leitura |
|---|---|---|
| 0 - 500 | A1 | Textos básicos e sobrevivência |
| 500 - 1.000 | A2 | Comunicação cotidiana e descrições simples |
| 1.000 - 2.000 | B1 | Entende 80% da linguagem falada comum |
| 2.000 - 4.000 | B2 | Lê artigos técnicos e literatura contemporânea |
| 4.000 - 8.000 | C1 | Compreensão de textos complexos e acadêmicos |
| 8.000+ | C2 | Fluência próxima ao nativo |

### 4.2. Regra de Maestria

Uma palavra só é considerada **"Aprendida (Mastered)"** após o usuário registar **3 acertos em momentos distintos**.

O sistema deve exibir um **Dashboard de Progresso** mostrando:
- Palavras aprendidas hoje / semana
- Nível CEFR atual baseado no total acumulado
- Gráfico de tendência (últimos 7 dias)

---

## 5. Design System

### Paleta de Cores
- **Primary:** #4F46E5 (Indigo) - Profissionalismo
- **Success:** #10B981 (Emerald) - Acertos
- **Error:** #EF4444 (Red) - Erros
- **Background:** #F8FAFC (Slate 50) - Conforto visual
- **Neutral:** #6B7280 (Gray) - Textos secundários

### Tipografia
- **Fonte:** Inter (Google Fonts)
- **Bold:** Títulos, termos e CTA
- **Regular:** Definições e descriptions

### UI/UX
- Bordas: `rounded-2xl` para elementos principais
- Sombras: Suaves (2-4px blur) para profundidade
- Transições: 300ms easing (ease-in-out)
- Espaçamento: Escala 4px (4, 8, 12, 16, 24, 32...)

---

## 6. Arquitetura Multi-Tenant

### 6.1. Isolamento de Dados

Cada organização possui:
- Usuários próprios (vinculados via FK)
- Palavras customizadas (com FK para `words_global`)
- Progresso de aprendizado (user_progress isolado)
- Sessões de flashcard (flashcard_sessions isolado)

**Implementação:** Row Level Security (RLS) em todas as tabelas com filtro `WHERE organization_id = current_org`

### 6.2. Segurança

- **Autenticação:** Supabase Auth (JWT) + refresh tokens
- **Autorização:** RLS policies + validação server-side
- **Dados:** PII criptografado (emails) com SCRAM-SHA-256
- **API:** Rate limiting por organização
- **Audit:** Logs de acesso e modificações em `audit_logs` (planejado)

---

## 7. Roadmap de Desenvolvimento (Tasks)

### Fase 0: Infraestrutura
- [x] **Task 0.1:** Configurar Supabase e banco de dados
- [x] **Task 0.2:** Criar migrations (schema, RLS, índices)

### Fase 1: Setup & Data
- [x] **Task 1.1:** Inicializar Expo com TypeScript, NativeWind e path aliases
- [x] **Task 1.2:** Configurar Supabase Client, tipos gerados e hooks multi-tenant
- [x] **Task 1.3:** Criar sistema de cache híbrido (Local/Cloud/API)
- [x] **Task 1.4:** Implementar abordagem de palavras híbrida (words_global + words)

### Fase 2: Componentes Core
- [ ] **Task 2.1:** Criar componente FlashCard com animação de flip (Reanimated v3)
- [ ] **Task 2.2:** Implementar AudioButton para pronúncia
- [ ] **Task 2.3:** Criar lógica de feedback (acerto/erro) e atualizar user_progress

### Fase 3: Dashboard & PWA
- [ ] **Task 3.1:** Criar tela de Statistics com gráfico CEFR
- [ ] **Task 3.2:** Configurar PWA (manifest, service worker, offline)
- [ ] **Task 3.3:** Implementar Supabase Auth (login/register)

### Fase 4: Deployment & Otimização
- [ ] **Task 4.1:** Configurar Docker + docker-compose para OceanDigital
- [ ] **Task 4.2:** Setup GitHub Actions CI/CD pipeline
- [ ] **Task 4.3:** Performance tuning (bundle size, Core Web Vitals)
- [ ] **Task 4.4:** Testes E2E (Cypress) + testes unitários (Vitest)

### Fase 5: Refinamento & MVP
- [ ] **Task 5.1:** Bug fixes e refinement de UX
- [ ] **Task 5.2:** Analytics e telemetria (Mixpanel/Sentry)
- [ ] **Task 5.3:** Launch em produção no OceanDigital

---

## 8. Considerações Técnicas

### 8.1. Offline-First Strategy

- AsyncStorage caches palavras, definições e progresso
- Sync automático ao conectar internet
- Fila de mutações locais (criar palavra, registrar acerto) com retry
- Conflito resolution: Last-write-wins com timestamp

### 8.2. Performance

- **Code Splitting:** Lazy load por rota
- **Bundle Size:** Target < 250KB (gzipped)
- **Images:** WebP com fallback PNG
- **Fonts:** Subset apenas caracteres Latin
- **Caching:** HTTP cache headers (1 year para assets static)

### 8.3. SEO (PWA)

- Meta tags dinâmicas
- Sitemap.xml para descoberta
- robots.txt com regras
- Open Graph para compartilhamento social

---

## 9. Métricas de Sucesso

- **Engagement:** MAU (Monthly Active Users) > 100 em 3 meses
- **Retention:** D7 (Day 7 Retention) > 40%
- **Learning Outcome:** 70% dos usuários atingem B1 em 6 meses
- **Performance:** Core Web Vitals "Good" em 90%+ das sessões
- **Uptime:** > 99.5% em produção