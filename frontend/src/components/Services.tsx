import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Scissors, ArrowRight, Clock, X, CheckCircle2 } from "lucide-react";
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

  const handleMouseMove = (e: React.MouseEvent) => {
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
      className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/40 flex flex-col items-center text-center group hover:shadow-2xl hover:border-amber-200 transition-all duration-300"
    >
      <div
        style={{ transform: "translateZ(50px)" }}
        className="flex flex-col items-center w-full grow"
      >
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:bg-amber-600 group-hover:text-white transition-colors">
          <Scissors className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full mb-3">
          {service.category}
        </span>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {service.name}
        </h3>
        <p className="text-gray-600 text-sm mb-6 grow">{service.description}</p>

        <div className="flex items-center justify-between w-full border-t border-gray-100 pt-4 mb-6">
          <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>{service.duration}</span>
          </div>
          <span className="text-xl font-black text-gray-900">
            {service.price}
          </span>
        </div>

        {userRole === "barber" || userRole === "admin" ? (
          <span className="w-full bg-gray-100 text-gray-400 font-semibold py-3 px-6 rounded-xl text-sm">
            Bərbər hesabı ilə rezervasiya edilə bilməz
          </span>
        ) : (
          <button
            onClick={() => onOpenModal(service)}
            className="w-full bg-gray-900 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-amber-500 transition-colors shadow-lg flex items-center justify-center gap-2 group/btn"
          >
            <span>Rezervasiya Et</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// 💳 Stripe Kart Ödəniş Forması (Həmişə <Elements> daxilində işləyəcək)
const CardCheckoutForm: React.FC<{
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
        "https://barbershop-app-4lof.onrender.com/create-payment-intent",
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
        const apptRes = await fetch("https://barbershop-app-4lof.onrender.com/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            barberName,
            customer: customerName,
            phone: customerPhone,
            date,
            time,
            service: selectedService?.name,
            paymentMethod: "Kart",
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
      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
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
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole = localStorage.getItem("userRole");
  const customerName = localStorage.getItem("userName") || "Müştəri";
  const customerPhone = localStorage.getItem("userPhone") || "";

  useEffect(() => {
    fetch("https://barbershop-app-4lof.onrender.com/services")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setServices(data);
      });

    fetch("https://barbershop-app-4lof.onrender.com/barbers")
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

  // Nağd ödənişin birbaşa bazaya yazılması
  const handleCashBooking = async () => {
    try {
      const res = await fetch("https://barbershop-app-4lof.onrender.com/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberName,
          customer: customerName,
          phone: customerPhone,
          date,
          time,
          service: selectedService?.name,
          paymentMethod: "Nağd",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rezervasiya xətası");

      setIsPaymentOpen(false);
      setMessage("Rezervasiya uğurla tamamlandı! (Salonda ödəniş)");
      setTimeout(() => navigate("/dashboard"), 1500);
   } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Naməlum xəta baş verdi");
      }
   }
  }
  const todayStr = new Date().toISOString().split("T")[0];
  const now = new Date();
  const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-20"
      >
        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
          Bizim Xidmətlər
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Sizə ən uyğun olan xidməti seçin və peşəkar ustalarımızın təqdim
          etdiyi premium təcrübədən zövq alın.
        </p>
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

      {/* 📅 Rezervasiya Məlumat Modalı */}
      {selectedService && !isPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
          >
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Rezervasiya Et
            </h3>
            <p className="text-amber-600 font-semibold mb-6">
              {selectedService.name} ({selectedService.price})
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bərbər Seçin
                </label>
                <select
                  value={barberName}
                  onChange={(e) => setBarberName(e.target.value)}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                >
                  {barbers.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tarix
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Saat
                </label>
                <input
                  type="time"
                  min={date === todayStr ? currentTimeStr : undefined}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ödəniş Növü
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                    />
                    <span>💳 Kart (Stripe)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "cash"}
                      onChange={() => setPaymentMethod("cash")}
                    />
                    <span>💵 Nağd (Salonda)</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-amber-700 transition-colors shadow-lg mt-4"
              >
                {paymentMethod === "card"
                  ? `Ödənişə Keç (${selectedService.price})`
                  : "Rezervasiyanı Təsdiqlə (Nağd)"}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* 💳 Ödəniş Modalı (Kart və ya Nağd) */}
      {isPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
          >
            <button
              onClick={() => setIsPaymentOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {paymentMethod === "card"
                ? "Ödəniş Təsdiqi"
                : "Nağd Ödəniş Təsdiqi"}
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Seçilmiş xidmət:{" "}
              <span className="font-bold text-gray-900">
                {selectedService?.name}
              </span>
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {paymentMethod === "card" ? (
              <Elements stripe={stripePromise}>
                <CardCheckoutForm
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
            ) : (
              <div>
                <p className="text-gray-600 mb-6 text-sm">
                  Ödənişi salonumuzda xidmət bitdikdən sonra nağd şəkildə həyata
                  keçirəcəksiniz.
                </p>
                <button
                  onClick={handleCashBooking}
                  className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-colors shadow-lg"
                >
                  Rezervasiyanı Tamamla (Nağd)
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* ✅ Uğurlu Mesaj Modalı */}
      {message && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Təbriklər!
            </h3>
            <p className="text-gray-600 font-medium">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;