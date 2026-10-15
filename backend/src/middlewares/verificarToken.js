import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export default function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization']; //Recebe o Bearer token do Header

    if (!authHeader) {
        return res.status(401).json({ erro: "Token não fornecido" }); //Verifica se recebeu o token
    }

    const token = authHeader.split(" ")[1]; //Separa Bearer e o token, pegando só o token e armazenando em uma constante

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.usuario = decoded;

        next();

    } catch (error) {
        return res.status(401).json({ erro: "Token inválido" });
    }
}