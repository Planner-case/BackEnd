# Planner Case - Back-End

Este é o back-end do projeto Planner Case, uma API construída com [Fastify](https://www.fastify.io/) e [Prisma](https://www.prisma.io/) para gerenciar simulações de planejamento financeiro.

## Como Executar o Projeto (Docker)

O projeto foi desenhado para ser executado com Docker, simplificando a configuração do ambiente.

### Pré-requisitos
- Docker
- Node.js
- npm

### Passos

1.  **Clone o Repositório**

    Crie uma pasta para o seu projeto e, dentro dela, clone este repositório:
    ```bash
    mkdir meu-projeto
    cd meu-projeto
    git clone <url-do-repositorio> . 
    ```

2.  **Crie o arquivo `docker-compose.yml`**

    Na pasta principal (`meu-projeto`, **fora** da pasta `BackEnd`), crie um arquivo chamado `docker-compose.yml` com o seguinte conteúdo:

    ```yaml
    services:
      db:
        image: postgres:15
        environment:
          POSTGRES_USER: planner
          POSTGRES_PASSWORD: plannerpw
          POSTGRES_DB: plannerdb
        volumes:
          - pg_data:/var/lib/postgresql/data
        ports:
          - "5432:5432"

      backend:
        build: ./BackEnd
        depends_on:
          - db
        env_file:
          - ./BackEnd/.env.docker
        ports:
          - "4000:4000"
          - "5555:5555"

      frontend:
        build: ./frontend
        depends_on:
          - backend
        ports:
          - "3000:3000"

    volumes:
      pg_data:
    ```

3.  **Inicie os Serviços**

    Com o arquivo `docker-compose.yml` salvo, execute o seguinte comando para construir as imagens e iniciar os containers:

    ```bash
    docker-compose up --build
    ```

    O back-end estará disponível na porta `4000` e o front-end na porta `3000`.

---

## Arquitetura de Pastas

A estrutura de pastas do projeto foi organizada para separar as responsabilidades e facilitar a manutenção.

```
BackEnd/
├── prisma/               # Schema e migrações do banco de dados (Prisma)
├── src/                  # Código-fonte da aplicação
│   ├── generated/        # Cliente Prisma gerado automaticamente
│   ├── plugins/          # Plugins do Fastify 
│   ├── routes/           # Definição dos endpoints da API
│   ├── schemas/          # Schemas de validação de dados 
│   ├── services/         # Lógica de negócio principal 
│   ├── index.ts          # Ponto de entrada, registra rotas e plugins
│   └── server.ts         # Criação e inicialização do servidor Fastify
├── tests/               
│   ├── Integration/      # Testes de integração
│   └── unit/             # Testes unitários
├── .env.docker           # Arquivo para variáveis de ambiente
├── Dockerfile            # Instruções para construir a imagem Docker do back-end
├── docker-entrypoint.sh  # Scripts adicionais para serem rodados na VM docker que garantem funcionalidade do projeto
├── jest.config.js        # Configuração do Jest
├── package.json          # Dependências e scripts do projeto
└── tsconfig.json         # Configuração do TypeScript
```

---

## API Endpoints

A API é organizada em torno de recursos principais.

### Simulações (`/simulations`)

Gerencia as simulações financeiras completas.

- `POST /`
  - **Descrição:** Cria uma nova simulação.
  - **Corpo:** `{ name: string, startDate: Date, rate: number, status: string }`

- `GET /`
  - **Descrição:** Lista todas as simulações e suas versões.

- `GET /:id`
  - **Descrição:** Busca uma simulação específica pelo seu ID, incluindo suas alocações, movimentações e seguros.

- `DELETE /:id`
  - **Descrição:** Deleta uma simulação.

- `POST /:id/version`
  - **Descrição:** Cria uma nova versão (um clone) de uma simulação existente.

- `GET /:id/projection`
  - **Descrição:** Retorna a projeção financeira calculada para uma simulação, ano a ano, até 2060.

- `GET /:id/timeline`
  - **Descrição:** Retorna a linha do tempo de todos os eventos financeiros (alocações, movimentações, seguros) de uma simulação.

### Alocações (`/allocations`)

Gerencia os patrimônios (financeiros ou imobilizados) de uma simulação.

- `POST /`
  - **Descrição:** Cria uma nova alocação.
- `GET /`
  - **Descrição:** Lista todas as alocações.
- `GET /:id`
  - **Descrição:** Busca uma alocação específica por ID.
- `PATCH /:id`
  - **Descrição:** Atualiza uma alocação existente.
- `DELETE /:id`
  - **Descrição:** Deleta uma alocação.

### Movimentações (`/movements`)

Gerencia as entradas e saídas recorrentes ou únicas.

- `POST /`
  - **Descrição:** Cria uma nova movimentação.
- `GET /`
  - **Descrição:** Lista todas as movimentações.
- `GET /:id`
  - **Descrição:** Busca uma movimentação específica por ID.
- `PATCH /:id`
  - **Descrição:** Atualiza uma movimentação existente.
- `DELETE /:id`
  - **Descrição:** Deleta uma movimentação.

### Seguros (`/insurances`)

Gerencia os seguros contratados em uma simulação.

- `POST /`
  - **Descrição:** Cria um novo seguro.
- `GET /`
  - **Descrição:** Lista todos os seguros.
- `GET /:id`
  - **Descrição:** Busca um seguro específico por ID.
- `PATCH /:id`
  - **Descrição:** Atualiza um seguro existente.
- `DELETE /:id`
  - **Descrição:** Deleta um seguro.

---

## Testes

O projeto possui uma suíte de testes unitários e de integração para garantir a qualidade e o correto funcionamento da API.

### Como Rodar os Testes

Para executar todos os testes, utilize o seguinte comando na pasta `BackEnd`:

```bash
npm test
```

### Nota sobre a Execução dos Testes

Por padrão, o Jest executa os arquivos de teste em paralelo para otimizar o tempo. No entanto, como os testes de integração manipulam um banco de dados compartilhado, a execução paralela pode causar conflitos (um teste apaga dados que outro está usando).

Para resolver isso, o script `test` no `package.json` foi configurado com a flag `--runInBand`:

```json
"scripts": {
  "test": "jest --runInBand"
}
```

Esta flag força o Jest a executar os arquivos de teste **em série** (um após o outro), garantindo que não haja interferência entre eles e que os resultados sejam consistentes e confiáveis.