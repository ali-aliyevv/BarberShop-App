import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Scissors } from "lucide-react";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center p-6 bg-black/30 rounded-3xl border border-white/10 shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Scissors size={56} className="text-amber-500" />
          </motion.div>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 bg-clip-text text-transparent bg-linear-to-r from-amber-400 to-orange-600">
          Deluxe BarberShop
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Deluxe səviyyəli xidmət və mükəmməl tərziniz üçün doğru ünvandasınız.
          Peşəkar ustalarımızla ən son dəblə saç və saqqal kəsimi xidmətləri
          təqdim edirik.
        </p>
        <Link
          to="/services"
          className="inline-block bg-linear-to-r from-amber-500 to-orange-600 text-white font-bold text-lg py-4 px-10 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:scale-105 transition-transform"
        >
          İndi Rezervasiya Et
        </Link>
      </motion.div>
    </div>
  );
};

export default Home;