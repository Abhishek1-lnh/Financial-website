const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.sendSMSOTP = async (phoneNumber, otp) => {
  try {
    const message = await client.messages.create({
      body: `Your verification code is: ${otp}. Valid for 5 minutes. Do not share with anyone.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    
    console.log(`✅ SMS sent to ${phoneNumber}`);
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error('❌ SMS Error:', error.message);
    return { success: false, error: error.message };
  }
};

exports.sendWhatsAppOTP = async (phoneNumber, otp) => {
  try {
    const message = await client.messages.create({
      body: `Your verification code is: ${otp}\n\nValid for 5 minutes.`,
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${phoneNumber}`
    });
    
    console.log(`✅ WhatsApp sent to ${phoneNumber}`);
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error('❌ WhatsApp Error:', error.message);
    return { success: false, error: error.message };
  }
};