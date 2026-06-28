# Docker API + PostgreSQL

Projeto didático que demonstra a comunicação entre uma **API Node.js (Express)** e um **banco PostgreSQL** utilizando **Docker Compose**, com esquema de banco povoado automaticamente na inicialização.

## Arquitetura

```
┌─────────────────────┐      ┌─────────────────────┐
│   Container: api    │      │   Container: db     │
│   Node.js + Express │─────▶│   PostgreSQL 16     │
│   porta 3000        │      │   porta 5432        │
└─────────────────────┘      └─────────────────────┘
         │                            │
         │  GET /clientes             │
         │  GET /produtos             │
         │  GET /pedidos              │
         ▼                            │
   Resposta JSON ◀────────────────────┘
```

## Pré-requisitos

- [Docker](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/install/) (já incluso no Docker Desktop)
- [Node.js](https://nodejs.org/) (apenas para execução local sem Docker)

## Estrutura do Projeto

```
├── init.sql            # Script de inicialização do banco (schema + seed data)
├── server.js           # Código da API (Express + rotas CRUD)
├── Dockerfile          # Instruções para construir a imagem Docker da API
├── docker-compose.yml  # Orquestração dos containers (api + db)
├── package.json        # Dependências Node.js
└── README.md           # Este arquivo
```

## Esquema do Banco

O arquivo `init.sql` é executado automaticamente na primeira inicialização do PostgreSQL, criando as tabelas e inserindo dados de exemplo.

### Tabelas

| Tabela        | Colunas                                      |
|---------------|----------------------------------------------|
| `clientes`    | id, nome, email (unique), cidade             |
| `produtos`    | id, nome, preco, categoria                   |
| `pedidos`     | id, cliente_id (FK → clientes.id)            |
| `pedido_itens`| id, pedido_id (FK → pedidos.id), produto_id (FK → produtos.id), qtd |

- `pedido_itens` é a tabela intermediária que relaciona pedidos e produtos (N para N).

### Dados iniciais

- **clientes**: Leonardo, Maria, João
- **produtos**: Notebook, Mouse, Teclado, Monitor
- **pedidos**: 3 pedidos com itens variados

## Como Executar

### Com Docker Compose (recomendado)

```bash
docker compose up -d
```

Acesse: [http://localhost:3000](http://localhost:3000)

### Para derrubar os containers (e remover dados)

```bash
docker compose down -v
```

> A flag `-v` remove o volume do banco para que o `init.sql` seja executado novamente.

### Localmente (sem Docker)

```bash
npm install
# Ajuste o host em server.js de "db" para "localhost"
npm start
```

## Endpoints da API

### Clientes

| Método | Rota             | Descrição                |
|--------|------------------|--------------------------|
| GET    | `/clientes`      | Lista todos os clientes  |
| GET    | `/clientes/:id`  | Busca cliente por ID     |
| POST   | `/clientes`      | Cria cliente             |
| PUT    | `/clientes/:id`  | Atualiza cliente         |
| DELETE | `/clientes/:id`  | Remove cliente           |

### Produtos

| Método | Rota             | Descrição                |
|--------|------------------|--------------------------|
| GET    | `/produtos`      | Lista todos os produtos  |
| GET    | `/produtos/:id`  | Busca produto por ID     |
| POST   | `/produtos`      | Cria produto             |
| PUT    | `/produtos/:id`  | Atualiza produto         |
| DELETE | `/produtos/:id`  | Remove produto           |

### Pedidos

| Método | Rota                 | Descrição                     |
|--------|----------------------|-------------------------------|
| GET    | `/pedidos`           | Lista pedidos com itens       |
| GET    | `/pedidos/:id`       | Busca pedido com itens por ID |
| POST   | `/pedidos`           | Cria pedido (body: cliente_id)|
| DELETE | `/pedidos/:id`       | Remove pedido e seus itens    |

### Itens do Pedido

| Método | Rota                        | Descrição                     |
|--------|-----------------------------|-------------------------------|
| POST   | `/pedidos/:id/itens`        | Adiciona item ao pedido       |
| DELETE | `/pedidos/:id/itens/:itemId`| Remove item do pedido         |

## Entendendo os Arquivos

### `init.sql`

Script executado pelo PostgreSQL na inicialização via `docker-entrypoint-initdb.d/`. Cria as tabelas com `IF NOT EXISTS` e insere dados de exemplo com `ON CONFLICT DO NOTHING`.

### `docker-compose.yml`

Define dois serviços:

- **api**: constrói a partir do `Dockerfile`, mapeia porta `3000:3000` e depende do serviço `db`.
- **db**: usa a imagem oficial `postgres:16`, define usuário/senha/database, expõe a porta `5432` e monta `./init.sql` em `/docker-entrypoint-initdb.d/`.

A comunicação entre containers acontece pelo nome do serviço: a API conecta ao banco usando o host `db`.

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `docker compose up -d` | Sobe os containers em background |
| `docker compose down` | Para e remove os containers |
| `docker compose down -v` | Para e remove os containers + volumes |
| `docker compose logs -f` | Acompanha os logs em tempo real |
| `docker compose ps` | Lista os containers em execução |
| `docker compose exec api sh` | Acessa o terminal do container da API |
