import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError } from 'sequelize';
import HttpError from '../utils/HttpError.js';

// O Express reconhece o middleware de erro pelos quatro argumentos.
export default function tratarErro(error, req, res, next) {
    if (res.headersSent) return next(error);
    if (error instanceof HttpError) return res.status(error.status).json({ message: error.message });
    if (error.type === 'entity.parse.failed') return res.status(400).json({ message: 'JSON inválido.' });
    if (error.type === 'entity.too.large') return res.status(413).json({ message: 'O conteúdo enviado é muito grande.' });
    if (error instanceof UniqueConstraintError) return res.status(409).json({ message: 'Registro já cadastrado.' });
    if (error instanceof ForeignKeyConstraintError) return res.status(409).json({ message: 'O registro relacionado não existe ou está em uso.' });
    if (error instanceof ValidationError) return res.status(400).json({ message: 'Verifique os dados informados.' });
    console.error('Erro na API:', error.name, error.message);
    return res.status(500).json({ message: 'Não foi possível processar a solicitação.' });
}
