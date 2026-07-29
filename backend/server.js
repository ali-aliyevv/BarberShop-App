require('dotenv').config();
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

// Uploads qovluğu yoxdursa yaradılır və statik edilir
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage: storage });

const db = new sqlite3.Database("./barber.db", (err) => {
  if (err) console.error("Bazaya qoşularkən xəta:", err.message);
  else console.log("SQLite məlumat bazasına uğurla qoşuldu.");
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "deluxebarbershopoffical@gmail.com",
    pass: "whfyzujaqbwrzmcv",
  },
  tls: { rejectUnauthorized: false },
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    duration TEXT,
    price TEXT,
    description TEXT,
    category TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS barbers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    role TEXT,
    experience TEXT,
    rating TEXT,
    specialty TEXT,
    image TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS barber_off_days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    barberName TEXT,
    offDate TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    barberName TEXT,
    customer TEXT,
    phone TEXT,
    date TEXT,
    time TEXT,
    service TEXT,
    status TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS otps (
    email TEXT,
    code TEXT
  )`);

  db.get(
    `SELECT * FROM users WHERE email = ?`,
    ["admin@deluxe.com"],
    (err, row) => {
      if (!row) {
        db.run(
          `INSERT INTO users (name, phone, email, password, role) VALUES (?, ?, ?, ?, ?)`,
          [
            "Baş Admin",
            "+994500000000",
            "admin@deluxe.com",
            "admin123",
            "admin",
          ],
        );
      }
    },
  );

  db.get(
    `SELECT * FROM users WHERE email = ?`,
    ["elish@deluxe.com"],
    (err, row) => {
      if (!row) {
        db.run(
          `INSERT INTO users (name, phone, email, password, role) VALUES (?, ?, ?, ?, ?)`,
          [
            "Bərbər Elşən",
            "+994501111111",
            "elish@deluxe.com",
            "barber123",
            "barber",
          ],
        );
      }
    },
  );

  db.get(`SELECT COUNT(*) as count FROM barbers`, [], (err, row) => {
    if (row && row.count === 0) {
      db.run(
        `INSERT INTO barbers (name, role, experience, rating, specialty, image) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          "Bərbər Elşən",
          "Baş Usta & Stilist",
          "8 il təcrübə",
          "4.9",
          "Modern Fade və Kral Təraşı",
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500",
        ],
      );
      db.run(
        `INSERT INTO barbers (name, role, experience, rating, specialty, image) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          "Bərbər Anar",
          "Top Stilist",
          "5 il təcrübə",
          "4.8",
          "Klassik Kəsim və Saqqal Dizaynı",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=500",
        ],
      );
    }
  });

  db.get(`SELECT COUNT(*) as count FROM services`, [], (err, row) => {
    if (row && row.count === 0) {
      db.run(
        `INSERT INTO services (name, duration, price, description, category) VALUES (?, ?, ?, ?, ?)`,
        [
          "Klassik Saç Kəsimi",
          "30 dəq",
          "15 AZN",
          "Tərzinizə uyğun standart və səliqəli saç kəsimi.",
          "Saç Kəsimləri",
        ],
      );
      db.run(
        `INSERT INTO services (name, duration, price, description, category) VALUES (?, ?, ?, ?, ?)`,
        [
          "Saqqal Forması",
          "20 dəq",
          "10 AZN",
          "Üz quruluşunuza uyğun ideal saqqal dizaynı.",
          "Üz və Saqqal Baxımı",
        ],
      );
    }
  });
});

function parseDurationToMinutes(durationStr) {
  if (!durationStr) return 30;
  let totalMinutes = 0;
  const hourMatch = durationStr.match(/(\d+)\s*saat/);
  const minMatch = durationStr.match(/(\d+)\s*dəq/);
  if (hourMatch) totalMinutes += parseInt(hourMatch[1], 10) * 60;
  if (minMatch) totalMinutes += parseInt(minMatch[1], 10);
  return totalMinutes > 0 ? totalMinutes : 30;
}

function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}


app.post("/api/create-payment-intent", async (req, res) => {
  const { amount } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "azn",
      payment_method_types: ["card"],
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;
  const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

  db.run(`DELETE FROM otps WHERE email = ?`, [email], async () => {
    db.run(
      `INSERT INTO otps (email, code) VALUES (?, ?)`,
      [email, otpCode],
      async (err) => {
        if (err) return res.status(500).json({ error: "Xəta baş verdi" });

        try {
          await transporter.sendMail({
            from: "Deluxe BarberShop <deluxebarbershopoffical@gmail.com>",
            to: email,
            subject: "Qeydiyyat Təsdiq Kodu (OTP)",
            text: `Deluxe BarberShop üçün təsdiq kodunuz: ${otpCode}`,
          });
          res.json({ message: "OTP kod e-poçtunuza uğurla göndərildi!" });
        } catch (mailErr) {
          res
            .status(500)
            .json({ error: "Mail göndərilə bilmədi.", debugCode: otpCode });
        }
      },
    );
  });
});

app.post("/api/signup", (req, res) => {
  const { name, phone, email, password, otp } = req.body;
  db.get(
    `SELECT * FROM otps WHERE email = ? AND code = ?`,
    [email, otp],
    (err, row) => {
      if (!row)
        return res
          .status(400)
          .json({ error: "OTP kod yanlışdır və ya vaxtı bitib!" });

      const role = "client";
      db.run(
        `INSERT INTO users (name, phone, email, password, role) VALUES (?, ?, ?, ?, ?)`,
        [name, phone, email, password, role],
        function (err) {
          if (err)
            return res
              .status(400)
              .json({ error: "Bu e-poçt artıq qeydiyyatdan keçib!" });
          db.run(`DELETE FROM otps WHERE email = ?`, [email]);
          res.json({
            message: "Uğurla qeydiyyatdan keçdiniz!",
            userId: this.lastID,
            role,
            name,
            phone,
          });
        },
      );
    },
  );
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  db.get(
    `SELECT * FROM users WHERE email = ? AND password = ?`,
    [email, password],
    (err, user) => {
      if (!user)
        return res.status(400).json({ error: "E-poçt və ya şifrə yanlışdır!" });
      res.json({
        message: "Uğurla daxil oldunuz!",
        role: user.role,
        name: user.name,
        phone: user.phone,
      });
    },
  );
});

app.get("/api/services", (req, res) => {
  db.all(`SELECT * FROM services`, [], (err, rows) => res.json(rows));
});

app.post("/api/services", (req, res) => {
  const { name, duration, price, description, category } = req.body;
  db.run(
    `INSERT INTO services (name, duration, price, description, category) VALUES (?, ?, ?, ?, ?)`,
    [name, duration, price, description, category],
    function (err) {
      res.json({ message: "Xidmət əlavə olundu", id: this.lastID });
    },
  );
});

app.delete("/api/services/:id", (req, res) => {
  db.run(`DELETE FROM services WHERE id = ?`, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Xəta baş verdi" });
    res.json({ message: "Xidmət uğurla silindi" });
  });
});

app.get("/api/barbers", (req, res) => {
  db.all(`SELECT * FROM barbers`, [], (err, rows) => res.json(rows));
});

app.post("/api/barbers", upload.single("image"), (req, res) => {
  const { name, role, experience, rating, specialty } = req.body;
  const image = req.file
    ? `https://barbershop-app-4lof.onrender.com/uploads/${req.file.filename}`
    : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500";

  db.run(
    `INSERT INTO barbers (name, role, experience, rating, specialty, image) VALUES (?, ?, ?, ?, ?, ?)`,
    [name, role, experience, rating || "5.0", specialty, image],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Bərbər əlavə olundu", id: this.lastID });
    },
  );
});

app.delete("/api/barbers/:id", (req, res) => {
  db.run(`DELETE FROM barbers WHERE id = ?`, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Xəta baş verdi" });
    res.json({ message: "Bərbər uğurla silindi" });
  });
});

app.get("/api/barber-off-days", (req, res) => {
  db.all(`SELECT * FROM barber_off_days`, [], (err, rows) => res.json(rows));
});

app.post("/api/barber-off-days", (req, res) => {
  const { barberName, offDate } = req.body;
  db.run(
    `INSERT INTO barber_off_days (barberName, offDate) VALUES (?, ?)`,
    [barberName, offDate],
    function (err) {
      res.json({ message: "İstirahət günü qeyd edildi", id: this.lastID });
    },
  );
});

app.get("/api/appointments", (req, res) => {
  db.all(`SELECT * FROM appointments`, [], (err, rows) => res.json(rows));
});

app.post("/api/appointments", (req, res) => {
  const { barberName, customer, phone, date, time, service } = req.body;
  const status = "Gözləyir";

  db.get(
    `SELECT * FROM barber_off_days WHERE barberName = ? AND offDate = ?`,
    [barberName, date],
    (err, offRow) => {
      if (offRow) {
        return res
          .status(400)
          .json({
            error: `${barberName} seçilmiş tarixdə istirahətdədir (işləmir)!`,
          });
      }

      db.get(
        `SELECT duration FROM services WHERE name = ?`,
        [service],
        (err, serviceRow) => {
          const durationStr = serviceRow ? serviceRow.duration : "30 dəq";
          const serviceMinutes = parseDurationToMinutes(durationStr);
          const totalBlockMinutes = serviceMinutes + 15;

          const newStartMin = timeToMinutes(time);
          const newEndMin = newStartMin + totalBlockMinutes;

          db.all(
            `SELECT id, customer, time, service FROM appointments WHERE barberName = ? AND date = ?`,
            [barberName, date],
            async (err, existingAppts) => {
              let existingAppointmentIdToReplace = null;

              for (let appt of existingAppts) {
                if (appt.customer === customer) {
                  existingAppointmentIdToReplace = appt.id;
                  continue;
                }

                const sRow = await new Promise((resolve) => {
                  db.get(
                    `SELECT duration FROM services WHERE name = ?`,
                    [appt.service],
                    (e, r) => resolve(r),
                  );
                });
                const existingDuration = parseDurationToMinutes(
                  sRow ? sRow.duration : "30 dəq",
                );
                const existingBlockMinutes = existingDuration + 15;

                const existingStartMin = timeToMinutes(appt.time);
                const existingEndMin = existingStartMin + existingBlockMinutes;

                if (
                  newStartMin < existingEndMin &&
                  newEndMin > existingStartMin
                ) {
                  return res.status(400).json({
                    error: `Seçdiyiniz saat məşğuldur! Fasilə səbəbilə bu aralıq doludur (${minutesToTime(existingStartMin)} - ${minutesToTime(existingEndMin)}).`,
                  });
                }
              }

              const proceedWithSave = () => {
                const query = `INSERT INTO appointments (barberName, customer, phone, date, time, service, status) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                db.run(
                  query,
                  [
                    barberName,
                    customer,
                    phone || "",
                    date,
                    time,
                    service,
                    status,
                  ],
                  function (err) {
                    if (err)
                      return res.status(500).json({ error: err.message });
                    res.json({
                      message: "Rezervasiya uğurla tamamlandı!",
                      id: this.lastID,
                    });
                  },
                );
              };

              if (existingAppointmentIdToReplace) {
                db.run(
                  `DELETE FROM appointments WHERE id = ?`,
                  [existingAppointmentIdToReplace],
                  (err) => {
                    if (err)
                      return res.status(500).json({ error: err.message });
                    proceedWithSave();
                  },
                );
              } else {
                proceedWithSave();
              }
            },
          );
        },
      );
    },
  );
});

app.listen(PORT, () => {
  console.log(`Backend serveri http://localhost:${PORT} ünvanında işləyir.`);
});