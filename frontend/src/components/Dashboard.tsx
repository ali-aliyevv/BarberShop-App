import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Scissors, User, Calendar } from "lucide-react";

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

const Dashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const currentUserName =
    localStorage.getItem("userName")?.trim().toLowerCase() || "";

  useEffect(() => {
    fetch("http://localhost:5000/api/appointments")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const myAppts = data.filter(
            (app) => app.customer?.trim().toLowerCase() === currentUserName,
          );
          setAppointments(myAppts);
        }
      })
      .catch((err) => console.error(err));
  }, [currentUserName]);

  const getGoogleCalendarUrl = (app: Appointment) => {
    const title = encodeURIComponent(
      `Deluxe BarberShop: ${app.service} (${app.barberName})`,
    );
    const details = encodeURIComponent(
      `Bərbər: ${app.barberName}, Xidmət: ${app.service}`,
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
    <div className="max-w-7xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-black text-gray-900 mb-2">
          Müştəri Kabineti
        </h1>
        <p className="text-gray-600 font-medium">
          Xoş gəldiniz,{" "}
          <span className="text-amber-600 font-bold">
            {localStorage.getItem("userName")}
          </span>
          !
        </p>
      </motion.div>

      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <CalendarCheck className="w-7 h-7 text-amber-600" />
          <span>Mənim Rezervasiyalarım</span>
        </h2>

        {appointments.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-medium">
            Hələ ki aktiv rezervasiyanız yoxdur. Xidmətlər səhifəsindən randevu
            ala bilərsiniz.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-50 border border-gray-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
                      {app.status}
                    </span>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900 bg-white px-3 py-1 rounded-xl shadow-xs">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span>
                        {app.date} | {app.time}
                      </span>
                    </div>
                  </div>

                  {/* ✂️ Xidmət Adı Burada Açıq Şəkildə Görүнür */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-amber-600" />
                    <span>{app.service}</span>
                  </h3>

                  <p className="text-gray-600 text-sm mb-6 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>
                      Usta:{" "}
                      <strong className="text-gray-900">
                        {app.barberName}
                      </strong>
                    </span>
                  </p>
                </div>

                <a
                  href={getGoogleCalendarUrl(app)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2 text-sm"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Google Təqvimə Əlavə Et</span>
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;