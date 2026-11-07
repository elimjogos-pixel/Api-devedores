
const prisma = require('../prisma');
const validarCpf = require('../utils/validarCpf');

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(email);
}
function validarTelefone(telefone) {
    const numeros = String(telefone).replace(/\D/g, '');

    return numeros.length === 10 || numeros.length === 11;
}

// Cadastrar um devedor
async function cadastrar(req, res) {
    try {
         const { nome, cpf, email, telefone } = req.body;

        // Valida os campos obrigatórios
        if (!nome || !cpf) {
            return res.status(400).json({
                erro: "Nome e CPF são obrigatórios."
            });
        }

        // Valida o tipo dos campos
        if (typeof nome !== 'string') {
            return res.status(400).json({
                erro: "Nome inválido."
            });
        }

        if (typeof cpf !== 'string' && typeof cpf !== 'number') {
            return res.status(400).json({
                erro: "CPF inválido."
            });
        }

        if (email !== undefined && email !== null && typeof email !== 'string') {
            return res.status(400).json({
                erro: "E-mail inválido."
            });
        }

        if (telefone !== undefined && telefone !== null &&
            typeof telefone !== 'string' && typeof telefone !== 'number') {
            return res.status(400).json({
                erro: "Telefone inválido."
            });
        }

        const nomeFormatado = nome.trim();

        if (!nomeFormatado) {
            return res.status(400).json({
                erro: "Nome inválido."
            });
        }

        const cpfFormatado = String(cpf).replace(/\D/g, '');

        if (!validarCpf(cpfFormatado)) {
            return res.status(400).json({
                erro: "CPF inválido."
            });
        }

        const emailLimpo = email ? email.trim() : '';

        if (emailLimpo && !validarEmail(emailLimpo)) {
            return res.status(400).json({
                erro: "E-mail inválido."
            });
        }

        const telefoneLimpo = telefone ? String(telefone).replace(/\D/g, '') : '';

        if (telefoneLimpo && !validarTelefone(telefoneLimpo)) {
            return res.status(400).json({
                erro: "Telefone inválido. Informe DDD e número."
            });
        }
    
        const emailFormatado = emailLimpo
        ? emailLimpo.toLowerCase()
        : null;
        const telefoneFormatado = telefoneLimpo
        ? telefoneLimpo.replace(/\D/g, '')
        : null;

        const novoDevedor = await prisma.devedor.create({
            data: {
                nome: nomeFormatado,
                cpf: cpfFormatado,
                email: emailFormatado,
                telefone: telefoneFormatado
            }
        });

        return res.status(201).json(novoDevedor);

    } catch (erro) {
        if (erro.code === 'P2002') {
            return res.status(409).json({
                erro: "Já existe um devedor com esse CPF."
            });
        }

        console.error(erro);

        return res.status(500).json({
            erro: "Erro ao cadastrar devedor."
        });
    }
}

// Listar todos os devedores
async function listar(req, res) {
    try {
        const devedores = await prisma.devedor.findMany();

        return res.status(200).json(devedores);

    } catch(erro) {
        console.error(erro);

        return res.status(500).json({
            erro: "Erro ao listar devedores."
        });
    }
}

// Consultar um devedor pelo ID
async function consultarPorId(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                erro: "ID inválido."
            });
        }

        const devedor = await prisma.devedor.findUnique({
            where: { id }
        });

        if (!devedor) {
            return res.status(404).json({
                erro: "Devedor não encontrado."
            });
        }

        return res.status(200).json(devedor);

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            erro: "Erro ao consultar devedor."
        });
    }
}

// Excluir um devedor
async function excluir(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                erro: "ID inválido."
            });
        }

        const devedor = await prisma.devedor.findUnique({
            where: { id }
        });

        if (!devedor) {
            return res.status(404).json({
                erro: "Devedor não encontrado."
            });
        }

        await prisma.devedor.delete({
            where: { id }
        });

        return res.status(204).send();

    } catch (erro) {
        console.error(erro);

        if (erro.code === 'P2003') {
            return res.status(409).json({
                erro: "Não é possível excluir este devedor porque ele possui dívidas cadastradas."
            });
        }

        return res.status(500).json({
            erro: "Erro ao excluir devedor."
        });
    }
}

// Obter todos os devedores (utilizado por outros controladores)
async function obterTodos() {
    return await prisma.devedor.findMany();
}

async function atualizar(req, res) {
    try {
        const id = Number(req.params.id);

        if(!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                erro: 'ID inválido.'
            });
        }

        const dados = req.body;

        //Verificar corpo valido

        if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
            return res.status(400).json({
                erro: 'Corpo da requisição inválida.'
            });
        }

        const { nome, cpf, email, telefone } = dados;

        //valida os campos obrigatorios

        if (!nome || !cpf) {
            return res.status(400).json({
                erro: 'Nome e CPF são obrigatórios.'
            });
        }

        //validar tipos
        if (typeof nome !== 'string') {
            return res.status(400).json({
                erro: 'Nome inválido.'
            });
        }

        if (typeof cpf !== 'string' && typeof cpf !== 'number') {
            return res.status(400).json({
                erro: 'CPF inválido.'
            });
        }

        if (email !== undefined && email !== null && typeof email !== 'string') {
            return res.status(400).json({
                erro: 'E-mail inválido.'
            });
        }

        if (telefone !== undefined && telefone !== null && typeof telefone !== 'string' && typeof telefone !== 'number') {
            return res.status(400).json({
                erro: 'Telefone inválido.'
            });
        }

        const nomeFormatado = nome.trim();

        if (!nomeFormatado) {
            return res.status(400).json({
                erro: 'Nome inválido.'
            });
        }

        const cpfFormatado = String(cpf).replace(/\D/g, '');

        if (!validarCpf(cpfFormatado)) {
            return res.status(400).json({
                erro: 'CPF inválido.'
            });
        }

        const emailLimpo = email ? email.trim() : '';

        if (emailLimpo && !validarEmail(emailLimpo)) {
            return res.status(400).json({
                erro: 'E-mail inválido.'
            });
        }

        const telefoneLimpo = telefone ? String(telefone).replace(/\D/g, '') : '';

        if (telefoneLimpo && !validarTelefone(telefoneLimpo)) {
            return res.status(400).json({
                erro: 'Telefone inválido.'
            });
        }

        const devedor = await prisma.devedor.findUnique({
            where: { id }
        });

        if (!devedor) {
            return res.status(404).json({
                erro: 'Devedor não encontrado.'
            });
        }

        const devedorAtualizado = await prisma.devedor.update({
            where: { id },
            data: {
                nome: nomeFormatado,
                cpf: cpfFormatado,
                email: emailLimpo ? emailLimpo.toLowerCase() : null,
                telefone: telefoneLimpo || null
            }
        });

        return res.status(200).json(devedorAtualizado);

    } catch (erro) {
        
        if (erro.code === 'P2002') {
            return res.status(409).json({
                erro: 'Já existe um devedor com esse CPF.'
            });
        }

        console.error(erro);

        return res.status(500).json({
            erro: 'Erro ao atualizar devedor.'
        });
    }
}

async function atualizarParcial(req, res) {
    try {
        const id = Number(req.params.id);

        // Validar ID
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                erro: 'ID inválido.'
            });
        }

        // Receber os dados enviados
        const dados = req.body;

        // Verificar se algum campo foi enviado
        if (!dados || typeof dados !== 'object' || Array.isArray(dados)){
            return res.status(400).json({
                erro: 'Corpo da requisição inválido.'
            });
        }
        if (Object.keys(dados).length === 0) {
            return res.status(400).json({
                erro: 'Informe pelo menos um campo para atualizar.'
            })
        }

        // Campos permitidos
        const camposPermitidos = [
            'nome',
            'cpf',
            'email',
            'telefone'
        ];

        const camposRecebidos = Object.keys(dados);

        const camposInvalidos = camposRecebidos.filter(
            campo => !camposPermitidos.includes(campo)
        );

        if (camposInvalidos.length > 0) {
            return res.status(400).json({
                erro: 'Existem campos não permitidos para atualização.',
                camposInvalidos
            });
        }

        // A partir daqui começa sua validação de nomes
        //Validar nomes
        const dadosAtualizacao = {};
        if (dados.nome !== undefined) {
            if (typeof dados.nome !== 'string' || !dados.nome.trim()) {
                return res.status(400).json({
                    erro:'Nome Invalido'
                });
            }
            dadosAtualizacao.nome = dados.nome.trim();
        }
        //validar CPF
        if (dados.cpf !== undefined){
            const cpfFormatado = String(dados.cpf).replace(/\D/g, '');

            if (!validarCpf(cpfFormatado)) {
                return res.status(400).json({
                    erro:'CPF invalido'
                });
            }

            const cpfExistente = await prisma.devedor.findUnique({
                where: {
                    cpf: cpfFormatado
                }
            });

            if (cpfExistente && cpfExistente.id !== id) {
                return res.status(409).json({
                    erro:'Ja existe outro devedor com esse CPF'
                });
            }
            dadosAtualizacao.cpf = cpfFormatado;
        }         
        //validar email

        if (dados.email !== undefined) {
            if (dados.email !== null && typeof dados.email !== 'string') {
                return res.status(400).json({
                    erro: 'Email invalido'
                });
            }

            const emailLimpo = dados.email ? dados.email.trim() : '';

            if (emailLimpo && !validarEmail(emailLimpo)) {
                return res.status(400).json({
                    erro:'Email invalido'
                });
            }
            dadosAtualizacao.email = emailLimpo ? emailLimpo.toLowerCase() : null;
        }
        //validar telefone
        if (dados.telefone !== undefined) {
        if (dados.telefone !== null && typeof dados.telefone !== 'string' && typeof dados.telefone !== 'number') {
        return res.status(400).json({
            erro: 'Telefone inválido.'
        });
        }

         const telefoneLimpo = dados.telefone
        ? String(dados.telefone).replace(/\D/g, '')
        : '';

        if (telefoneLimpo && !validarTelefone(telefoneLimpo)) {
        return res.status(400).json({
            erro: 'Telefone inválido.'
        });
        }

         dadosAtualizacao.telefone = telefoneLimpo || null;
        }

        const devedor = await prisma.devedor.findUnique({
            where: {
                id: id
            }
        });
        if (!devedor){
            return res.status(404).json({
                erro: 'Devedor não encontrado'
            });
        }
        const devedorAtualizado = await prisma.devedor.update({
            where: {
                id:id
            },
            data:dadosAtualizacao
        });
        return res.status(200).json(devedorAtualizado);

        //id invalido

        } catch (erro) {
        if (erro.code === 'P2002') {
        return res.status(409).json({
        erro: 'Já existe um devedor com esse CPF.'
            });
        }
        console.error(erro);
        return res.status(500).json({
            erro:'Erro ao atualizar devedor'
        });
    }
    
}

module.exports = {
    cadastrar,
    listar,
    consultarPorId,
    excluir,
    obterTodos,
    atualizar,
    atualizarParcial
};
