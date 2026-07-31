import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Scissors } from "lucide-react";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gray-900 text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center p-8 md:p-12 bg-black/40 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md max-w-3xl w-full"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <Scissors size={56} className="text-amber-500" />
          </motion.div>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-linear-to-r from-amber-400 to-orange-500">
          Deluxe BarberShop
        </h1>
        <p className="text-base md:text-xl text-gray-300 mb-8 max-w-xl mx-auto leading-relaxed">
          Deluxe səviyyəli xidmət və mükəmməl tərziniz üçün doğru ünvandasınız.
          Peşəkar ustalarımızla ən son dəblə saç və saqqal kəsimi xidmətləri
          təqdim edirik.
        </p>
        <Link
          to="/services"
          className="inline-block bg-linear-to-r from-amber-500 to-orange-500 text-gray-900 font-extrabold text-lg py-4 px-10 rounded-full shadow-lg hover:shadow-amber-500/50 hover:scale-105 transition-all duration-300"
        >
          İndi Rezervasiya Et
        </Link>
      </motion.div>
    </div>
  );
};

export default Home;