import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Scissors,
  ArrowRight,
  Clock,
  X,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  "pk_test_51TyAnrAQ2hvaGElLz0NmRpLlBO7EQ55BBlMGyidzOvoiPrMjVdpdB1XjRdSYM8YZAJ6L80rrhc9Lat23wLMUphH300CPvA4lLk",
);

type ServiceType = {
  id: number;
  name: string;
  duration: string;
  price: string;
  description: string;
  category: string;
};

interface Barber {
  id: number;
  name: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const TiltCard = ({
  service,
  onOpenModal,
}: {
  service: ServiceType;
  onOpenModal: (service: ServiceType) => void;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const userRole = localStorage.getItem("userRole");

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/40 flex flex-col items-center text-center cursor-pointer group hover:shadow-2xl hover:border-amber-200 transition-all duration-300"
    >
      <div
        style={{ transform: "translateZ(50px)" }}
        className="flex flex-col items-center w-full grow"
      >
        <div className="p-4 bg-linear-to-br from-amber-100 to-amber-200 text-amber-700 rounded-2xl mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
          <Scissors size={28} />
        </div>
        <h3 className="text-2xl font-bold mb-2 text-gray-800">
          {service.name}
        </h3>
        <p className="text-gray-500 text-sm mb-4 h-10">{service.description}</p>

        <div className="flex items-center gap-2 mb-6 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
          <Clock size={16} className="text-amber-500" />
          <span className="text-gray-600 font-medium text-sm">
            {service.duration}
          </span>
        </div>

        <p className="text-4xl font-extrabold text-gray-900 mb-8 mt-auto">
          {service.price}
        </p>

        {userRole === "barber" || userRole === "admin" ? (
          <div className="w-full py-3 px-6 bg-gray-100 text-gray-400 font-bold rounded-xl text-center text-sm">
            Bərbər hesabı ilə rezervasiya edilmir
          </div>
        ) : (
          <button
            onClick={() => onOpenModal(service)}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-amber-500 transition-colors duration-300 group/btn"
          >
            Rezervasiya Et
            <ArrowRight
              size={18}
              className="group-hover/btn:translate-x-1 transition-transform"
            />
          </button>
        )}
      </div>
    </motion.div>
  );
};

const CheckoutForm: React.FC<{
  selectedService: ServiceType | null;
  barberName: string;
  date: string;
  time: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}> = ({ selectedService, barberName, date, time, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const customerName = localStorage.getItem("userName") || "Müştəri";
  const customerPhone = localStorage.getItem("userPhone") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      const priceNumeric = selectedService
        ? parseFloat(selectedService.price.replace(/[^\d.]/g, ""))
        : 15;

      const res = await fetch(
        "https://barbershop-app-4lof.onrender.com//api/create-payment-intent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: priceNumeric }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ödəniş xətası");

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) return;

      const paymentResult = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: cardElement },
      });

      if (paymentResult.error) {
        throw new Error(paymentResult.error.message);
      }

      if (paymentResult.paymentIntent?.status === "succeeded") {
        const apptRes = await fetch("https://barbershop-app-4lof.onrender.com//api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            barberName,
            customer: customerName,
            phone: customerPhone,
            date,
            time,
            service: selectedService?.name,
          }),
        });

        const apptData = await apptRes.json();
        if (!apptRes.ok)
          throw new Error(apptData.error || "Rezervasiya xətası");

        onSuccess();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        onError(err.message);
      } else {
        onError("Naməlum xəta baş verdi");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
        <CardElement
          options={{
            style: {
              base: {
                color: "#111827",
                fontFamily: "sans-serif",
                fontSize: "16px",
                "::placeholder": { color: "#9ca3af" },
              },
            },
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50"
      >
        {loading
          ? "İşlənir..."
          : `Ödənişi Təsdiq Et və Bitir (${selectedService?.price})`}
      </button>
    </form>
  );
};

const Services: React.FC = () => {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(
    null,
  );

  const location = useLocation();
  const preSelectedBarber = (location.state as { selectedBarber?: string })
    ?.selectedBarber;

  const [barberName, setBarberName] = useState(preSelectedBarber || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole = localStorage.getItem("userRole");

  const todayStr = new Date().toISOString().split("T")[0];
  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, "0");
  const currentMinutes = String(now.getMinutes()).padStart(2, "0");
  const currentTimeStr = `${currentHours}:${currentMinutes}`;

  useEffect(() => {
    fetch("https://barbershop-app-4lof.onrender.com//api/services")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setServices(data);
      });

    fetch("https://barbershop-app-4lof.onrender.com//api/barbers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBarbers(data);
          if (!preSelectedBarber && data.length > 0) {
            setBarberName(data[0].name);
          }
        }
      });
  }, [preSelectedBarber]);

  const handleOpenModal = (service: ServiceType) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (userRole === "admin" || userRole === "barber") {
      return;
    }
    setSelectedService(service);
    if (preSelectedBarber) {
      setBarberName(preSelectedBarber);
    } else if (barbers.length > 0 && !barberName) {
      setBarberName(barbers[0].name);
    }
    setMessage("");
    setError("");
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barberName || !date || !time) {
      setError("Bütün xanaları doldurun!");
      return;
    }
    setError("");
    setSelectedService(null);
    setIsPaymentOpen(true);
  };

  return (
    <div className="relative py-24 px-8 min-h-screen bg-gray-50 overflow-hidden">
      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-extrabold text-gray-900 tracking-tight">
            Bizim Xidmətlər
          </h2>
          <p className="text-gray-500 mt-4 text-lg max-w-2xl mx-auto">
            Sizə ən uyğun olan xidməti seçin və peşəkar ustalarımızın təqdim
            etdiyi premium təcrübədən zövq alın.
          </p>
          <div className="w-24 h-1.5 bg-linear-to-r from-amber-400 to-orange-500 mx-auto mt-6 rounded-full"></div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-10 md:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service) => (
            <TiltCard
              key={service.id}
              service={service}
              onOpenModal={handleOpenModal}
            />
          ))}
        </motion.div>
      </div>

      {selectedService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
          >
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Rezervasiya Et
            </h3>
            <p className="text-amber-600 font-semibold mb-6">
              {selectedService.name} - {selectedService.price}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Seçilmiş Bərbər
                </label>
                <select
                  value={barberName}
                  onChange={(e) => setBarberName(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                >
                  {barbers.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Tarix
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Saat
                </label>
                <input
                  type="time"
                  min={date === todayStr ? currentTimeStr : undefined}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-amber-700 transition-colors shadow-lg mt-4"
              >
                Ödənişə Keç ({selectedService.price})
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {isPaymentOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
          >
            <button
              onClick={() => setIsPaymentOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <CreditCard className="text-amber-500" /> Təhlükəsiz Ödəniş
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Kart məlumatlarınızı daxil edərək rezervasiyanı tamamlayın.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <Elements stripe={stripePromise}>
              <CheckoutForm
                selectedService={selectedService}
                barberName={barberName}
                date={date}
                time={time}
                onSuccess={() => {
                  setIsPaymentOpen(false);
                  setMessage("Rezervasiya və ödəniş uğurla tamamlandı!");
                  setTimeout(() => navigate("/dashboard"), 1500);
                }}
                onError={(msg) => setError(msg)}
              />
            </Elements>
          </motion.div>
        </div>
      )}

      {message && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Təbriklər!
            </h3>
            <p className="text-gray-500">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;