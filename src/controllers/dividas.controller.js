const prisma = require('../prisma');

//cadastrar um divida
async function cadastrar(req, res) {
    try {
        const {
            devedorId,
            descricao,
            valor,
            dataVencimento
        } = req.body;

        //validar campos
        if (
            devedorId === undefined || !Number.isInteger(Number(devedorId)) ||
            Number(devedorId) <=0 ||
            !descricao?.trim() ||
            valor === undefined ||
            valor === null ||
            valor === '' ||
            !Number.isFinite(Number(valor)) ||
            Number(valor) <= 0 ||
            !dataVencimento
        ) {
            return res.status(400).json({
                erro:'Informe devedorId, descrição, valor e dataVencimento'
            });
        }
        // Validar formato e existência da data
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dataVencimento)) {
            return res.status(400).json({
                erro: 'A data deve estar no formato AAAA-MM-DD.'
            });
        }
        const data = new Date(`${dataVencimento}T00:00:00.000Z`);
        if ( Number.isNaN(data.getTime()) || data.toISOString().slice(0,10) !== dataVencimento) {
            return res.status(400).json({
                erro:'Data de Vencimento invalida'
            });
        }
        //verificar se o devedor existe no MySql
        const devedor = await prisma.devedor.findUnique({
            where: {
                id:Number(devedorId)
            }
        });
        if (!devedor) {
            return res.status(404).json({
                erro:'Devedor não encontrado'
            });
        }
        //cadastrar divida no banco
        const novaDivida = await prisma.divida.create({
            data:{
                devedorId: Number(devedorId),
                descricao: descricao.trim(),
                valor: Number(valor).toFixed(2),
                dataVencimento: data,
                status: 'PENDENTE'
            }
        });
        return res.status(201).json(novaDivida);

    } catch (erro){
        console.error(erro);
        return res.status(500).json({
            erro:'Erro ao cadastrar divida'
        });
    }
    
}

//listar todas as dividas
 async function listar(req, res) {
   try {
    const { status, devedorId, dataInicio, dataFim, page = '1', limit = '10' } = req.query;

    const statusPermitidos = [
        'PENDENTE',
        'PAGA',
        'VENCIDA'
    ];
    if (status && !statusPermitidos.includes(status)) {
        return res.status(400).json({
            erro:'Status invalido',
            statusPermitidos
        });
    }
    if ( devedorId !== undefined && (!Number.isInteger(Number(devedorId)) || Number(devedorId) <=0)){
        return res.status(400).json({
            erro:'Id do devedor invalido'
        });
    }
    //validar as datas recebidas
    function validarData(data){
        if (!data) return true;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
            return false;
        }
        const dataConvertida = new Date(`${data}T00:00:00.000Z`);
        return (!Number.isNaN(dataConvertida.getTime()) && dataConvertida.toISOString().slice(0,10) === data);
    }
    if (!validarData(dataInicio) || !validarData(dataFim)) {
        return res.status(400).json({
            erro:'Informe datas validas no formato AAAA-MM-DD'
        });
    }
    if (dataInicio && dataFim && dataInicio > dataFim) {
        return res.status(400).json({
            erro:'A data inicial não pode ser maior que a data final'
        });
    }
    //montar filtros
        const filtros = {
            ...(status && { status }),
            ...(devedorId && {
                devedorId: Number(devedorId)
            }),
             ...(dataInicio || dataFim
                ? {
                    dataVencimento: {
                        ...(dataInicio && {
                            gte: new Date(`${dataInicio}T00:00:00.000Z`)
                        }),
                        ...(dataFim && {
                            lt: new Date(
                                new Date(`${dataFim}T00:00:00.000Z`)
                            .getTime() + 86400000)
                        })
                    }
                }
                : {})
        };

    const pagina = Number(page);
    const limite = Number(limit);
    if ( !Number.isInteger(pagina) || pagina <=0 || !Number.isInteger(limite) || limite <=0 || limite > 100) {
        return res.status(400).json({
            erro:'Pagina ou limite invalido. O limite é no maximo 100'
        });
    }
    const pular = (pagina - 1) * limite;

    const [dividas, totalRegistros] = await Promise.all([
        prisma.divida.findMany({
            where: filtros,
            skip: pular,
            take: limite,
            include: {
                devedor: {
                    select: {
                        id: true,
                        nome: true,
                        cpf: true
                    }
                }
            },
            orderBy: {
                dataVencimento: 'asc'
            }
        }),
        prisma.divida.count({
            where: filtros
        })
    ]);
    const totalPaginas = Math.ceil(totalRegistros / limite);
    return res.status(200).json({
        pagina,
        limite,
        totalRegistros,
        totalPaginas,
        proximaPagina: pagina < totalPaginas ? pagina + 1 : null,
        paginaAnterior: pagina > 1 ? pagina - 1 : null,
        dividas
    });
    
    } catch (erro){
        console.error(erro);

        return res.status(500).json({
            erro:'Erro ao listar dividas'
        });
    }

    
 }

 //consultar dividas pelo ID

 async function consultarPorId(req, res) {
    try{
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <=0){
            return res.status(400).json({
                erro:'ID invalido'
            });
        }
        const divida = await prisma.divida.findUnique({
            where: { id }
        });
        if(!divida){
            return res.status(404).json({
                erro:'Divida não encontrada'
            });
        }
        return res.status(200).json(divida)
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            erro:'Erro ao consultar Divida'
        });
    }
    
 }

 //atualizar status da divida

 async function atualizarStatus(req, res) {
    try{
        const id = Number(req.params.id);
        const { status } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                erro:'Id Invalido'
            });
        }
        const statusPermitidos = [
            'PENDENTE',
            'PAGA',
            'VENCIDA'
        ];

        if (!statusPermitidos.includes(status)) {
            return res.status(400).json({
                erro: 'Status invalido',
                statusPermitidos
            });
        }

        const divida = await prisma.divida.findUnique({
            where: { id }
        });

        if (!divida) {
            return res.status(404).json({
                erro:'Divida não encontrada'
            });
        }

        const dividaAtualizada = await prisma.divida.update({
            where: { id },
            data: { status } 
        });
        return res.status(200).json(dividaAtualizada);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            erro: 'Erro ao atualizar status da divida'
        });
    }
    
 }
  // Gerar relatório financeiro das dívidas
async function gerarRelatorio(req, res) {
    try {
        const resultado = await prisma.divida.groupBy({
            by: ['status'],
            _count: {
                _all: true
            },
            _sum: {
                valor: true
            }
        });

        // Localizar os resultados de cada status
        function obterDados(status) {
            const item = resultado.find(
                divida => divida.status === status
            );

            return {
                quantidade: item ? item._count._all : 0,
                valor: item ? Number(item._sum.valor || 0) : 0
            };
        }

        const pendentes = obterDados('PENDENTE');
        const pagas = obterDados('PAGA');
        const vencidas = obterDados('VENCIDA');

        const totalDividas =
            pendentes.quantidade +
            pagas.quantidade +
            vencidas.quantidade;

        return res.status(200).json({
            totalDividas,

            quantidadePendente: pendentes.quantidade,
            quantidadePaga: pagas.quantidade,
            quantidadeVencida: vencidas.quantidade,

            valorPendente: pendentes.valor,
            valorPago: pagas.valor,
            valorVencido: vencidas.valor,

            valorTotal:
                pendentes.valor +
                pagas.valor +
                vencidas.valor
        });

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            erro: 'Erro ao gerar relatório financeiro.'
        });
    }
}

 module.exports = {
    cadastrar,
    listar,
    consultarPorId,
    atualizarStatus,
    gerarRelatorio
 };

