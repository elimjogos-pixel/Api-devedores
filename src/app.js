require('dotenv').config();
const express = require('express');

const app = express();

const dividasRoutes = require(
    './router/dividas.routes'
);

const devedoresRoutes = require(
    './router/devedores.routes'
);
app.use(express.json());

//rotas de devedores
app.use('/api/devedores', devedoresRoutes);

//rota dividas
app.use('/api/dividas', dividasRoutes);


//rota inicial
app.get('/', (req, res) => {
    res.json({
        mensagem: 'api de Devedores e Dividas funcionando',
        status: 'online'
    });
});

module.exports = app;
