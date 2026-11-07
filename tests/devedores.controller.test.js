
jest.mock('../src/prisma', () => ({
    devedor: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
    }
}));

const prisma = require('../src/prisma');

const {
    cadastrar,
    listar,
    consultarPorId,
    atualizar,
    atualizarParcial,
    excluir
} = require('../src/controllers/devedores.controller');


describe('Testes do cadastro de devedores', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Deve cadastrar um devedor com sucesso', async () => {

        const req = {
            body: {
                nome: '  João da Silva  ',
                cpf: '529.982.247-25',
                email: 'JOAO@EMAIL.COM',
                telefone: '(11) 98765-4321'
            }
        };

        const novoDevedor = {
            id: 1,
            nome: 'João da Silva',
            cpf: '52998224725',
            email: 'joao@email.com',
            telefone: '11987654321'
        };

        prisma.devedor.create.mockResolvedValue(novoDevedor);

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await cadastrar(req, res);

        expect(res.status).toHaveBeenCalledWith(201);

        expect(res.json).toHaveBeenCalledWith(novoDevedor);

        expect(prisma.devedor.create).toHaveBeenCalledWith({
            data: {
                nome: 'João da Silva',
                cpf: '52998224725',
                email: 'joao@email.com',
                telefone: '11987654321'
            }
        });

    });

test('Deve retornar 409 quando o cpf ja estiver cadastrado', async () => {

    const req = {
        body: {
            nome: 'João da Silva',
            cpf: '529.982.247-25'
        }
    };

    const erroDuplicidade = new Error('CPF duplicado');
    erroDuplicidade.code = 'P2002';

    prisma.devedor.create.mockRejectedValue(erroDuplicidade);

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

     await cadastrar(req, res);

    expect(res.status).toHaveBeenCalledWith(409);

    expect(res.json).toHaveBeenCalledWith({
	    erro: 'Já existe um devedor com esse CPF.'
	});

    });

    test('Deve Retornar 400 quando o cpf for invalido', async () => {
        const req = {
            body: {
                nome: 'João da Silva',
                cpf: '111.111.111-11'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await cadastrar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'CPF inválido.'
        });
        expect(prisma.devedor.create).not.toHaveBeenCalled();
    });

    test('DEve retornar 400 quando o email for invalido', async () => {
        const req = {
            body: {
                nome: 'João da Silva',
                cpf: '529.982.247-25',
                email: 'email-invalido'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await cadastrar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        
        expect(res.json).toHaveBeenCalledWith({
            erro: 'E-mail inválido.'
        })
        expect(prisma.devedor.create).not.toHaveBeenCalled();
    });
    test('Deve retornar 400 quando o telefone for invalido', async () => {
        const req = {
            body: {
                nome: 'João da Silva',
                cpf: '529.982.247-25',
                telefone: '12345'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await cadastrar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            erro: 'Telefone inválido. Informe DDD e número.'
        });
        expect(prisma.devedor.create).not.toHaveBeenCalled();
    });
    test('Deve retornar 400 quando o nome não for informado', async () => {
        const req = {
            body: {
                cpf:'529.982.247-25'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        await cadastrar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            erro: 'Nome e CPF são obrigatórios.'
        });
        expect(prisma.devedor.create).not.toHaveBeenCalled();
    });

    test('Deve listar todos os devedores', async () => {
        const req = {};

        const devedores = [
            {
                id: 1,
                nome: 'João da Silva',
                cpf: '52998224725'
            },
            {
                id: 2,
                nome: 'Maria Oliveira',
                cpf: '11144477735'
            }
        ];

        prisma.devedor.findMany.mockResolvedValue(devedores);

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await listar(req, res);

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith(devedores);

        expect(prisma.devedor.findMany).toHaveBeenCalledTimes(1);
    });

    test('Deve retornar 500 quando ocorrer erro ao listar devedores', async () => {
        const req = {};

        prisma.devedor.findMany.mockRejectedValue(
            new Error('Erro de conexão com o banco')
        );

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await listar(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            erro: 'Erro ao listar devedores.'
        });

        expect(prisma.devedor.findMany).toHaveBeenCalledTimes(1);
    });
    //teste consulta devedor
    describe('Testes de consulta de devedor pelo ID', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        test('Deve consultar um devedor pelo ID com sucesso', async () => {
            const devedor = {
                id: 1,
                nome: 'João da Silva',
                cpf: '529.982.247-25'
            };

            prisma.devedor.findUnique.mockResolvedValue(devedor);

            const req = {
                params: { id: '1' }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json:jest.fn()
            };

            await consultarPorId(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(devedor);

            expect(prisma.devedor.findUnique).toHaveBeenCalledWith({
                where: { id: 1 }
            });
        });

        test('Não deve consultar quando IF for invalido', async () => {
            const req = {
                params: { id: 'abc' }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await consultarPorId(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                erro: 'ID inválido.'
            });
            expect(prisma.devedor.findUnique).not.toHaveBeenCalled();
        });
        test('Deve retornar 404 quando o devedor não existir', async () => {
            prisma.devedor.findUnique.mockResolvedValue(null);

            const req = {
                params: { id: '999' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await consultarPorId(req, res);

            expect(res.status).toHaveBeenCalledWith(404);

            expect(res.json).toHaveBeenCalledWith({
                erro: 'Devedor não encontrado.'
            });
        });
        test('Deve retornar 500 quando ocorrer erro no banco', async () => {
            prisma.devedor.findUnique.mockRejectedValue(
                new Error('Erro de conexão')
            );
            const req = {
                params: { id: '1' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const consoleSpy = jest
                    .spyOn(console, 'error')
                    .mockImplementation(() => {});

            await consultarPorId(req, res);

            expect(res.status).toHaveBeenCalledWith(500);

            expect(res.json).toHaveBeenCalledWith({
                erro: 'Erro ao consultar devedor.'
            });
            consoleSpy.mockRestore();
        });

    });

});
//testando atualizar
describe('Testes de atualização completa de devedores (PUT)', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Deve atualizar um devedor com sucesso', async () => {
        const devedorExistente = {
            id: 1,
            nome: 'João Antigo',
            cpf: '52998224725'
        };

        const devedorAtualizado = {
            id: 1,
            nome: 'João Silva',
            cpf: '52998224725',
            email: 'joao@email.com',
            telefone: '21999999999'
        };

        prisma.devedor.findUnique.mockResolvedValue(devedorExistente);
        prisma.devedor.update.mockResolvedValue(devedorAtualizado);

        const req = {
            params: { id: '1' },
            body: {
                nome: ' João Silva ',
                cpf: '529.982.247-25',
                email: ' JOAO@EMAIL.COM ',
                telefone: '(21) 99999-9999'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizar(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(devedorAtualizado);

        expect(prisma.devedor.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: {
                nome: 'João Silva',
                cpf: '52998224725',
                email: 'joao@email.com',
                telefone: '21999999999'
            }
        });
    });

    test('Não deve atualizar com ID inválido', async () => {
        const req = {
            params: { id: 'abc' },
            body: {
                nome: 'João Silva',
                cpf: '529.982.247-25'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'ID inválido.'
        });

        expect(prisma.devedor.findUnique).not.toHaveBeenCalled();
    });

    test('Não deve atualizar sem nome e CPF', async () => {
        const req = {
            params: { id: '1' },
            body: {
                nome: '',
                cpf: ''
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'Nome e CPF são obrigatórios.'
        });

        expect(prisma.devedor.findUnique).not.toHaveBeenCalled();
    });

    test('Não deve atualizar com CPF inválido', async () => {
        const req = {
            params: { id: '1' },
            body: {
                nome: 'João Silva',
                cpf: '111.111.111-11'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'CPF inválido.'
        });

        expect(prisma.devedor.findUnique).not.toHaveBeenCalled();
    });

    test('Não deve atualizar com e-mail inválido', async () => {
        const req = {
            params: { id: '1' },
            body: {
                nome: 'João Silva',
                cpf: '529.982.247-25',
                email: 'email-invalido'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'E-mail inválido.'
        });

        expect(prisma.devedor.findUnique).not.toHaveBeenCalled();
    });

    test('Não deve atualizar com telefone inválido', async () => {
        const req = {
            params: { id: '1' },
            body: {
                nome: 'João Silva',
                cpf: '529.982.247-25',
                telefone: '12345'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'Telefone inválido.'
        });

        expect(prisma.devedor.findUnique).not.toHaveBeenCalled();
    });

    test('Deve retornar 404 quando o devedor não existir', async () => {
        prisma.devedor.findUnique.mockResolvedValue(null);

        const req = {
            params: { id: '999' },
            body: {
                nome: 'João Silva',
                cpf: '529.982.247-25'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizar(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'Devedor não encontrado.'
        });

        expect(prisma.devedor.update).not.toHaveBeenCalled();
    });

    test('Deve retornar 409 quando o CPF já estiver cadastrado', async () => {
        const erro = new Error('CPF duplicado');
        erro.code = 'P2002';

        prisma.devedor.findUnique.mockResolvedValue({ id: 1 });
        prisma.devedor.update.mockRejectedValue(erro);

        const req = {
            params: { id: '1' },
            body: {
                nome: 'João Silva',
                cpf: '529.982.247-25'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizar(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'Já existe um devedor com esse CPF.'
        });
    });

    test('Deve retornar 500 quando ocorrer erro inesperado', async () => {
        prisma.devedor.findUnique.mockRejectedValue(
            new Error('Erro de conexão')
        );

        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        const req = {
            params: { id: '1' },
            body: {
                nome: 'João Silva',
                cpf: '529.982.247-25'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizar(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'Erro ao atualizar devedor.'
        });

        consoleSpy.mockRestore();
    });

});
//atualizar parcial
describe('Testes de atualização parcial de devedores (PATCH)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Deve atualizar somente o nome', async () => {
        const devedorAtualizado = {
            id: 1,
            nome: 'João Silva'
        };
        prisma.devedor.findUnique.mockResolvedValue({ id: 1 });
        prisma.devedor.update.mockResolvedValue(devedorAtualizado);

        const req = {
            params: { id: '1' },
            body: { nome: 'João Silva' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        await atualizarParcial(req , res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(devedorAtualizado);

        expect(prisma.devedor.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { nome : 'João Silva' }
        });
    });

    test('Deve atualizar varios campos e normalizar os dados', async () => {
        const devedorAtualizado = {
            id: 1,
            nome: 'João Silva',
            cpf: '52998224725',
            email: 'joao@email.com',
            telefone: '2199999999'
        };
        prisma.devedor.findUnique
                .mockResolvedValueOnce({ id: 1 }) //consulta do cpf
                .mockResolvedValueOnce({ id: 1 }) // consulta devedor
        
        prisma.devedor.update.mockResolvedValue(devedorAtualizado);

        const req = {
            params: { id: 1 },
            body: {
                nome: 'João Silva',
                cpf: '529.982.247-25',
                email: ' JOAO@EMAIL.COM',
                telefone: '(21) 99999-9999'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizarParcial(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(prisma.devedor.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: {
                nome: 'João Silva',
                cpf: '52998224725',
                email: 'joao@email.com',
                telefone: '21999999999'
            }
        });
    });

     test('Deve permitir limpar email e telefone com null', async () => {
        prisma.devedor.findUnique.mockResolvedValue({ id: 1 });

        prisma.devedor.update.mockResolvedValue({
            id: 1,
            email: null,
            telefone: null
        });

        const req = {
            params: { id: '1' },
            body: {
                email: null,
                telefone: null
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizarParcial(req, res);

        expect(res.status).toHaveBeenCalledWith(200);

        expect(prisma.devedor.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: {
                email: null,
                telefone: null
            }
        });
    });

    test('Não deve atualizar com ID inválido', async () => {
        const req = {
            params: { id: 'abc' },
            body: { nome: 'João' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizarParcial(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'ID inválido.'
        });

        expect(prisma.devedor.findUnique).not.toHaveBeenCalled();
    });

    test('Não deve atualizar com o corpo vazio', async () => {
        const req = {
            params: { id: '1' },
            body: {}
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizarParcial(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'Informe pelo menos um campo para atualizar.'
        });
    });

    test('Não deve permitir campos não autorizados', async () => {
        const req = {
            params: { id: '1' },
            body: {
                nome: 'João',
                senha: '123456'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizarParcial(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'Existem campos não permitidos para atualização.',
            camposInvalidos: ['senha']
        });

        expect(prisma.devedor.update).not.toHaveBeenCalled();
    });

    test('Não deve aceitar nome inválido', async () => {
        const req = {
            params: { id: '1' },
            body: { nome: '   ' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizarParcial(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'Nome Invalido'
        });
    });

    test('Não deve aceitar CPF inválido', async () => {
        const req = {
            params: { id: '1' },
            body: { cpf: '111.111.111-11' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizarParcial(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'CPF invalido'
        });

        expect(prisma.devedor.update).not.toHaveBeenCalled();
    });

    test('Deve retornar 409 quando CPF pertencer a outro devedor', async () => {
        prisma.devedor.findUnique.mockResolvedValue({
            id: 2,
            cpf: '52998224725'
        });

        const req = {
            params: { id: '1' },
            body: { cpf: '529.982.247-25' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizarParcial(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'Ja existe outro devedor com esse CPF'
        });

        expect(prisma.devedor.update).not.toHaveBeenCalled();
    });

    test('Não deve aceitar email inválido', async () => {
        const req = {
            params: { id: '1' },
            body: { email: 'email-invalido' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizarParcial(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'Email invalido'
        });
    });

    test('Não deve aceitar telefone inválido', async () => {
        const req = {
            params: { id: '1' },
            body: { telefone: '12345' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizarParcial(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'Telefone inválido.'
        });
    });

    test('Deve retornar 404 quando o devedor não existir', async () => {
        prisma.devedor.findUnique.mockResolvedValue(null);

        const req = {
            params: { id: '999' },
            body: { nome: 'João Silva' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizarParcial(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'Devedor não encontrado'
        });

        expect(prisma.devedor.update).not.toHaveBeenCalled();
    });

    test('Deve retornar 500 quando ocorrer erro inesperado', async () => {
        prisma.devedor.findUnique.mockRejectedValue(
            new Error('Erro de conexão')
        );

        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        const req = {
            params: { id: '1' },
            body: { nome: 'João Silva' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        try {
            await atualizarParcial(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                erro: 'Erro ao atualizar devedor'
            });
        } finally {
            consoleSpy.mockRestore();
        }
    });
    test('Não deve aceitar nome que não seja texto', async () => {
    const req = {
        params: { id: '1' },
        body: { nome: 123 }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    await atualizarParcial(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
        erro: 'Nome Invalido'
    });

    expect(prisma.devedor.update).not.toHaveBeenCalled();
    });
    
    test('Não deve aceitar email que não seja texto', async () => {
        const req = {
            params: { id: '1' },
            body: { email: 123 }
        };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            await atualizarParcial(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                erro: 'Email invalido'
            });
            expect(prisma.devedor.update).not.toHaveBeenCalled();
    });

});
//excluir

describe('excluir', () => { 
        beforeEach(() => {
            jest.clearAllMocks();
        });
        // aqui continua
    test('Deve excluir um devedor com sucesso', async () => {
        prisma.devedor.findUnique.mockResolvedValue({
            id: 1,
            nome: 'João',
            cpf: '52998224725'
        });
        prisma.devedor.delete.mockResolvedValue({
            id: 1
        });

        const req = {
            params: { id: '1' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        

        await excluir(req, res);

        expect(prisma.devedor.findUnique).toHaveBeenCalledWith({
            where: { id: 1 }
        });

        expect(prisma.devedor.delete).toHaveBeenCalledWith({
            where: { id: 1 }
        });

        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();


    });

    test('Deve retornar 400 quando o ID for invalido', async () => {
        const req = {
            params: { id: 'abc' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await excluir(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(prisma.devedor.findUnique).not.toHaveBeenCalled();
        expect(prisma.devedor.delete).not.toHaveBeenCalled();

    });

    test('Deve retornar 404 quando o devedor não existir', async () => {
        prisma.devedor.findUnique.mockResolvedValue(null);

        const req = {
            params: { id: '999' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await excluir(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(prisma.devedor.delete).not.toHaveBeenCalled();
    });

    test('deve retornar 409 quando o devedor possuir dívidas', async () => {
        prisma.devedor.findUnique.mockResolvedValue({
            id: 1,
            nome: 'João'
        });

        prisma.devedor.delete.mockRejectedValue({
            code: 'P2003'
        });

        const req = {
            params: { id: '1' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await excluir(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'Não é possível excluir este devedor porque ele possui dívidas cadastradas.'
        });
    });

    test('deve retornar 500 quando ocorrer um erro inesperado', async () => {
        const erroOriginal = console.error;
        console.error = jest.fn();

        prisma.devedor.findUnique.mockRejectedValue(
            new Error('Erro inesperado')
        );

        const req = {
            params: { id: '1' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await excluir(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            erro: 'Erro ao excluir devedor.'
        });

        console.error = erroOriginal;
    });

    test('Não deve aceitar telefone que não seja texto ou numero', async () => {
        const req = {
            params: { id: '1' },
            body: { telefone : { numero: '21999999999' } }
        };
       const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    await atualizarParcial(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
        erro: 'Telefone inválido.'
    });

    expect(prisma.devedor.update).not.toHaveBeenCalled();
    });
        test('Deve retornar 409 quando ocorrer erro P2002 na atualização', async () => {
    prisma.devedor.findUnique.mockResolvedValueOnce({ id: 1 });

    const erro = new Error('CPF duplicado');
    erro.code = 'P2002';

    prisma.devedor.update.mockRejectedValue(erro);

    const req = {
        params: { id: '1' },
        body: { nome: 'João Silva' }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    await atualizarParcial(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
        erro: 'Já existe um devedor com esse CPF.'
    });
    });
    test('Deve permitir manter o próprio CPF sem gerar conflito', async () => {
    const devedor = {
        id: 1,
        nome: 'João Silva',
        cpf: '52998224725'
    };

    prisma.devedor.findUnique
        .mockResolvedValueOnce(devedor) // Busca pelo CPF
        .mockResolvedValueOnce(devedor); // Busca pelo ID

    prisma.devedor.update.mockResolvedValue(devedor);

    const req = {
        params: { id: '1' },
        body: { cpf: '529.982.247-25' }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    await atualizarParcial(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(devedor);

    expect(prisma.devedor.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { cpf: '52998224725' }
    });
    });

    test('Não deve aceitar corpo da requisição como null', async () => {
        const req = { 
            params: { id: '1' },
            body: null
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await atualizarParcial(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            erro: 'Corpo da requisição inválido.'
        });
        expect(prisma.devedor.findUnique).not.toHaveBeenCalled();
        expect(prisma.devedor.update).not.toHaveBeenCalled();
    });

    test('Não deve cadastrar devedor com e-mail que não seja texto', async () => {
    const req = {
        body: {
            nome: 'João da Silva',
            cpf: '52998224725',
            email: 12345
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    await cadastrar(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
        erro: 'E-mail inválido.'
    });

    expect(prisma.devedor.create).not.toHaveBeenCalled();
    });
});
