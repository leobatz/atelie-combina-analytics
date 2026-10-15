import express from 'express';
import database  from './config/database';

//Importando rotas
import authRoutes from './routes/authRoutes.js'

const app = express();
const PORT = 3000;

app.use("/login", authRoutes);

async function startServer() { //Função para iniciar o server
    try {
        await database.authenticate();
        console.log('Banco de dados conectado com sucesso ✅');

        await database.sync();
        console.log('Tabelas sincronizadas com sucesso!'); //Sincroniza as tabelas com base no que tem na models

        app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT} 🚀`);
        });
    } catch (error) {
        console.error('Erro ao iniciar servidor: ', error);
    }
};

startServer();