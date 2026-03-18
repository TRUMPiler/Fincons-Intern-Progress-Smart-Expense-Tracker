import { Link, useLocation } from "react-router";
import { useContext, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { SideBarContext } from "../App";

const Navbar = () => {
  const location = useLocation();
  const { open, setOpen } = useContext(SideBarContext);

  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Budget", path: "/budget" },
    { name: "Transactions", path: "/transcation" },
    { name: "Chat", path: "/chat" },
  ];

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ❌ Hide navbar on mobile OR when sidebar is open
  if (open) return null;

  return (
    <nav
      className={`hidden md:flex fixed top-0 left-0 w-full h-16 items-center justify-between px-6 z-50 transition-all duration-300
      ${
        scrolled
          ? "bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-md border-b border-gray-200 dark:border-gray-800"
          : "bg-transparent"
      }`}
    >

      {/* LEFT */}
      <div className="flex items-center gap-4">
        {/* ✅ Sidebar Trigger (Desktop only) */}
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition"
        >
          <Menu className="text-black dark:text-white" />
        </button>

        <h1 className="text-xl font-bold text-black dark:text-white">
          MoneyMint
        </h1>
      </div>

      {/* CENTER */}
      <div className="flex items-center gap-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`relative text-sm font-medium transition ${
              location.pathname === item.path
                ? "text-black dark:text-indigo-400"
                : "text-gray-900 dark:text-gray-300 hover:text-red-500"
            }`}
          >
            {item.name}

            {/* Active underline */}
            {location.pathname === item.path && (
              <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-blue-900 rounded"></span>
            )}
          </Link>
        ))}
      </div>

      {/* RIGHT */}
      <div>
        {!sessionStorage.getItem("id") && (
          <Link
            to="/login"
            className="text-sm px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            Login
          </Link>
        )}
      </div>

    </nav>
  );
};

export default Navbar;