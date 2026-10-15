import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import { Usuarios } from '../models/Usuarios.js'

dotenv.config()

export async function Login(req, res) {
    try {
        const { username, senha } = req.body

        if (!username || !senha) {
            return res.status(400).json({ message: "Usuário e senha são obrigatórios." })
        }

        const usuario = await Usuarios.findOne({ where: { username } })

        if (!usuario) {
            return res.status(401).json({ message: "Usuário ou senha inválidos." })
        }

        const senhaCorreta = await bcrypt.compare(senha, user.senha)

        if (!senhaCorreta) {
            return res.status(401).json({ message: "Usuário ou senha inválidos." })
        }

        const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ message: "Login realizado com sucesso.", token });

    } catch (error) {
        console.error('Erro ao fazer login: ', error)
        return res.status(500).json( { message: 'Erro interno do servidor', error })
    }
}