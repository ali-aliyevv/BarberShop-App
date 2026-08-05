import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  isLoggedIn: boolean;
  userRole: string | null;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  closeMenu: () => void;
  handleLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isLoggedIn,
  userRole,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  closeMenu,
  handleLogout,
}) => {
  return (
    <nav className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-amber-500">
          <Link to="/" onClick={closeMenu}>
            ✂️ Deluxe BarberShop
          </Link>
        </h1>

        {/* Desktop Naviqasiya */}
        <div className="hidden md:flex space-x-6 font-semibold items-center">
          {userRole !== "barber" && (
            <>
              <Link to="/services" className="hover:text-amber-400 transition">
                Xidmətlər
              </Link>
              <Link to="/barbers" className="hover:text-amber-400 transition">
                Bərbərlər
              </Link>
            </>
          )}

          {isLoggedIn && userRole === "client" && (
            <Link to="/dashboard" className="hover:text-amber-400 transition">
              Kabinet
            </Link>
          )}

          {isLoggedIn && (userRole === "admin" || userRole === "barber") && (
            <Link to="/admin" className="text-amber-400 hover:underline">
              İdarəetmə Paneli
            </Link>
          )}

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-red-600 px-4 py-1.5 rounded-lg text-sm hover:bg-red-700 transition"
            >
              Çıxış
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-amber-500 text-gray-900 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-amber-400 transition"
            >
              Giriş
            </Link>
          )}
        </div>

        {/* Mobil Menyu Düyməsi */}
        <button
          className="md:hidden text-amber-500 hover:text-amber-400 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobil Menyu Açılan Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-gray-800 border-t border-gray-700 overflow-hidden"
          >
            <div className="flex flex-col px-6 py-4 space-y-4 font-semibold text-center">
              {userRole !== "barber" && (
                <>
                  <Link to="/services" onClick={closeMenu} className="block hover:text-amber-400 transition">
                    Xidmətlər
                  </Link>
                  <Link to="/barbers" onClick={closeMenu} className="block hover:text-amber-400 transition">
                    Bərbərlər
                  </Link>
                </>
              )}

              {isLoggedIn && userRole === "client" && (
                <Link to="/dashboard" onClick={closeMenu} className="block hover:text-amber-400 transition">
                  Kabinet
                </Link>
              )}

              {isLoggedIn && (userRole === "admin" || userRole === "barber") && (
                <Link to="/admin" onClick={closeMenu} className="block text-amber-400 hover:underline">
                  İdarəetmə Paneli
                </Link>
              )}

              <div className="pt-2 border-t border-gray-700">
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 px-4 py-2.5 rounded-lg text-sm hover:bg-red-700 transition"
                  >
                    Çıxış
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="block w-full bg-amber-500 text-gray-900 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-amber-400 transition"
                  >
                    Giriş
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};