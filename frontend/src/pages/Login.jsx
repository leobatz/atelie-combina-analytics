import { useState } from 'react';
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import api from '../services/api.js'
import Input from '../components/Login/Input.jsx';
import { mensagemErro } from '../utils/pedidos.js';

function Login() {
    const [username, setUsername] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    async function handleLogin(event) {
        event.preventDefault();
        if (loading) return;
        if (!username || !senha) {
            return toast.warn("Preencha todos os campos!");
        };

        setLoading(true);

        try {
            const response = await api.post('/login', { username, senha });

            localStorage.setItem('token', response.data.token);

            setUsername('');
            setSenha('');

            navigate('/', { replace: true });
        } catch (error) {
            console.error(error);
            toast.error(mensagemErro(error, 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.'));
        } finally {
            setLoading(false); 
        }
    }

    return (
        <main className="flex items-center justify-center h-screen bg-[#FDB4C8]">
            <form onSubmit={handleLogin} className="relative mx-4 flex w-full max-w-sm flex-col items-center justify-center gap-5 rounded-[40px] bg-[#fed9e3] p-6 pt-15 sm:p-10 sm:pt-15">
                <div className="absolute flex items-center justify-center top-0 -translate-y-1/2 rounded-full w-20 h-20 bg-[#A75870]">
                    <img className='w-10' src="/icons/perfil.svg" alt="" />
                </div>

                <div className='flex flex-col items-center justify-center'>
                    <h1 className='text-[#A75870] text-[25px]'>
                        Login
                    </h1>
                    <div className="h-0.5 w-20 bg-[#A75870]" />
                </div>

                <div className='flex flex-col items-center justify-center gap-2'>
                    <Input 
                        value={username}
                        name="username"
                        autoComplete="username"
                        aria-label="Usuário"
                        required
                        onChange={(e) => setUsername(e.target.value)} 
                        placeholder={'Usuário'} 
                        type={'text'}
                    />
                    <Input
                        value={senha}
                        name="senha"
                        autoComplete="current-password"
                        aria-label="Senha"
                        required
                        onChange={(e) => setSenha(e.target.value)}
                        showPasswordToggle={true} 
                        placeholder={'Senha'} 
                        type={'password'}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className='bg-[#A75870] p-3 rounded-[12px] w-full flex items-center justify-center cursor-pointer text-white hover:brightness-90 transition-all active:scale-95'
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={24} />
                    ) : (
                        "Entrar"
                    )}
                </button>
            </form>
        </main>
    );
};

export default Login;
