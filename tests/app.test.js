const request =  require('supertest');
const app = require('../src/app');
const prisma = require('../src/prisma');

describe('Testes API' , () => {
    test('Deve Verificar se a API está funcionando', async () => {
        const respota = await request(app).get('/');

        expect(respota.status).toBe(200);

        expect(respota.body.status).toBe('online');
    });

    test('Deve listar todos os devedores', async () => {
        const respota = await request(app).get('/api/devedores');

        expect(respota.status).toBe(200);

        expect(Array.isArray(respota.body)).toBe(true);
    });
    test('Deve consultar um devedor pelo ID', async () => {
        //primeiro buscamos a lista de devedores
        const lista = await request(app).get('/api/devedores');

        //pegamos o ID do primeiro cadastro
        const id = lista.body[0].id;

        //consultamos o devedor pelo ID
        const respota = await request(app).get(`/api/devedores/${id}`);

        //Verificamos o resultado

        expect(respota.status).toBe(200);
        expect(respota.body.id).toBe(id);
    });
    
    test('Deve retornar 404 ao consultar um ID inexistente', async () => {

        const resposta = await request(app).get('/api/devedores/999999');

        expect(resposta.status).toBe(404);

    });

    afterAll(async () => {
        await prisma.$disconnect();
    });
});
