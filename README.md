# Docker API + PostgreSQL

Projeto didático que demonstra a comunicação entre uma **API Node.js (Express)** e um **banco PostgreSQL** utilizando **Docker Compose**.

## Arquitetura

```
┌─────────────────────┐      ┌─────────────────────┐
│   Container: api    │      │   Container: db     │
│   Node.js + Express │─────▶│   PostgreSQL 16     │
│   porta 3000        │      │   porta 5432        │
└─────────────────────┘      └─────────────────────┘
         │                           │
         │  GET /                     │
         ▼                           │
   Resposta JSON                     │
   com data/hora do                  │
   banco de dados ◀──────────────────┘
```

A API faz uma consulta `SELECT NOW()` no PostgreSQL para provar que a conexão com o banco está funcionando.

## Pré-requisitos

- [Docker](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/install/) (já incluso no Docker Desktop)
- [Node.js](https://nodejs.org/) (apenas para execução local sem Docker)

## Estrutura do Projeto

```
├── server.js          # Código da API (Express + conexão PostgreSQL)
├── Dockerfile          # Instruções para construir a imagem Docker da API
├── docker-compose.yml  # Orquestração dos containers (api + db)
├── package.json        # Dependências Node.js
└── README.md           # Este arquivo
```

## Como Executar

### Com Docker Compose (recomendado)

Subir os containers em segundo plano:

```bash
docker compose up -d
```

Para acompanhar os logs:

```bash
docker compose logs -f
```

Acesse: [http://localhost:3000](http://localhost:3000)

A resposta esperada é algo como:

```json
{
  "mensagem": "API conectada ao PostgreSQL!",
  "dataHoraBanco": "2026-06-24T..."
}
```

### Para derrubar os containers

```bash
docker compose down
```

### Localmente (sem Docker)

```bash
npm install
npm start
```

> **Atenção:** Para executar localmente, você precisa ter um PostgreSQL rodando e ajustar o `host` no arquivo `server.js` de `"db"` para `"localhost"`.

## Entendendo os Arquivos

### `Dockerfile`

```dockerfile
FROM node:18-alpine        # Imagem base leve
WORKDIR /app               # Diretório de trabalho dentro do container
COPY package*.json ./      # Copia arquivos de dependência
RUN npm install            # Instala as dependências
COPY . .                   # Copia o resto do código
EXPOSE 3000                # Expõe a porta 3000
CMD ["node", "server.js"]  # Comando de inicialização
```

### `docker-compose.yml`

Define dois serviços:

- **api**: constrói a partir do `Dockerfile`, mapeia porta `3000:3000` e depende do serviço `db`.
- **db**: usa a imagem oficial `postgres:16`, define usuário/senha/database e expõe a porta `5432`.

A comunicação entre containers acontece pelo nome do serviço: a API conecta ao banco usando o host `db` (definido em `server.js`).

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `docker compose up -d` | Sobe os containers em background |
| `docker compose down` | Para e remove os containers |
| `docker compose logs -f` | Acompanha os logs em tempo real |
| `docker compose ps` | Lista os containers em execução |
| `docker compose exec api sh` | Acessa o terminal do container da API |
