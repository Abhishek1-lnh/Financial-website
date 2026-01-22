const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendEmailOTP = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"Financial Services" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .otp-box { background: #f0f0f0; padding: 20px; text-align: center; border-radius: 10px; }
            .otp { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Verify Your Email</h2>
            <p>Your verification code is:</p>
            <div class="otp-box">
              <div class="otp">${otp}</div>
            </div>
            <p>This code will expire in 5 minutes.</p>
            <p style="color: #dc2626;">⚠️ Do not share this code with anyone.</p>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${email}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email Error:', error.message);
    return { success: false, error: error.message };
  }
};