API Devedores

Sistema web para gerenciamento de devedores e suas respectivas dívidas, desenvolvido como projeto prático de estudo e evolução profissional em desenvolvimento de software.

O projeto possui uma API REST desenvolvida com Node.js, Express, Prisma ORM e MySQL, além de uma interface web construída com React, Vite e Bootstrap.

Também conta com testes automatizados utilizando Jest e Supertest.

Sobre o projeto

O API Devedores permite cadastrar e gerenciar devedores, registrar dívidas, acompanhar vencimentos, atualizar pagamentos e consultar o histórico de dívidas quitadas.

O objetivo é aplicar conceitos importantes do desenvolvimento de software, incluindo:

Construção de APIs REST.

Desenvolvimento backend e frontend.

Organização de código por responsabilidades.

Validação de dados.

Persistência em banco de dados relacional.

Relacionamento entre entidades.

Tratamento de erros HTTP.

Testes automatizados.

Integração entre frontend e backend.

Versionamento com Git e GitHub.

Tecnologias utilizadas:

Node.js

Ambiente de execução JavaScript

Express

Construção da API REST

Prisma ORM

Comunicação com o banco de dados

MySQL

Banco de dados relacional

React

Construção da interface

Vite

Ferramenta de desenvolvimento frontend

Bootstrap

Estilização e componentes visuais

Jest

Testes automatizados

Supertest

Testes das rotas HTTP

Nodemon

Reinicialização automática durante o desenvolvimento

Funcionalidades

Gerenciamento de devedores

Cadastro de devedores.

Listagem de devedores com dívidas pendentes ou vencidas.

Consulta de devedor por ID.

Atualização completa dos dados.

Atualização parcial dos dados.

Exclusão de devedores.

Validação de CPF.

Validação de e-mail e telefone.

Prevenção de CPF duplicado.

Gerenciamento de dívidas

Cadastro de dívidas vinculadas aos devedores.

Consulta e listagem de dívidas.

Consulta das dívidas de um devedor específico.

Controle de vencimentos.

Atualização do status da dívida.

Identificação de dívidas vencidas.

Geração de relatório financeiro.

Histórico de dívidas pagas.

Interface web

Painel administrativo com indicadores.

Cadastro e edição de devedores.

Pesquisa por nome ou CPF.

Cadastro de dívida durante o registro do devedor.

Consulta das dívidas de cada devedor.

Atualização do status de pagamento.

Histórico de pagamentos.

Indicadores de dívidas pendentes, pagas e vencidas.

Endpoints da API

Endereço base:

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

Consulta um devedor por ID

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

GET

/api/devedores/:id/dividas

Consulta as dívidas de um devedor

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

/api/dividas/:id

Consulta uma dívida por ID

GET

/api/dividas/relatorio

Gera relatório de dívidas

GET

/api/dividas/historico

Consulta o histórico de dívidas pagas

PATCH

/api/dividas/:id/status

Atualiza o status da dívida

Banco de dados

O projeto utiliza MySQL e Prisma ORM.

Possui duas entidades principais:

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

Um devedor pode possuir várias dívidas. Cada dívida está relacionada a um único devedor, estabelecendo um relacionamento de um para muitos (1:N).

Como executar o projeto

Pré-requisitos

Instale previamente:

Node.js

MySQL

Git

1. Clonar o repositório

git clone https://github.com/elimjogos-pixel/Api-devedores.git

Entre na pasta:

cd Api-devedores

2. Instalar as dependências

npm install

3. Configurar as variáveis de ambiente

Crie um arquivo .env na raiz do backend.

Exemplo:

DATABASE_URL="mysql://root:sua_senha@localhost:3306/api_devedores"

Substitua os dados de exemplo pelas credenciais do seu ambiente.

Nunca compartilhe o arquivo .env ou envie credenciais para o GitHub.

4. Preparar o banco de dados

Crie o banco no MySQL:

CREATE DATABASE api_devedores;

Execute as migrações:

npx prisma migrate dev

Gere o cliente Prisma:

npx prisma generate

5. Iniciar o backend

Modo de desenvolvimento:

npm run dev

Modo normal:

npm start

O servidor estará disponível em:

http://localhost:3000

6. Executar os testes

npm test

Último resultado registrado durante o desenvolvimento:

Test Suites: 4 passed, 4 total
Tests:       106 passed, 106 total
Snapshots:   0 total

Testes automatizados

O projeto utiliza Jest e Supertest para verificar o comportamento da aplicação e suas rotas HTTP.

Os testes auxiliam na identificação de erros e na validação das funcionalidades implementadas.

O frontend foi desenvolvido utilizando React, Vite e Bootstrap.

Entre na pasta do frontend:

cd frontend

Instale as dependências:

npm install

Inicie o servidor de desenvolvimento:

npm run dev

O Vite exibirá no terminal o endereço local para acessar a aplicação, normalmente:

http://localhost:5173

Outros comandos do frontend

Gerar a versão de produção:

npm run build

Verificar o código com Oxlint:

npm run lint

Visualizar a versão de produção:

npm run preview

Importante: mantenha o backend e o frontend executando em terminais separados para que a interface consiga se comunicar com a API.

Próximas evoluções

Documentação interativa com Swagger/OpenAPI.

Evolução gradual para TypeScript.

Melhorias contínuas na cobertura dos testes.

Aprimoramento da interface e da experiência do usuário.

Autor

Projeto desenvolvido como parte de uma jornada prática de aprendizado em desenvolvimento de software, com foco em backend, frontend, APIs REST, banco de dados, testes automatizados e preparação para o mercado de tecnologia.

Repositório:
https://github.com/elimjogos-pixel/Api-devedores