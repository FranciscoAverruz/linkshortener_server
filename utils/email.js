const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // rejectUnauthorized: process.env.NODE_ENV === "development",
    rejectUnauthorized: false,
  },
});

/**
 * Envía un correo electrónico usando una plantilla HTML.
 * @param {string} to - Dirección de correo del destinatario.
 * @param {string} subject - Asunto del correo.
 * @param {string} templatePath - Ruta a la plantilla HTML.
 * @param {object} replacements - Objeto con valores a reemplazar en la plantilla.
 */
async function sendEmail(to, subject, templatePath, replacements) {
  try {
    let template = fs.readFileSync(path.resolve(templatePath), "utf-8");

    for (const key in replacements) {
      template = template.replace(`{{${key}}}`, replacements[key]);
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: template,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Could not send email.");
  }
}

module.exports = { sendEmail };