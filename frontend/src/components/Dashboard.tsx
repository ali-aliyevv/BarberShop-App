import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Scissors, User, Calendar } from 'lucide-react';

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
  const currentUserName = localStorage.getItem('userName') || '';

  useEffect(() => {
    fetch('https://barbershop-app-4lof.onrender.com//api/appointments')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const myAppts = data.filter(app => app.customer === currentUserName);
          setAppointments(myAppts);
        }
      })
      .catch(err => console.error(err));
  }, [currentUserName]);

  const getGoogleCalendarUrl = (app: Appointment) => {
    const title = encodeURIComponent(`Deluxe BarberShop: ${app.service} (${app.barberName})`);
    const details = encodeURIComponent(`Bərbər: ${app.barberName}, Xidmət: ${app.service}`);
    
    const [year, month, day] = app.date.split('-');
    const [hours, minutes] = app.time.split(':');
    
    const startDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hours) - 4, Number(minutes)));
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const formatIso = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const datesParam = `${formatIso(startDate)}/${formatIso(endDate)}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}`;
  };

  return (
    <div className="py-24 px-8 max-w-6xl mx-auto min-h-screen bg-gray-50/50">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Müştəri Kabineti</h2>
        <p className="text-gray-500 mt-2 text-lg">Xoş gəldiniz, <span className="font-bold text-amber-600">{currentUserName}</span>!</p>
        <div className="w-20 h-1 bg-linear-to-r from-amber-400 to-orange-500 mt-4 rounded-full"></div>
      </motion.div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100/80 overflow-hidden">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl"><CalendarCheck size={24} /></div> 
          Mənim Rezervasiyalarım
        </h3>

        {appointments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">Hələ ki aktiv rezervasiyanız yoxdur.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {appointments.map((app) => (
              <motion.div 
                key={app.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-50/80 p-6 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                      {app.status}
                    </span>
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
                      {app.date} | {app.time}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Scissors size={18} className="text-amber-500" /> {app.service}
                  </h4>

                  <p className="text-gray-600 text-sm mb-4 flex items-center gap-2">
                    <User size={16} className="text-gray-400" /> Usta: <span className="font-semibold text-gray-800">{app.barberName}</span>
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200/60 mt-auto">
                  <a 
                    href={getGoogleCalendarUrl(app)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 px-4 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Calendar size={16} /> Google Təqvimə Əlavə Et
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;