import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Wallet,
  CalendarCheck,
  Users,
  Clock,
  Plus,
  CalendarOff,
  Phone,
  Calendar,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";

const API_URL = "https://barbershop-app-4lof.onrender.com";

interface Appointment {
  id: number;
  barberName: string;
  customer: string;
  phone: string;
  date: string;
  time: string;
  service: string;
  status: string;
}

interface Service {
  id: number;
  name: string;
  price: string;
  duration: string;
  description: string;
}

interface Barber {
  id: number;
  name: string;
  role: string;
  experience: string;
  specialty: string;
  image: string;
}

const Admin: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);

  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState("");
  const [newServiceDesc, setNewServiceDesc] = useState("");

  const [newBarberName, setNewBarberName] = useState("");
  const [newBarberRole, setNewBarberRole] = useState("Stilist");
  const [newBarberExp, setNewBarberExp] = useState("3 il təcrübə");
  const [newBarberSpecialty, setNewBarberSpecialty] = useState("Modern Kəsim");
  const [barberImageFile, setBarberImageFile] = useState<File | null>(null);

  const [offBarberName, setOffBarberName] = useState("");
  const [offDate, setOffDate] = useState("");
  const [offMessage, setOffMessage] = useState("");

  const [modalMessage, setModalMessage] = useState<{
    title: string;
    text: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "service" | "barber";
    id: number;
    name: string;
  } | null>(null);

  const userRole = localStorage.getItem("userRole");
  const currentUserName = localStorage.getItem("userName");

  // 🚀 OPTİMİZASİYA 1: Sonsuz döngünün qarşısı alındı (Asılılıq massivi boşaldıldı)
  const loadData = useCallback(() => {
    fetch(`${API_URL}/api/appointments`)
      .then((res) => res.json())
      .then((data) => {
        setAppointments(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        setAppointments([]);
      });

    fetch(`${API_URL}/api/services`)
      .then((res) => res.json())
      .then((data) => {
        setServices(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        setServices([]);
      });

    fetch(`${API_URL}/api/barbers`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBarbers(data);
          // offBarberName yalnız ilk dəfə və ya boş olduqda təyin edilir
          setOffBarberName((prev) =>
            prev ? prev : data.length > 0 ? data[0].name : "",
          );
        } else {
          setBarbers([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setBarbers([]);
      });
  }, []); // <-- Boş massiv! Artıq API-lər sadəcə 1 dəfə yüklənəcək.

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API_URL}/api/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newServiceName,
        price: newServicePrice,
        duration: newServiceDuration,
        category: "Saç Kəsimləri",
        description: newServiceDesc,
      }),
    });
    setModalMessage({ title: "Uğurlu!", text: "Xidmət uğurla əlavə olundu!" });
    setNewServiceName("");
    setNewServicePrice("");
    setNewServiceDuration("");
    setNewServiceDesc("");
    loadData();
  };

  const handleAddBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", newBarberName);
    formData.append("role", newBarberRole);
    formData.append("experience", newBarberExp);
    formData.append("rating", "5.0");
    formData.append("specialty", newBarberSpecialty);
    if (barberImageFile) {
      formData.append("image", barberImageFile);
    }

    const res = await fetch(`${API_URL}/api/barbers`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      setModalMessage({
        title: "Təbriklər!",
        text: "Bərbər və şəkli uğurla əlavə olundu!",
      });
      setNewBarberName("");
      setBarberImageFile(null);
      loadData();
    } else {
      setModalMessage({
        title: "Xəta!",
        text: "Bərbər əlavə edilərkən xəta baş verdi.",
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const url =
      deleteTarget.type === "service"
        ? `${API_URL}/api/services/${deleteTarget.id}`
        : `${API_URL}/api/barbers/${deleteTarget.id}`;

    const res = await fetch(url, { method: "DELETE" });
    if (res.ok) {
      setDeleteTarget(null);
      setModalMessage({
        title: "Silindi",
        text: `${deleteTarget.type === "service" ? "Xidmət" : "Bərbər"} uğurla silindi.`,
      });
      loadData();
    } else {
      setDeleteTarget(null);
      setModalMessage({
        title: "Xəta",
        text: "Silinmə zamanı xəta baş verdi.",
      });
    }
  };

  // 🚀 OPTİMİZASİYA 2: Ağ ekranın (çökmənin) qarşısını alan təhlükəsiz massiv yoxlanışı
  const safeAppointments = appointments || [];
  const safeServices = services || [];

  const myAppointments =
    userRole === "admin"
      ? safeAppointments
      : safeAppointments.filter((app) => app.barberName === currentUserName);

  const todayStr = new Date().toISOString().split("T")[0];
  const currentMonthStr = todayStr.substring(0, 7);

  let dailyRevenue = 0;
  let monthlyRevenue = 0;

  myAppointments.forEach((app) => {
    const s = safeServices.find((serv) => serv.name === app.service);
    const priceNum = s ? parseFloat(s.price.replace(/[^\d.]/g, "")) || 0 : 15;

    if (app.date === todayStr) {
      dailyRevenue += priceNum;
    }
    if (app.date && app.date.startsWith(currentMonthStr)) {
      monthlyRevenue += priceNum;
    }
  });

  const todayAppointmentsCount = myAppointments.filter(
    (app) => app.date === todayStr,
  ).length;

  const getGoogleCalendarUrl = (app: Appointment) => {
    const title = encodeURIComponent(
      `Deluxe BarberShop: ${app.service} (${app.barberName})`,
    );
    const details = encodeURIComponent(
      `Müştəri: ${app.customer}, Telefon: ${app.phone}`,
    );

    const [year, month, day] = app.date.split("-");
    const [hours, minutes] = app.time.split(":");

    const startDate = new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hours) - 4,
        Number(minutes),
      ),
    );
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const formatIso = (date: Date) =>
      date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const datesParam = `${formatIso(startDate)}/${formatIso(endDate)}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}`;
  };

  return (
    <div className="py-24 px-4 sm:px-8 max-w-7xl mx-auto min-h-screen bg-gray-50/50 relative">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          İdarəetmə Paneli
        </h2>
        <p className="text-gray-500 mt-2 text-lg">
          Xoş gəldiniz,{" "}
          <span className="font-bold text-amber-600">{currentUserName}</span>!
        </p>
        <div className="w-20 h-1 bg-linrar-to-r from-amber-400 to-orange-500 mt-4 rounded-full"></div>
      </motion.div>

      {/* Statistika Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-linear-to-r from-green-500 to-emerald-700 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden"
        >
          <div className="absolute right-4 top-4 opacity-10">
            <TrendingUp size={80} />
          </div>
          <TrendingUp size={36} className="mb-4 text-green-200" />
          <h3 className="text-sm font-semibold tracking-wide uppercase opacity-90">
            Aylıq Ümumi Gəlir
          </h3>
          <p className="text-4xl font-extrabold mt-2">{monthlyRevenue} AZN</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-linear-to-r from-teal-500 to-cyan-700 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden"
        >
          <div className="absolute right-4 top-4 opacity-10">
            <Wallet size={80} />
          </div>
          <Wallet size={36} className="mb-4 text-teal-200" />
          <h3 className="text-sm font-semibold tracking-wide uppercase opacity-90">
            Günlük Gəlir
          </h3>
          <p className="text-4xl font-extrabold mt-2">{dailyRevenue} AZN</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-linear-to-r from-blue-600 to-indigo-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden"
        >
          <div className="absolute right-4 top-4 opacity-10">
            <CalendarCheck size={80} />
          </div>
          <CalendarCheck size={36} className="mb-4 text-blue-200" />
          <h3 className="text-sm font-semibold tracking-wide uppercase opacity-90">
            Aktiv Rezervasiyalar
          </h3>
          <p className="text-4xl font-extrabold mt-2">
            {myAppointments.length} sifariş
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-linear-to-r from-purple-600 to-fuchsia-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden"
        >
          <div className="absolute right-4 top-4 opacity-10">
            <Users size={80} />
          </div>
          <Users size={36} className="mb-4 text-purple-200" />
          <h3 className="text-sm font-semibold tracking-wide uppercase opacity-90">
            Bu Gün
          </h3>
          <p className="text-4xl font-extrabold mt-2">
            Müştəri: {todayAppointmentsCount}
          </p>
        </motion.div>
      </div>

      {userRole === "admin" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Xidmətlər və Silmə */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100/80 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                <div className="p-2.5 bg-amber-100 text-amber-600 rounded-2xl">
                  <Plus size={22} />
                </div>
                Xidmətlər
              </h3>
              <form onSubmit={handleAddService} className="space-y-4 mb-6">
                <input
                  type="text"
                  placeholder="Xidmət adı"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Qiymət (məs: 20 AZN)"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Müddət (məs: 30 dəq)"
                  value={newServiceDuration}
                  onChange={(e) => setNewServiceDuration(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Açıqlama"
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-amber-500 transition-colors shadow-lg text-sm"
                >
                  Xidmət Əlavə Et
                </button>
              </form>
            </div>
            <div className="border-t pt-4 max-h-48 overflow-y-auto space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Mövcud Xidmətlər
              </h4>
              {services.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl text-sm"
                >
                  <span className="font-semibold text-gray-800">
                    {s.name} ({s.price})
                  </span>
                  <button
                    onClick={() =>
                      setDeleteTarget({
                        type: "service",
                        id: s.id,
                        name: s.name,
                      })
                    }
                    className="text-red-500 hover:text-red-700 p-1.5 bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100/80 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                <div className="p-2.5 bg-amber-100 text-amber-600 rounded-2xl">
                  <Plus size={22} />
                </div>
                Bərbərlər
              </h3>
              <form onSubmit={handleAddBarber} className="space-y-4 mb-6">
                <input
                  type="text"
                  placeholder="Bərbərin Adı"
                  value={newBarberName}
                  onChange={(e) => setNewBarberName(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Vəzifə (məs: Stilist)"
                  value={newBarberRole}
                  onChange={(e) => setNewBarberRole(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Təcrübə (məs: 5 il)"
                  value={newBarberExp}
                  onChange={(e) => setNewBarberExp(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Mütəxəssislik"
                  value={newBarberSpecialty}
                  onChange={(e) => setNewBarberSpecialty(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm"
                  required
                />

                <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                  <ImageIcon size={18} className="text-gray-400 shrink-0" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files && setBarberImageFile(e.target.files[0])
                    }
                    className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-amber-500 file:text-white cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-amber-500 transition-colors shadow-lg text-sm"
                >
                  Bərbər Əlavə Et
                </button>
              </form>
            </div>
            <div className="border-t pt-4 max-h-48 overflow-y-auto space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Mövcud Bərbərlər
              </h4>
              {barbers.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl text-sm"
                >
                  <span className="font-semibold text-gray-800">{b.name}</span>
                  <button
                    onClick={() =>
                      setDeleteTarget({
                        type: "barber",
                        id: b.id,
                        name: b.name,
                      })
                    }
                    className="text-red-500 hover:text-red-700 p-1.5 bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100/80">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900">
              <div className="p-2.5 bg-amber-100 text-amber-600 rounded-2xl">
                <CalendarOff size={22} />
              </div>
              İstirahət Günü Təyin Et
            </h3>
            {offMessage && (
              <div className="mb-4 p-4 bg-green-50 text-green-700 text-sm font-semibold rounded-2xl">
                {offMessage}
              </div>
            )}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setOffMessage("");
                const res = await fetch(`${API_URL}/api/barber-off-days`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    barberName: offBarberName,
                    offDate,
                  }),
                });
                const data = await res.json();
                setOffMessage(data.message);
              }}
              className="space-y-4"
            >
              <select
                value={offBarberName}
                onChange={(e) => setOffBarberName(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-amber-500 font-medium"
              >
                {barbers.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={offDate}
                onChange={(e) => setOffDate(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-amber-500 font-medium"
                required
              />
              <button
                type="submit"
                className="w-full bg-amber-600 text-white py-4 rounded-2xl font-bold hover:bg-amber-700 transition-colors shadow-lg"
              >
                Tətil Gününü Qeyd Et
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100/80 overflow-hidden">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Clock size={24} />
          </div>
          Rezervasiya Siyahısı
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-5 font-bold">#</th>
                <th className="p-5 font-bold">Müştəri</th>
                {userRole === "admin" && (
                  <th className="p-5 font-bold">Bərbər</th>
                )}
                <th className="p-5 font-bold">Tarix & Saat</th>
                <th className="p-5 font-bold">Xidmət</th>
                <th className="p-5 font-bold">Google Təqvim</th>
                <th className="p-5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {myAppointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-10 text-gray-400 font-normal"
                  >
                    Hələ ki aktiv rezervasiya yoxdur.
                  </td>
                </tr>
              ) : (
                myAppointments.map((app, index) => (
                  <tr
                    key={app.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="p-5 text-gray-400 font-bold">{index + 1}</td>
                    <td className="p-5">
                      <div className="font-bold text-gray-900 text-base">
                        {app.customer}
                      </div>
                      <a
                        href={`tel:${app.phone}`}
                        className="inline-flex items-center gap-1.5 text-xs text-amber-600 font-semibold hover:underline mt-1 bg-amber-50 px-2.5 py-1 rounded-full w-fit"
                      >
                        <Phone size={12} /> {app.phone || "Nömrə yoxdur"}
                      </a>
                    </td>
                    {userRole === "admin" && (
                      <td className="p-5 text-amber-600 font-bold">
                        {app.barberName}
                      </td>
                    )}
                    <td className="p-5 text-gray-600">
                      {app.date}
                      <span className="bg-blue-50 text-blue-700 py-1.5 px-3 rounded-xl font-bold text-sm ml-2 border border-blue-100">
                        {app.time}
                      </span>
                    </td>
                    <td className="p-5 text-gray-800 font-semibold">
                      {app.service}
                    </td>
                    <td className="p-5">
                      <a
                        href={getGoogleCalendarUrl(app)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        <Calendar size={14} /> Təqvimə At
                      </a>
                    </td>
                    <td className="p-5">
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 py-1.5 px-4 rounded-full font-bold text-xs uppercase tracking-wider">
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {modalMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl relative"
            >
              <button
                onClick={() => setModalMessage(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
              >
                <X size={22} />
              </button>
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {modalMessage.title}
              </h3>
              <p className="text-gray-600 font-medium mb-6">
                {modalMessage.text}
              </p>
              <button
                onClick={() => setModalMessage(null)}
                className="w-full bg-gray-900 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-amber-500 transition-colors shadow-lg"
              >
                Oldu
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl relative"
            >
              <button
                onClick={() => setDeleteTarget(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
              >
                <X size={22} />
              </button>
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <AlertTriangle size={36} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Silməni Təsdiq Et
              </h3>
              <p className="text-gray-600 font-medium mb-6 text-sm sm:text-base">
                <span className="font-bold text-gray-900">
                  "{deleteTarget.name}"
                </span>{" "}
                adlı {deleteTarget.type === "service" ? "xidməti" : "bərbəri"}{" "}
                silmək istədiyinizə əminsiniz?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="w-1/2 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Ləğv Et
                </button>
                <button
                  onClick={confirmDelete}
                  className="w-1/2 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors shadow-lg"
                >
                  Bəli, Sil
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;