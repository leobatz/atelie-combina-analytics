import Input from '../components/Login/Input';

function Login() {
    return (
        <main className="flex items-center justify-center h-screen bg-[#FDB4C8]">
            <div className="flex flex-col p-10 pt-15 justify-center gap-5 items-center relative rounded-[40px] bg-[#fed9e3]">
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
                    <Input placeholder={'Usuário'} type={'text'}/>
                    <Input showPasswordToggle={true} placeholder={'Senha'} type={'password'}/>
                </div>

                <button 
                    className='bg-[#A75870] p-3 rounded-[12px] w-full cursor-pointer text-white hover:brightness-90 transition-all active:scale-95'
                >
                    Entrar
                </button>
            </div>
        </main>
    );
};

export default Login;