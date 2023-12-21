const pool = require("../config/conexao");
const jwt = require("jsonwebtoken");
const senhaJwt = require("../../senhajwt");

const verificarUsuarioLogado = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res
      .status(401)
      .json({
        mensagem:
          "Para acessar este recurso um token de autenticação válido deve ser enviado.",
      });
  }
  const token = authorization.split(" ")[1];

  try {
    const { id } = jwt.verify(token, senhaJwt);

    const { rows, rowCount } = await pool.query(
      "select id, nome, email from usuarios where id = $1",
      [id]
    );

    if (rowCount < 1) {
      return res.status(401).json({ mensagem: "Não autorizado" });
    }

    req.usuario = rows[0];

    next();
  } catch (error) {
    return res
      .status(401)
      .json({
        mensagem:
          "Para acessar este recurso um token de autenticação válido deve ser enviado.",
      });
  }
};

module.exports = verificarUsuarioLogado;
