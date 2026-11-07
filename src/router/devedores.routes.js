const express = require('express');
const router = express.Router();

const devedoresController = require(
    '../controllers/devedores.controller'
);

//post /api/devedores
router.post('/', devedoresController.cadastrar);

//GET / api/ devedores
router.get('/', devedoresController.listar);

//GET / api/devedores/:id
router.get('/:id', devedoresController.consultarPorId);

//delete /api/devedores/:id

router.delete('/:id', devedoresController.excluir);

//rota do atualizar
router.put('/:id', devedoresController.atualizar);

// criar a rota de atualizar 1 item
router.patch('/:id', devedoresController.atualizarParcial);

module.exports = router;