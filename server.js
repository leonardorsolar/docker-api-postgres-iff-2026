const express = require("express");
const { Pool } = require("pg");

const app = express();

//Observe que o host do banco é o nome do serviço (db).
const pool = new Pool({
  host: "db",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "aula"
});

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    
    res.json({
      mensagem: "API conectada ao PostgreSQL!",
      dataHoraBanco: result.rows[0].now
    });
  } catch (erro) {
    res.status(500).json({
      erro: erro.message
    });
  }
});

app.listen(3000, () => {
  console.log("Servidor executando na porta 3000");
});