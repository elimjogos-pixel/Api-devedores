jest.mock('../src/prisma', () => ({
    devedor: {
        findUnique: jest.fn()
    },
    divida: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn()
    }
}));

const prisma = require('../src/prisma');

const {
    cadastrar,
    atualizarStatus,
    listar,
    gerarRelatorio,
    consultarPorId
} = require('../src/controllers/dividas.controller');
const expectCookies = require('supertest/lib/cookies');
const { JsonNull } = require('@prisma/client/runtime/client');

describe('testes do cadastro de dívidas', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    //Teste Cadastro realizado com sucesso
    test('DEve cadastrar uma divida com sucesso', async () => {
        const req = {
            body: {
                devedorId: 1,
                descricao: 'Conta de energia',
                valor: 250,
                dataVencimento: '2026-11-15'
            }
        };

        const devedorEncontrado = {
            id: 1,
            nome: 'João da Silva'
        };

        const novaDivida = {
            id: 1,
            devedorId: 1,
            descricao: 'Conta de energia',
            valor: '250.00',
            dataVencimento: new Date('2026-11-15T00:00:00.000Z'),
            status: 'PENDENTE'
        };

        prisma.devedor.findUnique.mockResolvedValue(devedorEncontrado);

        prisma.divida.create.mockResolvedValue(novaDivida);

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await cadastrar(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(novaDivida);

        expect(prisma.devedor.findUnique).toHaveBeenCalledWith({
            where: { id: 1 }
        });

        expect(prisma.divida.create).toHaveBeenCalledWith({
            data: {
                devedorId: 1,
                descricao: 'Conta de energia',
                valor: '250.00',
                dataVencimento: new Date('2026-11-15T00:00:00.000Z'),
                status: 'PENDENTE'
            }
        });
    });
    // Campos obrigatorios

    test('Deve retornar 400 quando faltarem campos obrigatórios', async () => {
        const req = {
            body: {
                devedorId: 1,
                descricao: '',
                valor: 250,
                dataVencimento: '2026-11-15'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await cadastrar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(prisma.devedor.findUnique).not.toHaveBeenCalled();

        expect(prisma.divida.create).not.toHaveBeenCalled();
    });

    //Valor invalido
    test('Deve retornar 400 quando o valor for inválido', async () => {
        const req = {
            body: {
                devedorId: 1,
                descricao: 'Conta de energia',
                valor: -100,
                dataVencimento: '2026-11-15'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await cadastrar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(prisma.devedor.findUnique).not.toHaveBeenCalled();

        expect(prisma.divida.create).not.toHaveBeenCalled();
    });

    //data invalida
    test('Deve Retornar 400 quando a data de vencimento for invalida', async () => {
        const req = {
            body: {
                devedorId: 1,
                descricao: 'Conta de energia',
                valor: 250,
                dataVencimento: '2026-02-30'

            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await cadastrar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            erro: 'Data de Vencimento invalida'
        });
        expect(prisma.devedor.findUnique).not.toHaveBeenCalled();
    });
    //Devedor inexistente

    test('Deve retornar 404 qunado o devedor não existir', async () => {
        const req = {
            body: {
                devedorId: 999999,
                descricao: 'Conta de energia',
                valor: 250,
                dataVencimento: '2026-11-15'
            }
        };
        prisma.devedor.findUnique.mockResolvedValue(null);

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await cadastrar(req, res);
        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
            erro: 'Devedor não encontrado'
        });
        expect(prisma.divida.create).not.toHaveBeenCalled();
    });

    //testar valor igual a zero
    test('Deve rejeitar uma divida com valor zero', async () => {
        const req = {
            body: {
                devedorId: 1,
                descricao: 'Conta de energia',
                valor: 0,
                dataVencimento: '2026-11-15'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await cadastrar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(prisma.devedor.findUnique).not.toHaveBeenCalled();
    });

    //teste valor negativo
    test('Deve rejeitar uma dívida com valor negativo', async () => {
        const req = {
            body: {
                devedorId: 1,
                descricao: 'Conta de energia',
                valor: -50,
                dataVencimento: '2026-11-15'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await cadastrar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(prisma.devedor.findUnique).not.toHaveBeenCalled();

        expect(prisma.divida.create).not.toHaveBeenCalled();
    });

    //valor não numerico

    test('Deve rejeitar uma dívida com valor não numérico', async () => {
        const req = {
            body: {
                devedorId: 1,
                descricao: 'Conta de energia',
                valor: 'abc',
                dataVencimento: '2026-11-15'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await cadastrar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(prisma.devedor.findUnique).not.toHaveBeenCalled();

        expect(prisma.divida.create).not.toHaveBeenCalled();
    });
    //atualização de cadastro

    test('Deve atualizar o status de uma divida', async () => {
        const req = {
            params: { id: '1' },
            body: { status: 'PAGA'}
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const dividaExistente = {
            id: 1,
            descricao: 'Conta de energia',
            status: 'PENDENTE'
        };

        const dividaAtualizada = {
             id: 1,
             descricao: 'Conta de energia',
             status: 'PAGA'
        };
        prisma.divida.findUnique.mockResolvedValue(dividaExistente);

        prisma.divida.update.mockResolvedValue(dividaAtualizada);

        await atualizarStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(dividaAtualizada);

        expect(prisma.divida.findUnique).toHaveBeenCalledWith({
            where: { id: 1 }
        });
        expect(prisma.divida.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { status: 'PAGA'}
        });
    });
    // rejeitar status invalido

    test('Deve rejeitar um status invalido', async () => {
        const req = {
            params: { id: '1' },
            body: { status: 'CANCELADA' }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizarStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            erro: 'Status invalido',
            statusPermitidos: [
                'PENDENTE',
                'PAGA',
                'VENCIDA'
            ]
        });

        expect(prisma.divida.findUnique).not.toHaveBeenCalled();
        expect(prisma.divida.update).not.toHaveBeenCalled();
    });

    //Divida não encontrada

    test('Deve retornar 404 quando a divida não existir', async () => {
        const req = {
            params: { id: '999999' },
            body: { status: 'PAGA' }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        prisma.divida.findUnique.mockResolvedValue(null);

        await atualizarStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
            erro: 'Divida não encontrada'
        });
        expect(prisma.divida.update).not.toHaveBeenCalled();

    });
    //teste de gerar relatorio sem filtro
    test('Deve listar dividas com paginação padrão', async () => {
        const req = { query: {} };
        const res = {
            status:jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        prisma.divida.findMany.mockResolvedValue([]);
        prisma.divida.count.mockResolvedValue(0);

        await listar(req, res);

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            pagina: 1,
            limite: 10,
            totalRegistros: 0,
            totalPaginas: 0,
            proximaPagina: null,
            paginaAnterior: null,
            dividas: []
        });

        expect(prisma.divida.findMany).toHaveBeenCalled();
        expect(prisma.divida.count).toHaveBeenCalled();
    });
    //testar filtro por status e devedor

    test('Deve filtrar dividas por status e devedor', async () =>{
        const req = {
            query: {
                status: 'PENDENTE',
                devedorId: '5'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        prisma.divida.findMany.mockResolvedValue([]);
        prisma.divida.count.mockResolvedValue(2);

        await listar(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(prisma.divida.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    status: 'PENDENTE',
                    devedorId: 5
                }
            })
        );

        expect(prisma.divida.count).toHaveBeenCalledWith({
            where: {
                status: 'PENDENTE',
                devedorId: 5
            }
        });
    });

    //testar parte especifica

    test('Deve respeitar a paginação solicitada', async () => {
        const req = {
            query: {
                page: '2',
                limit: '5'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        prisma.divida.findMany.mockResolvedValue([]);
        prisma.divida.count.mockResolvedValue(12);

        await listar(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(prisma.divida.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                skip: 5,
                take: 5
            })
        );

       expect(res.json).toHaveBeenCalledWith(
             expect.objectContaining({
                 pagina: 2,
                 limite: 5,
                 totalRegistros: 12,
                 totalPaginas: 3,
                 proximaPagina: 3,
                 paginaAnterior: 1
            })
        );
    });
    // testar um filtro invalido

    test('Deve rejeitar um status invalido na listagem', async () => {
        const req ={
            query: {
                status: 'CANCELADA'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await listar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            erro: 'Status invalido',
            statusPermitidos: [
                'PENDENTE',
                'PAGA',
                'VENCIDA'
            ]
        });

        expect(prisma.divida.findMany).not.toHaveBeenCalled();
        expect(prisma.divida.count).not.toHaveBeenCalled();
    });

    //Testar relatorio financeiro
    test('Deve gerar o relatorio financeiro agrupado por status', async () => {
        const req = {};

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        prisma.divida.groupBy.mockResolvedValue([
            {
                status: 'PENDENTE',
                _count: { _all: 2 },
                _sum: { valor: '300.00'}
            },
            {
                status: 'PAGA',
                _count: { _all: 3 },
                _sum: { valor: '450.00'}
            },
            {
                status: 'VENCIDA',
                _count: { _all: 1 },
                _sum: { valor: '100.00' }
            }
        ]);

        await gerarRelatorio(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            totalDividas: 6,
            quantidadePendente: 2,
            quantidadePaga: 3,
            quantidadeVencida: 1,
            valorPendente: 300,
            valorPago: 450,
            valorVencido: 100,
            valorTotal: 850
        });

        expect(prisma.divida.groupBy).toHaveBeenCalledWith({
            by: ['status'],
            _count: {
                _all:true
            },
            _sum: {
                valor: true
            }
        });
    });

    //Data inicial invalida
    test('Deve rejeitar uma data incial invalida', async () => {
        const req = {
            query: {
                dataInicio: '2026-02-30'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        await listar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'Informe datas validas no formato AAAA-MM-DD'
        });

        expect(prisma.divida.findMany).not.toHaveBeenCalled();
        expect(prisma.divida.count).not.toHaveBeenCalled();
    });

    //data final a anterior
    test('Deve rejeitar uma data final anterior a inicial', async () => {
        const req = {
            query: {
                dataInicio: '2026-11-20',
                dataFim: '2026-11-10'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await listar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'A data inicial não pode ser maior que a data final'
        });

        expect(prisma.divida.findMany).not.toHaveBeenCalled();
        expect(prisma.divida.count).not.toHaveBeenCalled();
    });
    // id de devedor invalido

    test('Deve rejeitar um ID de devedor invalido', async () => {
        const req = {
            query: {
                devedorId: '-5'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await listar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'Id do devedor invalido'
        });

        expect(prisma.divida.findMany).not.toHaveBeenCalled();
        expect(prisma.divida.count).not.toHaveBeenCalled();
    });

    //Pagina invalida
    test('Deve rejeitar uma pagina invalida', async () => {
        const req= {
            query: {
                page: '0'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await listar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'Pagina ou limite invalido. O limite é no maximo 100'
        });

        expect(prisma.divida.findMany).not.toHaveBeenCalled();
        expect(prisma.divida.count).not.toHaveBeenCalled();
    });

    //limite acima de 100
    test('Deve rejeitar um limite superior a 100', async () => {
        const req = {
            query: {
                limit: '150'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await listar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'Pagina ou limite invalido. O limite é no maximo 100'
        });

        expect(prisma.divida.findMany).not.toHaveBeenCalled();
        expect(prisma.divida.count).not.toHaveBeenCalled();
    })
});
// Teste cadastro de dividas
describe('cadastrar dívida', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve cadastrar uma dívida com sucesso', async () => {
        prisma.devedor.findUnique.mockResolvedValue({
            id: 1,
            nome: 'João'
        });

        const dividaCriada = {
            id: 1,
            devedorId: 1,
            descricao: 'Conta de luz',
            valor: '150.00',
            status: 'PENDENTE'
        };

        prisma.divida.create.mockResolvedValue(dividaCriada);

        const req = {
            body: {
                devedorId: 1,
                descricao: ' Conta de luz ',
                valor: 150,
                dataVencimento: '2026-12-10'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await cadastrar(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(prisma.divida.create).toHaveBeenCalledWith({
            data: {
                devedorId: 1,
                descricao: 'Conta de luz',
                valor: '150.00',
                dataVencimento: new Date('2026-12-10T00:00:00.000Z'),
                status: 'PENDENTE'
            }
        });

        expect(res.json).toHaveBeenCalledWith(dividaCriada);
    });

    test('deve retornar 400 quando os campos obrigatórios estiverem inválidos', async () => {
        const req = {
            body: {
                devedorId: 0,
                descricao: '',
                valor: -10,
                dataVencimento: ''
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await cadastrar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(prisma.devedor.findUnique).not.toHaveBeenCalled();
        expect(prisma.divida.create).not.toHaveBeenCalled();
    });

    test('deve retornar 400 quando o formato da data for inválido', async () => {
        const req = {
            body: {
                devedorId: 1,
                descricao: 'Conta de luz',
                valor: 150,
                dataVencimento: '10-12-2026'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await cadastrar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(prisma.devedor.findUnique).not.toHaveBeenCalled();
    });

    test('deve retornar 400 quando a data não existir', async () => {
        const req = {
            body: {
                devedorId: 1,
                descricao: 'Conta de luz',
                valor: 150,
                dataVencimento: '2026-02-30'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await cadastrar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(prisma.devedor.findUnique).not.toHaveBeenCalled();
    });

    test('deve retornar 404 quando o devedor não existir', async () => {
        prisma.devedor.findUnique.mockResolvedValue(null);

        const req = {
            body: {
                devedorId: 999,
                descricao: 'Conta de luz',
                valor: 150,
                dataVencimento: '2026-12-10'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await cadastrar(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(prisma.divida.create).not.toHaveBeenCalled();
    });

    test('deve retornar 500 quando ocorrer erro no banco', async () => {
        const erroOriginal = console.error;
        console.error = jest.fn();

        prisma.devedor.findUnique.mockRejectedValue(
            new Error('Erro de conexão')
        );

        const req = {
            body: {
                devedorId: 1,
                descricao: 'Conta de luz',
                valor: 150,
                dataVencimento: '2026-12-10'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await cadastrar(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

        console.error = erroOriginal;
    });
});

describe('listar dívidas', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve listar dívidas com sucesso', async () => {
        prisma.divida.findMany.mockResolvedValue([
            { id: 1, descricao: 'Conta de luz' }
        ]);

        prisma.divida.count.mockResolvedValue(1);

        const req = {
            query: {}
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await listar(req, res);

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                pagina: 1,
                limite: 10,
                totalRegistros: 1,
                totalPaginas: 1,
                proximaPagina: null,
                paginaAnterior: null
            })
        );
    });

    test('deve retornar 400 quando o status for inválido', async () => {
        const req = {
            query: { status: 'CANCELADA' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await listar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(prisma.divida.findMany).not.toHaveBeenCalled();
    });

    test('deve retornar 400 quando o ID do devedor for inválido', async () => {
        const req = {
            query: { devedorId: 'abc' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await listar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(prisma.divida.findMany).not.toHaveBeenCalled();
    });

    test('deve retornar 400 quando a data for inválida', async () => {
        const req = {
            query: { dataInicio: '2026-02-30' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await listar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(prisma.divida.findMany).not.toHaveBeenCalled();
    });

    test('deve retornar 400 quando a data inicial for maior que a final', async () => {
        const req = {
            query: {
                dataInicio: '2026-12-20',
                dataFim: '2026-12-10'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await listar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(prisma.divida.findMany).not.toHaveBeenCalled();
    });

    test('deve retornar 400 quando a paginação for inválida', async () => {
        const req = {
            query: {
                page: '0',
                limit: '10'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await listar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(prisma.divida.findMany).not.toHaveBeenCalled();
    });

    test('deve aplicar filtros e paginação corretamente', async () => {
        prisma.divida.findMany.mockResolvedValue([]);
        prisma.divida.count.mockResolvedValue(25);

        const req = {
            query: {
                status: 'PENDENTE',
                devedorId: '2',
                dataInicio: '2026-12-01',
                dataFim: '2026-12-31',
                page: '2',
                limit: '10'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await listar(req, res);

        expect(prisma.divida.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    status: 'PENDENTE',
                    devedorId: 2,
                    dataVencimento: {
                        gte: new Date('2026-12-01T00:00:00.000Z'),
                        lt: new Date('2027-01-01T00:00:00.000Z')
                    }
                },
                skip: 10,
                take: 10
            })
        );

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                pagina: 2,
                limite: 10,
                totalRegistros: 25,
                totalPaginas: 3,
                proximaPagina: 3,
                paginaAnterior: 1
            })
        );
    });

    test('deve retornar 500 quando ocorrer erro no banco', async () => {
        const erroOriginal = console.error;
        console.error = jest.fn();

        prisma.divida.findMany.mockRejectedValue(
            new Error('Erro de conexão')
        );

        prisma.divida.count.mockResolvedValue(0);

        const req = {
            query: {}
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await listar(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

        console.error = erroOriginal;
    });
});
//metodo consultar por id
describe('consultarPorId', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Deve consultar uma divida com sucesso', async () => {
        const divida = {
            id: 1,
            descricao: 'Conta de luz',
            valor: '150.00'
        };
        prisma.divida.findUnique.mockResolvedValue(divida);

        const req = { params: { id: '1' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await consultarPorId(req, res);

        expect(prisma.divida.findUnique).toHaveBeenCalledWith({
            where: { id: 1 }
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(divida);
    });

    test('Deve retornar 400 quando o ID for invalido', async () =>{
        const req = { params: { id: 'abc' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json:jest.fn()
        };

        await consultarPorId(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(prisma.divida.findUnique).not.toHaveBeenCalled();
    });

    test('Deve retornar 404 quando a divida não existir', async () => {
        prisma.divida.findUnique.mockResolvedValue(null);

        const req = {
            params: { id: '999' }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await consultarPorId(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('Deve retornar 500 quando ocorrer erro no banco', async () => {
    prisma.divida.findUnique.mockRejectedValue(new Error('Erro no banco'));

    const req = {
        params: { id: '1' }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    await consultarPorId(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
        erro: 'Erro ao consultar Divida'
    });
});
});
// Teste de atualizar status
describe('atualizarStatus', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve atualizar o status com sucesso', async () => {
        prisma.divida.findUnique.mockResolvedValue({ id: 1 });

        const atualizada = {
            id: 1,
            status: 'PAGA'
        };

        prisma.divida.update.mockResolvedValue(atualizada);

        const req = {
            params: { id: '1' },
            body: { status: 'PAGA' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizarStatus(req, res);

        expect(prisma.divida.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { status: 'PAGA' }
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(atualizada);
    });

    test('deve retornar 400 quando o ID for inválido', async () => {
        const req = {
            params: { id: 'abc' },
            body: { status: 'PAGA' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizarStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(prisma.divida.findUnique).not.toHaveBeenCalled();
    });

    test('deve retornar 400 quando o status for inválido', async () => {
        const req = {
            params: { id: '1' },
            body: { status: 'CANCELADA' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizarStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(prisma.divida.findUnique).not.toHaveBeenCalled();
    });

    test('deve retornar 404 quando a dívida não existir', async () => {
        prisma.divida.findUnique.mockResolvedValue(null);

        const req = {
            params: { id: '999' },
            body: { status: 'PAGA' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizarStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(prisma.divida.update).not.toHaveBeenCalled();
    });

    test('deve retornar 500 quando ocorrer erro no banco', async () => {
        const erroOriginal = console.error;
        console.error = jest.fn();

        prisma.divida.findUnique.mockRejectedValue(
            new Error('Erro de conexão')
        );

        const req = {
            params: { id: '1' },
            body: { status: 'PAGA' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizarStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

        console.error = erroOriginal;
    });
});

// Teste de gerar relatorio
describe('gerarRelatorio', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve gerar relatório financeiro corretamente', async () => {
        prisma.divida.groupBy.mockResolvedValue([
            {
                status: 'PENDENTE',
                _count: { _all: 3 },
                _sum: { valor: '300.00' }
            },
            {
                status: 'PAGA',
                _count: { _all: 2 },
                _sum: { valor: '200.00' }
            },
            {
                status: 'VENCIDA',
                _count: { _all: 1 },
                _sum: { valor: '100.00' }
            }
        ]);

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await gerarRelatorio(req, res);

        expect(prisma.divida.groupBy).toHaveBeenCalledWith({
            by: ['status'],
            _count: { _all: true },
            _sum: { valor: true }
        });

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            totalDividas: 6,
            quantidadePendente: 3,
            quantidadePaga: 2,
            quantidadeVencida: 1,
            valorPendente: 300,
            valorPago: 200,
            valorVencido: 100,
            valorTotal: 600
        });
    });

    test('deve retornar zeros quando não houver dívidas', async () => {
        prisma.divida.groupBy.mockResolvedValue([]);

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await gerarRelatorio(req, res);

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            totalDividas: 0,
            quantidadePendente: 0,
            quantidadePaga: 0,
            quantidadeVencida: 0,
            valorPendente: 0,
            valorPago: 0,
            valorVencido: 0,
            valorTotal: 0
        });
    });

    test('deve retornar 500 quando ocorrer erro ao gerar relatório', async () => {
        const erroOriginal = console.error;
        console.error = jest.fn();

        prisma.divida.groupBy.mockRejectedValue(
            new Error('Erro de conexão')
        );

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await gerarRelatorio(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

        console.error = erroOriginal;
    });
});
