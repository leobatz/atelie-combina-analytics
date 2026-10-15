import 'dotenv/config'
import bcrypt from 'bcrypt'
import Usuarios from '../models/Usuarios.js'
import database from '../config/database.js'

const username = process.env.ADMIN_USERNAME
const password = process.env.ADMIN_PASSWORD

await database.authenticate()

const senhaHash = await bcrypt.hash(password, 12)

await Usuarios.create({
  username,
  senha: senhaHash,
})

console.log('Usuário criado.')
process.exit()