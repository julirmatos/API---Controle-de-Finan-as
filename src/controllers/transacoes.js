const pool = require("../config/conexao");

const listarTransacoes = async (req, res) => {
  try {
    const { rows: transacoes } = await pool.query(
      "select * from transacoes where usuario_id = $1",
      [req.usuario.id]
    );
    return res.status(200).json(transacoes);
  } catch (error) {
    return res.status(500).json({
      mensagem: error.message,
    });
  }
};

const detalharTransacao = async (req, res) => {
  const { idTransacao } = req.params;

  try {
    const { rowCount } = await pool.query(
      "select * from transacoes where id = $1 and usuario_id = $2",
      [idTransacao, req.usuario.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ mensagem: "Transação não encontrada." });
    }

    const transacao = await pool.query(
      `select t.id, t.tipo, t.descricao, t.valor, t.data,
    t.usuario_id, t.categoria_id, c.descricao as categoria_nome
from  transacoes t
Join  categorias c ON t.categoria_id = c.id
where t.id = $1
and   usuario_id = $2 `,
      [idTransacao, req.usuario.id]
    );

    res.status(200).json(transacao);
  } catch (error) {
    return res.status(500).json({
      mensagem: error.message,
    });
  }
};

const cadastrarTransacao = async (req, res) => {
  const { descricao, valor, data, categoria_id, tipo } = req.body;

  if (!descricao) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos obrigatórios devem ser informados." });
  }

  if (!valor) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos obrigatórios devem ser informados." });
  }

  if (!data) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos obrigatórios devem ser informados." });
  }

  if (!categoria_id) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos obrigatórios devem ser informados." });
  }

  if (!tipo) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos obrigatórios devem ser informados." });
  }

  if (tipo !== "entrada" && tipo !== "saida") {
    return res
      .status(400)
      .json({ mensagem: `O tipo precisa ser 'entrada' ou 'saida'` });
  }

  let categoria;
  try {
    const query = `SELECT descricao FROM categorias WHERE id = $1`;

    categoria = await pool.query(query, [categoria_id]);

    if (categoria.rowCount === 0) {
      return res.status(404).json({
        messagem: "Categoria não encontrada",
      });
    }
  } catch (error) {
    return res.status(500).json({
      mensagem: error.message,
    });
  }

  let transacao;

  try {
    const query = `INSERT INTO transacoes (tipo, descricao, valor, data, usuario_id, categoria_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `;

    transacao = await pool.query(query, [
      tipo,
      descricao,
      valor,
      data,
      req.usuario.id,
      categoria_id,
    ]);

    return res.status(201).json({
      ...transacao.rows[0],
      categoria_nome: categoria.rows[0].descricao,
    });
  } catch (erro) {
    return res.status(400).json({
      messagem: "Não foi possível cadastrar a transação",
      detalhes: erro.message,
    });
  }
};

const atualizarTransacao = async (req, res) => {
  const { tipo, descricao, valor, data, categoria_id } = req.body;

  if (!descricao) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos obrigatórios devem ser informados." });
  }

  if (!valor) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos obrigatórios devem ser informados." });
  }

  if (!data) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos obrigatórios devem ser informados." });
  }

  if (!categoria_id) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos obrigatórios devem ser informados." });
  }

  if (!tipo) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos obrigatórios devem ser informados." });
  }

  if (tipo != "entrada" && tipo != "saida") {
    return res
      .status(400)
      .json({ mensagem: `O tipo precisa ser 'entrada' ou 'saida'` });
  }

  try {
    const query = `SELECT * FROM transacoes 
      WHERE id = $1 AND usuario_id = $2`;

    const transacao = await pool.query(query, [req.params.id, req.usuario.id]);

    if (transacao.rowCount === 0) {
      return res.status(404).json({
        messagem: "Transação não encontrada",
      });
    }
  } catch (erro) {
    return res.status(400).json({
      mensagem: error.message,
    });
  }

  try {
    const query = `SELECT * FROM categorias WHERE id = $1`;

    const categoria = await pool.query(query, [categoria_id]);

    if (categoria.rowCount === 0) {
      return res.status(404).json({
        messagem: "Categoria não encontrada",
      });
    }
  } catch (erro) {
    return res.status(400).json({
      messagem: "Não foi possível atualizar a transação",
      detalhes: erro.message,
    });
  }

  try {
    const query = `UPDATE transacoes 
      SET tipo = $1, descricao = $2, valor = $3, data = $4, categoria_id = $5 
      WHERE id = $6 AND usuario_id = $7`;

    const transacaoAtualizada = await pool.query(query, [
      tipo,
      descricao,
      valor,
      data,
      categoria_id,
      req.params.id,
      req.usuario.id,
    ]);

    return res.status(200).json({
      mensagem: "Transação atualizada com sucesso",
    });
  } catch (erro) {
    return res.status(400).json({
      messagem: "Não foi possível atualizar a transação",
      detalhes: erro.message,
    });
  }
};
const excluirTransacao = async (req, res) => {
  try {
    const query = `SELECT * FROM transacoes 
      WHERE id = $1 AND usuario_id = $2`;

    const transacao = await pool.query(query, [req.params.id, req.usuario.id]);

    if (transacao.rowCount === 0) {
      return res.status(404).json({
        messagem: "Transação não encontrada",
      });
    }
  } catch (erro) {
    return res.status(400).json({
      messagem: "Não foi possível excluir a transação",
      detalhes: erro.message,
    });
  }

  try {
    const query = `DELETE FROM transacoes 
      WHERE id = $1 AND usuario_id = $2`;

    await pool.query(query, [req.params.id, req.usuario.id]);

    return res.status(200).json({ mensagem: "Transação excluída com sucesso" });
  } catch (erro) {
    return res.status(400).json({
      messagem: "Não foi possível excluir a transação",
      detalhes: erro.message,
    });
  }
};

const obterExtrato = async (req, res) => {
  try {
    const somaEntradas = await pool.query(
      `select coalesce(sum(valor), 0) as entrada 
    from transacoes 
    where usuario_id = $1
    and   tipo = 'entrada'`,
      [req.usuario.id]
    );

    const somaSaidas = await pool.query(
      `select coalesce(sum(valor), 0) as saida
            from transacoes 
            where usuario_id = $1
            and   tipo = 'saida'`,
      [req.usuario.id]
    );

    const extrato = [somaEntradas.rows[0].entrada, somaSaidas.rows[0].saida];

    return res.status(200).json(extrato);
  } catch (error) {
    return res.status(500).json({
      messagem: error.message,
    });
  }
};
module.exports = {
  listarTransacoes,
  detalharTransacao,
  cadastrarTransacao,
  atualizarTransacao,
  excluirTransacao,
  obterExtrato,
};
