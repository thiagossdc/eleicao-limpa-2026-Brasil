# Eleição Limpa 2026

Aplicacao full stack para consultar candidaturas e sinais de cassacao a partir de dados oficiais do TSE.

## O que ja esta implementado

- API Node.js + Express com SQLite local (`better-sqlite3`)
- Sincronizacao de dados oficiais do TSE via ZIP + CSV (`/api/sync`)
- Consulta de candidatos com filtros de nome, UF, ano e alerta de risco (`/api/candidates`)
- Detalhe do candidato com motivos de cassacao vinculados
- Frontend Angular com telas de consulta e sincronizacao

## Estrutura

- `server`: API e persistencia SQLite
- `client`: frontend Angular
- `package.json` (raiz): scripts para rodar API e frontend juntos

## Requisitos

- Node.js 18+
- npm 9+

## Instalar dependencias

No diretorio raiz:

```bash
npm install
```

Se for a primeira execucao em uma maquina nova, instale tambem os modulos do backend:

```bash
npm install --prefix server
```

## Rodar em desenvolvimento

```bash
npm run dev
```

Servicos esperados:

- API: `http://localhost:3000`
- Frontend: `http://localhost:4200`

## Endpoints principais da API

- `GET /api/health` - status da API
- `GET /api/stats` - totais no banco local
- `GET /api/candidates` - busca de candidatos
- `GET /api/candidates/:sqCandidato?uf=SP&ano=2022` - detalhe + cassacoes
- `POST /api/sync` - importa dados do TSE

Exemplo de sincronizacao:

```bash
curl -X POST "http://localhost:3000/api/sync" \
  -H "Content-Type: application/json" \
  -d '{"ano":2022,"uf":"SP"}'
```

Se `SYNC_TOKEN` estiver configurado no backend, envie:

```bash
-H "Authorization: Bearer <token>"
```

## Variaveis de ambiente (backend)

- `PORT` (padrao `3000`)
- `SQLITE_PATH` (opcional, caminho customizado do banco)
- `SYNC_TOKEN` (opcional, protege `POST /api/sync`)
- `CORS_ORIGINS` (padrao `http://localhost:4200`)

## Solucao de problemas

### Erro do `better-sqlite3` por versao de Node

Se aparecer erro de modulo nativo compilado para outra versao do Node, rode:

```bash
npm rebuild better-sqlite3 --prefix server
```

## Build de producao do frontend

```bash
npm run build --prefix client
```
