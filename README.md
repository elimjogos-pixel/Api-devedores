API Devedores

API REST para gerenciamento de devedores e suas respectivas dívidas, desenvolvida como projeto de estudo e evolução profissional em desenvolvimento backend.

O projeto utiliza Node.js, Express, Prisma ORM e MySQL, com testes automatizados utilizando Jest e Supertest.

Sobre o projeto

A API permite cadastrar e consultar devedores, gerenciar seus dados e registrar dívidas vinculadas a cada devedor.

O objetivo do projeto é aplicar conceitos importantes do desenvolvimento backend, como:

Criação de APIs REST.

Organização de código por responsabilidades.

Validação de dados recebidos.

Persistência de dados em banco relacional.

Relacionamento entre entidades.

Tratamento de erros HTTP.

Testes automatizados.

Versionamento com Git e GitHub.

Tecnologias utilizadas

Tecnologia

Finalidade

Node.js

Ambiente de execução JavaScript

Express

Construção da API REST

Prisma ORM

Comunicação com o banco de dados

MySQL

Banco de dados relacional

Jest

Testes automatizados

Supertest

Testes das rotas HTTP

Nodemon

Reinicialização automática durante o desenvolvimento

Estrutura do projeto

api-devedores/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── controllers/
│   │   ├── devedores.controller.js
│   │   └── dividas.controller.js
│   ├── router/
│   │   ├── devedores.routes.js
│   │   └── dividas.routes.js
│   ├── utils/
│   │   └── validarCpf.js
│   ├── app.js
│   ├── prisma.js
│   └── server.js
├── tests/
├── prisma7.config.ts
├── package.json
└── .gitignore

Organização

controllers: regras de negócio e tratamento das requisições.

router: definição dos endpoints da API.

utils: funções auxiliares reutilizáveis.

prisma: schema do banco e histórico de migrações.

tests: testes automatizados.

app.js: configuração da aplicação Express.

server.js: inicialização do servidor.

prisma.js: configuração do cliente Prisma e conexão com o banco.

Funcionalidades

Devedores

Cadastrar devedor.

Listar devedores.

Consultar devedor por ID.

Atualizar cadastro completo.

Atualizar cadastro parcialmente.

Excluir devedor.

Validar CPF.

Validar e-mail e telefone.

Impedir cadastro de CPF duplicado.

Dívidas

Cadastrar dívida.

Listar dívidas.

Consultar dívida por ID.

Gerar relatório de dívidas.

Atualizar status da dívida.

Endpoints

A API utiliza o endereço base:

http://localhost:3000

Devedores

Método

Endpoint

Descrição

GET

/api/devedores

Lista os devedores

GET

/api/devedores/:id

Consulta por ID

POST

/api/devedores

Cadastra um devedor

PUT

/api/devedores/:id

Atualiza o cadastro completo

PATCH

/api/devedores/:id

Atualiza parcialmente

DELETE

/api/devedores/:id

Exclui um devedor

Dívidas

Método

Endpoint

Descrição

POST

/api/dividas

Cadastra uma dívida

GET

/api/dividas

Lista as dívidas

GET

/api/dividas/relatorio

Gera relatório

GET

/api/dividas/:id

Consulta dívida por ID

PATCH

/api/dividas/:id/status

Atualiza o status

Como executar o projeto

1. Pré-requisitos

Antes de começar, instale:

Node.js

MySQL

Git

2. Clonar o repositório

git clone https://github.com/elimjogos-pixel/Api-devedores.git

Entre na pasta:

cd Api-devedores

3. Instalar dependências

npm install

4. Configurar as variáveis de ambiente

Crie um arquivo .env na raiz do projeto.

Exemplo:

DB_PASSWORD=sua_senha_do_mysql
DATABASE_URL="mysql://root:sua_senha_do_mysql@localhost:3306/api_devedores"

Substitua os valores de exemplo pelas credenciais do seu ambiente. Se a senha tiver caracteres especiais, utilize a codificação apropriada para URL no DATABASE_URL.

Importante: nunca envie o arquivo .env para o GitHub.

5. Preparar o banco de dados

Crie no MySQL um banco chamado:

CREATE DATABASE api_devedores;

Depois, execute as migrações do Prisma:

npx prisma migrate dev

Gere o cliente Prisma:

npx prisma generate

6. Iniciar a aplicação

Modo de desenvolvimento:

npm run dev

Modo normal:

npm start

O servidor estará disponível em:

http://localhost:3000

A rota inicial pode ser acessada em:

http://localhost:3000/

Testes automatizados

O projeto utiliza Jest e Supertest para verificar o comportamento da aplicação e suas funcionalidades.

Execute:

npm test

Último resultado registrado durante o desenvolvimento:

Test Suites: 4 passed, 4 total
Tests:       106 passed, 106 total
Snapshots:   0 total

Banco de dados

O projeto possui duas entidades principais:

Devedor

ID

Nome

CPF

E-mail

Telefone

Data de criação

Dívida

ID

ID do devedor relacionado

Descrição

Valor

Data de vencimento

Status

Data de criação

Um devedor pode possuir várias dívidas. Cada dívida está relacionada a um devedor.

Próximas evoluções

Desenvolvimento de uma interface frontend.

Integração completa entre frontend e API.

Documentação interativa com Swagger/OpenAPI.

Evolução gradual para TypeScript.

Melhorias contínuas na cobertura e qualidade dos testes.

Autor

Projeto desenvolvido como parte de uma jornada prática de aprendizado em desenvolvimento backend, com foco em construção de APIs REST, banco de dados, testes automatizados e preparação para o mercado de tecnologia.

Repositório: https://github.com/elimjogos-pixel/Api-devedores