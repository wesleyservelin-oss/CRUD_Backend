# CRUD Backend - Livros

API básica construída com Node.js, Express e Prisma usando SQLite.

## Instalação

```bash
npm install
copy .env.example .env
npx prisma migrate dev --name init
npm run dev
```

No Linux/macOS, use `cp .env.example .env` no lugar de `copy`.

## Endpoints

### POST `/livros`

Cria um livro. `titulo` e `autor` são obrigatórios.

```json
{
  "titulo": "Dom Casmurro",
  "autor": "Machado de Assis",
  "anoPublicacao": 1899,
  "isbn": "9788525406902"
}
```

### GET `/livros`

Lista todos os livros.

### GET `/livros/:id`

Busca um livro pelo seu id.

### PUT `/livros/:id`

Substitui todos os dados do livro. `titulo` e `autor` são obrigatórios.

### PATCH `/livros/:id`

Atualiza parcialmente um livro. Envie somente os campos que deseja alterar.

### DELETE `/livros/:id`

Exclui um livro pelo seu id.

## Modelo Prisma

O modelo `Livros` está em `prisma/schema.prisma`. A migração inicial fica em `prisma/migrations` após executar o comando de migrate.
