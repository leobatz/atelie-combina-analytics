import { useState } from "react";
import { Link } from "react-router";
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

  const itensMenu = [
    { nome: "Dashboard", icone: ChartNoAxesColumnIncreasing, link: "/" },
    { nome: "Pedidos", icone: ShoppingBag, link: "/pedidos" },
    { nome: "Clientes", icone: UsersRound, link: "/clientes" },
  ];

  return (
    <header className="relative border-t-[20px] border-b-[3px] border-[#E47798]">
      <div className="flex items-center justify-between px-4 py-3 md:px-5 md:py-4">
        {/* Menu para telas médias/grandes */}
        <nav className="hidden gap-3 md:flex">
          {itensMenu.map((item) => {
            const Icone = item.icone;

            return (
              <Link key={item.link} to={item.link} title={item.nome}>
                <div className="flex items-center justify-center rounded-[20px] bg-[#E47798] p-4 transition hover:brightness-90 active:scale-90">
                  <Icone className="size-10 text-white" />
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Botão mobile: aparece apenas abaixo de md */}
        <button
          type="button"
          onClick={() => setMenuAberto(!menuAberto)}
          className="rounded-xl bg-[#E47798] p-2.5 text-white md:hidden"
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
        >
          {menuAberto ? <X className="size-7" /> : <Menu className="size-7" />}
        </button>

        {/* Sair: aparece em todos os tamanhos */}
        <button
          type="button"
          title="Sair"
          className="rounded-xl cursor-pointer bg-[#E47798] p-2.5 text-white transition hover:brightness-90 active:scale-90 md:rounded-[20px] md:p-4"
        >
          <LogOut className="size-7 md:size-10" />
        </button>
      </div>

      {/* Painel mobile */}
      {menuAberto && (
        <nav className="absolute left-0 top-full z-10 flex w-full flex-col gap-2 border-b-[3px] border-[#E47798] bg-[#fde0e8] p-4 shadow-md md:hidden">
          {itensMenu.map((item) => {
            const Icone = item.icone;

            return (
              <Link
                key={item.link}
                to={item.link}
                onClick={() => setMenuAberto(false)}
                className="flex items-center gap-3 rounded-xl bg-[#E47798] p-3 text-white"
              >
                <Icone className="size-6" />
                <span>{item.nome}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}

export default Header;