const express = require('express');
const router = express.Router();

const dividasController = require(
    '../controllers/dividas.controller'
);

// cadastrar divida
router.post('/', dividasController.cadastrar);

//listar dividas
router.get('/', dividasController.listar);

//consulta relatorio
router.get('/relatorio', dividasController.gerarRelatorio);

//consultar divida por id
router.get('/:id', dividasController.consultarPorId);

//atulizar status da divida
router.patch('/:id/status', dividasController.atualizarStatus);


module.exports = router;