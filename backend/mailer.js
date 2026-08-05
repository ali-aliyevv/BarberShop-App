const axios = require("axios");

const sendOTP = async (userEmail, otpCode) => {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: "Deluxe Barbershop",
          email: "deluxebarberoffical@gmail.com"
        },
        to: [
          {
            email: userEmail
          }
        ],
        subject: "Deluxe Barbershop - Qeydiyyat Təsdiq Kodu",
        htmlContent: `<html>
                        <body>
                          <h2>Sizin OTP kodunuz: <strong>${otpCode}</strong></h2>
                          <p>Bu kodu heç kimlə paylaşmayın.</p>
                        </body>
                      </html>`
      },
      {
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        }
      }
    );
    console.log(`✅ OTP maili uğurla göndərildi: ${userEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Mail göndərilərkən xəta:", error.response ? error.response.data : error.message);
    return false;
  }
};

module.exports = { sendOTP };