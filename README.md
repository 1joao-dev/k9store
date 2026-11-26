# K9 Store

Plataforma de comércio digital desenvolvida com React e TypeScript. O projeto reúne catálogo de produtos e planos, experiência de compra, carteira digital, área do cliente, suporte e ferramentas auxiliares em uma única aplicação.

## Funcionalidades

- **Loja e catálogo:** exibição de produtos, planos, detalhes e carrinho.
- **Conta do cliente:** autenticação, sessão persistente e recuperação de senha.
- **Carteira digital:** consulta de saldo e depósitos por Pix ou checkout do Mercado Pago.
- **Pagamentos:** criação de cobranças e confirmação por webhook, com atualização das transações e do saldo.
- **Painel administrativo:** gerenciamento da operação, produtos, sorteios e atendimento.
- **Suporte:** abertura e acompanhamento de tickets, respostas administrativas e notificações.
- **Integração com Discord:** mensagens sobre pagamentos, tickets e entregas.
- **Ferramentas:** consulta de IP, consulta de perfis Steam e verificador de HWID demonstrativo.

## Tecnologias

- React 18, TypeScript e Vite
- Tailwind CSS, shadcn/ui e Radix UI
- React Router, TanStack Query e Framer Motion
- Supabase Auth, banco de dados e Edge Functions
- Mercado Pago para pagamentos
- Discord API para notificações
- Deno para as funções serverless

## Estrutura do projeto

```text
src/
  components/       Componentes da interface e componentes reutilizáveis
  hooks/            Hooks de autenticação e carteira
  integrations/     Cliente e tipos do Supabase
  pages/            Loja, login, administração e recuperação de senha
  assets/           Imagens e identidade visual
supabase/
  functions/        Pagamentos, webhook, Discord e ferramentas
  migrations/       Migrações do banco de dados
```

## Executar localmente

Requisitos: Node.js e npm.

```bash
npm install
npm run dev
```

Configure no arquivo `.env` as variáveis utilizadas pelo frontend:

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
```

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera a versão de produção em `dist/` |
| `npm run preview` | Executa uma prévia da build |
| `npm run lint` | Executa o ESLint |
| `npm test` | Executa os testes |

## Configuração das Edge Functions

As funções do Supabase utilizam variáveis de ambiente configuradas no projeto Supabase. Conforme a função, são necessárias:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MERCADOPAGO_ACCESS_TOKEN`
- `DISCORD_BOT_TOKEN`
- `SITE_URL` (opcional, como fallback para a URL de retorno do checkout)

Nunca coloque tokens privados ou a chave `SUPABASE_SERVICE_ROLE_KEY` no frontend.

## Deploy

Gere a aplicação com `npm run build` e publique o conteúdo da pasta `dist/` em uma hospedagem estática compatível com aplicações SPA. Configure as variáveis do frontend na plataforma de hospedagem e mantenha as Edge Functions e secrets no projeto Supabase.

---

Projeto K9 Store.
