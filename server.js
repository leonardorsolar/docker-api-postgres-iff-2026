const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

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
    res.status(500).json({ erro: erro.message });
  }
});

// CLIENTES
app.get("/clientes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM clientes ORDER BY id");
    res.json(result.rows);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

app.get("/clientes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM clientes WHERE id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ erro: "Cliente não encontrado" });
    res.json(result.rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

app.post("/clientes", async (req, res) => {
  try {
    const { nome, email, cidade } = req.body;
    const result = await pool.query(
      "INSERT INTO clientes (nome, email, cidade) VALUES ($1, $2, $3) RETURNING *",
      [nome, email, cidade]
    );
    res.status(201).json(result.rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

app.put("/clientes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, cidade } = req.body;
    const result = await pool.query(
      "UPDATE clientes SET nome = $1, email = $2, cidade = $3 WHERE id = $4 RETURNING *",
      [nome, email, cidade, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: "Cliente não encontrado" });
    res.json(result.rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

app.delete("/clientes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM clientes WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ erro: "Cliente não encontrado" });
    res.json({ mensagem: "Cliente removido" });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

// PRODUTOS
app.get("/produtos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM produtos ORDER BY id");
    res.json(result.rows);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

app.get("/produtos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM produtos WHERE id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ erro: "Produto não encontrado" });
    res.json(result.rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

app.post("/produtos", async (req, res) => {
  try {
    const { nome, preco, categoria } = req.body;
    const result = await pool.query(
      "INSERT INTO produtos (nome, preco, categoria) VALUES ($1, $2, $3) RETURNING *",
      [nome, preco, categoria]
    );
    res.status(201).json(result.rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

app.put("/produtos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, preco, categoria } = req.body;
    const result = await pool.query(
      "UPDATE produtos SET nome = $1, preco = $2, categoria = $3 WHERE id = $4 RETURNING *",
      [nome, preco, categoria, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: "Produto não encontrado" });
    res.json(result.rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

app.delete("/produtos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM produtos WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ erro: "Produto não encontrado" });
    res.json({ mensagem: "Produto removido" });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

// PEDIDOS
app.get("/pedidos", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.cliente_id, c.nome AS cliente_nome,
             COALESCE(
               json_agg(
                 json_build_object('produto_id', pi.produto_id, 'nome', pr.nome, 'preco', pr.preco, 'qtd', pi.qtd)
               ) FILTER (WHERE pi.produto_id IS NOT NULL),
               '[]'
             ) AS itens
      FROM pedidos p
      JOIN clientes c ON c.id = p.cliente_id
      LEFT JOIN pedido_itens pi ON pi.pedido_id = p.id
      LEFT JOIN produtos pr ON pr.id = pi.produto_id
      GROUP BY p.id, c.nome
      ORDER BY p.id
    `);
    res.json(result.rows);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

app.get("/pedidos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT p.id, p.cliente_id, c.nome AS cliente_nome,
             COALESCE(
               json_agg(
                 json_build_object('produto_id', pi.produto_id, 'nome', pr.nome, 'preco', pr.preco, 'qtd', pi.qtd)
               ) FILTER (WHERE pi.produto_id IS NOT NULL),
               '[]'
             ) AS itens
      FROM pedidos p
      JOIN clientes c ON c.id = p.cliente_id
      LEFT JOIN pedido_itens pi ON pi.pedido_id = p.id
      LEFT JOIN produtos pr ON pr.id = pi.produto_id
      WHERE p.id = $1
      GROUP BY p.id, c.nome
    `, [id]);
    if (result.rows.length === 0) return res.status(404).json({ erro: "Pedido não encontrado" });
    res.json(result.rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

app.post("/pedidos", async (req, res) => {
  const { cliente_id } = req.body;
  if (!cliente_id) return res.status(400).json({ erro: "cliente_id é obrigatório" });

  try {
    const result = await pool.query(
      "INSERT INTO pedidos (cliente_id) VALUES ($1) RETURNING *",
      [cliente_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

app.delete("/pedidos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM pedido_itens WHERE pedido_id = $1", [id]);
    const result = await pool.query("DELETE FROM pedidos WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ erro: "Pedido não encontrado" });
    res.json({ mensagem: "Pedido removido" });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

// PEDIDO_ITENS
app.post("/pedidos/:id/itens", async (req, res) => {
  const { id } = req.params;
  const { produto_id, qtd } = req.body;
  if (!produto_id || !qtd) return res.status(400).json({ erro: "produto_id e qtd são obrigatórios" });

  try {
    const result = await pool.query(
      "INSERT INTO pedido_itens (pedido_id, produto_id, qtd) VALUES ($1, $2, $3) RETURNING *",
      [id, produto_id, qtd]
    );
    res.status(201).json(result.rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

app.delete("/pedidos/:id/itens/:itemId", async (req, res) => {
  const { id, itemId } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM pedido_itens WHERE id = $1 AND pedido_id = $2 RETURNING *",
      [itemId, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: "Item não encontrado" });
    res.json({ mensagem: "Item removido" });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

app.listen(3000, () => {
  console.log("Servidor executando na porta 3000");
});
