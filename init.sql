CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    cidade VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id)
);

CREATE TABLE IF NOT EXISTS pedido_itens (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id),
    produto_id INTEGER NOT NULL REFERENCES produtos(id),
    qtd INTEGER NOT NULL CHECK (qtd > 0)
);

INSERT INTO clientes (nome, email, cidade) VALUES
    ('Leonardo', 'leonardo@email.com', 'Campos'),
    ('Maria', 'maria@email.com', 'Niterói'),
    ('João', 'joao@email.com', 'Rio de Janeiro')
ON CONFLICT (email) DO NOTHING;

INSERT INTO produtos (nome, preco, categoria) VALUES
    ('Notebook', 4500.00, 'Eletrônicos'),
    ('Mouse', 80.00, 'Periféricos'),
    ('Teclado', 150.00, 'Periféricos'),
    ('Monitor', 1200.00, 'Eletrônicos')
ON CONFLICT DO NOTHING;

INSERT INTO pedidos (cliente_id) VALUES
    (1),
    (2),
    (1)
ON CONFLICT DO NOTHING;

INSERT INTO pedido_itens (pedido_id, produto_id, qtd) VALUES
    (1, 1, 1),
    (1, 2, 2),
    (2, 3, 1),
    (3, 4, 2),
    (3, 1, 1)
ON CONFLICT DO NOTHING;
