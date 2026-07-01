# Kage Arena Ranking

Portal competitivo para o grupo de Naruto Shippuden Ultimate Ninja 5.

O projeto controla ranking de jogadores, avaliacoes, desafios, torneios, perfis, banners e rankings por personagem. A base nasceu no Lovable, mas a manutencao principal agora fica neste repositorio.

## Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Netlify

## Desenvolvimento local

```sh
npm install
npm run dev
```

O app roda por padrao em:

```txt
http://localhost:8080
```

## Variaveis de ambiente

Use `.env.example` como referencia:

```txt
VITE_SUPABASE_PROJECT_ID=
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_ENABLE_GOOGLE_AUTH=false
```

## Build

```sh
npm run build
```

O resultado de producao fica em `dist`.

## Publicacao

O projeto esta preparado para Netlify via `netlify.toml`.

Configuracao esperada:

- Build command: `npm run build`
- Publish directory: `dist`
- SPA fallback: todas as rotas apontam para `index.html`

Dominio planejado:

```txt
https://kage-arena-ranking.netlify.app
```

Depois da publicacao, esse dominio precisa estar liberado no Supabase Auth em Site URL e Redirect URLs.
