const express = require("express");
const { listarCategorias } = require("../controllers/categorias");
const {
  cadastrarUsuario,
  login,
  detalharUsuario,
  atualizarUsuario,
} = require("../controllers/usuarios");
const verificaLogin = require("../Middlewares/verificaLogin");
const verificarUsuarioLogado = require("../Middlewares/autenticacao");
const {
  listarTransacoes,
  obterExtrato,
  detalharTransacao,
  cadastrarTransacao,
  atualizarTransacao,
  excluirTransacao,
} = require("../controllers/transacoes");

const rotas = express();

rotas.post("/usuario", cadastrarUsuario);
rotas.post("/login", login);

rotas.use(verificaLogin);
rotas.use(verificarUsuarioLogado);
rotas.put("/usuario", atualizarUsuario);
rotas.get("/usuario", detalharUsuario);

rotas.get("/categoria", listarCategorias);
rotas.get("/transacao", listarTransacoes);
rotas.get("/transacao/extrato", obterExtrato);
rotas.get("/transacao/:id", detalharTransacao);
rotas.post("/transacao", cadastrarTransacao);
rotas.put("/transacao/:id", atualizarTransacao);
rotas.delete("/transacao/:id", excluirTransacao);

module.exports = rotas;
