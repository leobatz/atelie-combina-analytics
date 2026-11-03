import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import {
  ChartNoAxesColumnIncreasing,
  ShoppingBag,
  UsersRound,
  LogOut,
  Menu,
  X,
} from "lucide-react";

function Header() {
  const [menuAberto, setMenuAberto] = useState(false);

  const navigate = useNavigate();

  const itensMenu = [
    { nome: "Dashboard", icone: ChartNoAxesColumnIncreasing, link: "/" },
    { nome: "Pedidos", icone: ShoppingBag, link: "/pedidos" },
    { nome: "Clientes", icone: UsersRound, link: "/clientes" },
  ];

  return (
    <header className="relative border-t-[20px] border-b-[3px] border-[#E47798]">
      <div className="flex items-center justify-between px-4 py-3 md:px-5 md:py-4">
        {/* Menu para telas médias/grandes */}
        <nav aria-label="Navegação principal" className="hidden gap-3 md:flex">
          {itensMenu.map((item) => {
            const Icone = item.icone;

            return (
              <NavLink
                key={item.link}
                to={item.link}
                end={item.link === "/"}
                title={item.nome}
                aria-label={item.nome}
                className={({ isActive }) => `flex items-center justify-center rounded-[20px] p-4 transition hover:brightness-90 active:scale-90 ${isActive ? "bg-[#A75870]" : "bg-[#E47798]"}`}
              >
                <Icone aria-hidden="true" className="size-10 text-white" />
              </NavLink>
            );
          })}
        </nav>

        {/* Botão mobile: aparece apenas abaixo de md */}
        <button
          type="button"
          onClick={() => setMenuAberto(!menuAberto)}
          className="rounded-xl bg-[#E47798] p-2.5 text-white md:hidden"
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
          aria-controls="menu-mobile"
        >
          {menuAberto ? <X className="size-7" /> : <Menu className="size-7" />}
        </button>

        {/* Sair: aparece em todos os tamanhos */}
        <button
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}
          type="button"
          title="Sair"
          aria-label="Sair"
          className="rounded-xl cursor-pointer bg-[#E47798] p-2.5 text-white transition hover:brightness-90 active:scale-90 md:rounded-[20px] md:p-4"
        >
          <LogOut className="size-7 md:size-10" />
        </button>
      </div>

      {/* Painel mobile */}
      {menuAberto && (
        <nav id="menu-mobile" aria-label="Navegação principal mobile" className="absolute left-0 top-full z-10 flex w-full flex-col gap-2 border-b-[3px] border-[#E47798] bg-[#fde0e8] p-4 shadow-md md:hidden">
          {itensMenu.map((item) => {
            const Icone = item.icone;

            return (
              <NavLink
                key={item.link}
                to={item.link}
                end={item.link === "/"}
                onClick={() => setMenuAberto(false)}
                className={({ isActive }) => `flex items-center gap-3 rounded-xl p-3 text-white ${isActive ? "bg-[#A75870]" : "bg-[#E47798]"}`}
              >
                <Icone className="size-6" />
                <span>{item.nome}</span>
              </NavLink>
            );
          })}
        </nav>
      )}
    </header>
  );
}

export default Header;
