require('dotenv').config();

const prisma = require('./prisma');

async function testarConexao() {
  try {
    await prisma.$connect();

    const resultado = await prisma.devedor.findMany();

    console.log('Conexão com MySQL funcionando!');
    console.log('Devedores cadastrados:', resultado);
  } catch (erro) {
    console.error('Erro ao conectar ao banco:', erro.message);
  } finally {
    await prisma.$disconnect();
  }
}

testarConexao();