import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Scissors, Award, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

interface Barber {
  id: number;
  name: string;
  role: string;
  experience: string;
  rating: string;
  specialty: string;
  image: string;
}

const Barbers: React.FC = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/barbers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBarbers(data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="py-24 px-8 max-w-7xl mx-auto min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h2 className="text-5xl font-extrabold text-gray-900 tracking-tight">
          Peşəkar Bərbərlərimiz
        </h2>
        <p className="text-gray-500 mt-4 text-lg max-w-2xl mx-auto">
          Öz işinin peşəkarı olan ustalarımızla tanış olun və tərzinizə ən uyğun
          olanı seçin.
        </p>
        <div className="w-24 h-1.5 bg-linear-to-r from-amber-400 to-orange-500 mx-auto mt-6 rounded-full"></div>
      </motion.div>

      {loading ? (
        <div className="text-center text-gray-500">Bərbərlər yüklənir...</div>
      ) : (
        <div className="grid gap-10 md:grid-cols-2 max-w-4xl mx-auto">
          {barbers.map((barber, index) => (
            <motion.div
              key={barber.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-300 flex flex-col"
            >
              <div className="h-64 overflow-hidden relative bg-gray-200">
                <img
                  src={barber.image}
                  alt={barber.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm font-bold text-sm text-gray-900">
                  <Star size={16} className="text-amber-500 fill-amber-500" />
                  {barber.rating}
                </div>
              </div>

              <div className="p-8 flex flex-col grow">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {barber.name}
                </h3>
                <p className="text-amber-600 font-semibold text-sm mb-4">
                  {barber.role}
                </p>

                <div className="space-y-2 mb-6 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <Award size={16} className="text-amber-500" />{" "}
                    {barber.experience}
                  </p>
                  <p className="flex items-center gap-2">
                    <Scissors size={16} className="text-amber-500" />{" "}
                    Mütəxəssislik: {barber.specialty}
                  </p>
                </div>

                <div className="mt-auto">
                  <Link
                    to="/services"
                    state={{ selectedBarber: barber.name }}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-amber-500 transition-colors"
                  >
                    <Calendar size={18} /> Randevu Al
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Barbers;