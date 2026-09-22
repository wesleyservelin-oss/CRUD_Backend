require('dotenv').config();

const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensagem: 'API de livros funcionando' });
});

app.post('/livros', async (req, res) => {
  const { titulo, autor, anoPublicacao, isbn } = req.body;

  if (!titulo || !autor) {
    return res.status(400).json({
      erro: 'Os campos titulo e autor são obrigatórios',
    });
  }

  try {
    const livro = await prisma.livros.create({
      data: {
        titulo,
        autor,
        anoPublicacao: anoPublicacao === undefined ? null : Number(anoPublicacao),
        isbn: isbn || null,
      },
    });

    return res.status(201).json(livro);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ erro: 'O ISBN informado já está cadastrado' });
    }

    return res.status(500).json({ erro: 'Não foi possível cadastrar o livro' });
  }
});

app.get('/livros', async (req, res) => {
  try {
    const livros = await prisma.livros.findMany({
      orderBy: { id: 'asc' },
    });

    return res.json(livros);
  } catch (error) {
    return res.status(500).json({ erro: 'Não foi possível buscar os livros' });
  }
});

app.get('/livros/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'O id deve ser um número inteiro' });
  }

  try {
    const livro = await prisma.livros.findUnique({ where: { id } });

    if (!livro) {
      return res.status(404).json({ erro: 'Livro não encontrado' });
    }

    return res.json(livro);
  } catch (error) {
    return res.status(500).json({ erro: 'Não foi possível buscar o livro' });
  }
});

app.put('/livros/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { titulo, autor, anoPublicacao, isbn } = req.body;

  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'O id deve ser um número inteiro' });
  }

  if (!titulo || !autor) {
    return res.status(400).json({
      erro: 'Os campos titulo e autor são obrigatórios no PUT',
    });
  }

  const ano = anoPublicacao === undefined || anoPublicacao === null || anoPublicacao === ''
    ? null
    : Number(anoPublicacao);

  if (ano !== null && !Number.isInteger(ano)) {
    return res.status(400).json({ erro: 'anoPublicacao deve ser um número inteiro' });
  }

  try {
    const livro = await prisma.livros.update({
      where: { id },
      data: {
        titulo,
        autor,
        anoPublicacao: ano,
        isbn: isbn || null,
      },
    });

    return res.json(livro);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ erro: 'Livro não encontrado' });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({ erro: 'O ISBN informado já está cadastrado' });
    }

    return res.status(500).json({ erro: 'Não foi possível atualizar o livro' });
  }
});

app.patch('/livros/:id', async (req, res) => {
  const id = Number(req.params.id);
  const campos = ['titulo', 'autor', 'anoPublicacao', 'isbn'];
  const dados = {};

  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'O id deve ser um número inteiro' });
  }

  if (!campos.some((campo) => Object.prototype.hasOwnProperty.call(req.body, campo))) {
    return res.status(400).json({ erro: 'Informe ao menos um campo para atualizar' });
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'titulo')) {
    if (!req.body.titulo) {
      return res.status(400).json({ erro: 'titulo não pode ser vazio' });
    }
    dados.titulo = req.body.titulo;
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'autor')) {
    if (!req.body.autor) {
      return res.status(400).json({ erro: 'autor não pode ser vazio' });
    }
    dados.autor = req.body.autor;
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'anoPublicacao')) {
    const ano = req.body.anoPublicacao === null || req.body.anoPublicacao === ''
      ? null
      : Number(req.body.anoPublicacao);

    if (ano !== null && !Number.isInteger(ano)) {
      return res.status(400).json({ erro: 'anoPublicacao deve ser um número inteiro' });
    }

    dados.anoPublicacao = ano;
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'isbn')) {
    dados.isbn = req.body.isbn || null;
  }

  try {
    const livro = await prisma.livros.update({ where: { id }, data: dados });
    return res.json(livro);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ erro: 'Livro não encontrado' });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({ erro: 'O ISBN informado já está cadastrado' });
    }

    return res.status(500).json({ erro: 'Não foi possível atualizar o livro' });
  }
});

app.delete('/livros/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'O id deve ser um número inteiro' });
  }

  try {
    await prisma.livros.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ erro: 'Livro não encontrado' });
    }

    return res.status(500).json({ erro: 'Não foi possível excluir o livro' });
  }
});

const server = app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
