import rateLimit from "express-rate-limit";

const bloqueadorLogin = rateLimit({
    windowMs: 15 * 60 * 1000, // Tempo de bloqueio: 15 minutos
    max: 20, // Limite de 5 tentativas por IP
    message: { message: "Muitas tentativas de login. Tente novamente após 15 minutos." }
});

export default bloqueadorLogin;