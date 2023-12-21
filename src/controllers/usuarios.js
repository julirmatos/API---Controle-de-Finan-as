const { hash, compare } = require("bcrypt");
const pool = require("../config/conexao");
const jwt = require("jsonwebtoken");
const senhaJwt = require("../../senhajwt");

const cadastrarUsuario = async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const emailExiste = await pool.query(
      "select * from usuarios where email = $1",
      [email]
    );

    if (emailExiste.rowCount > 0) {
      return res.status(500).json({
        mensagem: "Já existe usuário cadastrado com o e-mail informado.",
      });
    }

    const senhaCriptografada = await hash(String(senha), 10);

    const query = `
            insert into usuarios (nome, email, senha)
            values ($1, $2, $3) returning *
        `;

    const { rows } = await pool.query(query, [nome, email, senhaCriptografada]);

    const { senha: _, ...usuario } = rows[0];

    return res.status(201).json(usuario);
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
};
const login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos são obrigatórios" });
  }

  try {
    const { rows, rowCount } = await pool.query(
      "select * from usuarios where email = $1",
      [email]
    );

    if (rowCount === 0) {
      return res
        .status(500)
        .json({ mensagem: "Usuário e/ou senha inválido(s)." });
    }

    const { senha: senhaUsuario, ...usuario } = rows[0];

    const senhaCorreta = await compare(senha, senhaUsuario);

    if (!senhaCorreta) {
      return res
        .status(500)
        .json({ mensagem: "Usuário e/ou senha inválido(s)." });
    }

    const token = jwt.sign({ id: usuario.id }, senhaJwt, { expiresIn: "2h" });

    return res.json({
      usuario,
      token,
    });
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
};

const detalharUsuario = async (req, res) => {
  console.log(req.usuario);

  try {
    return res.status(200).json(req.usuario);
  } catch (error) {
    return res.status(500).json({
      mensagem: error.message,
    });
  }
};

const atualizarUsuario = async (req, res) => {
  const { nome, email, senha } = req.body;
  const usuarioLogado = req.usuario;

  if (!nome || !email || !senha) {
    return res
      .status(400)
      .json({ messagem: "Todos os campos são obrigatórios" });
  }

  try {
    const { rowCount: validarEmail } = await pool.query(
      `select * from usuarios where email = $1  and id != $2;`,
      [email, usuarioLogado.id]
    );

    if (validarEmail) {
      return res.status(409).json({ messagem: "Email já está em uso" });
    }
    const senhaCriptografada = await hash(String(senha), 10);
    const query = `UPDATE usuarios 
    SET nome = $1, email = $2, senha = $3 WHERE id = $4
    RETURNING *`;

    await pool.query(query, [
      nome,
      email,
      senhaCriptografada,
      usuarioLogado.id,
    ]);

    return res.status(204).json();
  } catch (error) {
    return res.status(500).json({
      mensagem: error.message,
    });
  }
};

module.exports = {
  cadastrarUsuario,
  detalharUsuario,
  atualizarUsuario,
  login,
};
