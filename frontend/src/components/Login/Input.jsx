import { useState } from 'react';
import { Eye, EyeClosed } from 'lucide-react';

function Input({ showPasswordToggle = false, type, ...props }) {
    const [visible, setVisible] = useState(false);

    const inputType = showPasswordToggle ? (visible ? "text" : "password") : type;

    return (
        <div className="flex w-full justify-around items-center pr-5 box-border bg-white rounded-[12px]">
            <input
                {...props}
                type={inputType}
                className="w-full rounded-[12px] bg-white p-3 pr-11 outline-none"
            />

            {showPasswordToggle && (
                <button
                    type="button"
                    onClick={() => setVisible(!visible)}
                    title={visible ? 'Ocultar senha' : 'Mostrar senha'}
                    className='h-5'
                >
                    {visible ? <EyeClosed color='gray' size={20} /> : <Eye color='gray' size={20} />}
                </button>
            )}
        </div>
    );
};

export default Input;