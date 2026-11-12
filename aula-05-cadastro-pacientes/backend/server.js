
const express = require('express');
const cors = require('cors');
const pool = require('./banco');

const app = express();

app.use(cors());
app.use(express.json());

// GET - Listar pacientes e filtrar por nome
app.get('/pacientes', async (req, res) => {
  try {
    const nome = req.query.nome;

    if (nome) {
      const resultado = await pool.query(
        'SELECT * FROM pacientes WHERE nome ILIKE $1 ORDER BY id',
        [`%${nome}%`]
      );

      return res.json(resultado.rows);
    }

    const resultado = await pool.query(
      'SELECT * FROM pacientes ORDER BY id'
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao buscar pacientes' });
  }
});

// GET - Total de pacientes
app.get('/pacientes/total', async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT COUNT(*)::integer AS total FROM pacientes'
    );

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao contar pacientes' });
  }
});

// GET - Buscar paciente por ID
app.get('/pacientes/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ erro: 'ID invÃ¡lido' });
    }

    const resultado = await pool.query(
      'SELECT * FROM pacientes WHERE id = $1',
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: 'Paciente nÃ£o encontrado'
      });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao buscar paciente' });
  }
});

// POST - Cadastrar paciente
app.post('/pacientes', async (req, res) => {
  try {
    const { nome, email, nascimento } = req.body ?? {};

    if (!nome || !email || !nascimento) {
      return res.status(400).json({
        erro: 'Nome, e-mail e nascimento sÃ£o obrigatÃ³rios'
      });
    }

    const resultado = await pool.query(
      `INSERT INTO pacientes (nome, email, nascimento)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nome, email, nascimento]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    if (erro.code === '23505') {
      return res.status(409).json({
        erro: 'E-mail jÃ¡ cadastrado'
      });
    }

    console.error(erro);
    res.status(500).json({ erro: 'Erro ao cadastrar paciente' });
  }
});

// PUT - Atualizar paciente
app.put('/pacientes/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nome, email, nascimento } = req.body ?? {};

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ erro: 'ID invÃ¡lido' });
    }

    if (!nome || !email || !nascimento) {
      return res.status(400).json({
        erro: 'Nome, e-mail e nascimento sÃ£o obrigatÃ³rios'
      });
    }

    const resultado = await pool.query(
      `UPDATE pacientes
       SET nome = $1, email = $2, nascimento = $3
       WHERE id = $4
       RETURNING *`,
      [nome, email, nascimento, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: 'Paciente nÃ£o encontrado'
      });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    if (erro.code === '23505') {
      return res.status(409).json({
        erro: 'E-mail jÃ¡ cadastrado'
      });
    }

    console.error(erro);
    res.status(500).json({ erro: 'Erro ao atualizar paciente' });
  }
});

// DELETE - Excluir paciente
app.delete('/pacientes/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ erro: 'ID invÃ¡lido' });
    }

    const resultado = await pool.query(
      'DELETE FROM pacientes WHERE id = $1 RETURNING id',
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: 'Paciente nÃ£o encontrado'
      });
    }

    res.status(204).send();
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao excluir paciente' });
  }
});

const PORTA = process.env.PORT || 3000;

app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
