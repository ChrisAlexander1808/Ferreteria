const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER, // tu correo (ej: gchristofer18@gmail.com)
    pass: process.env.MAIL_PASS  // contraseña de aplicación de Gmail
  }
});

exports.sendConfirmationEmail = async (to, token, empresaNombre) => {
  const confirmUrl = `${process.env.BACKEND_URL}/api/confirmar/${token}`;

  const mailOptions = {
    from: `"${empresaNombre}" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Confirma tu correo para activar tu empresa',
    html: `
      <h2>¡Hola!</h2>
      <p>Gracias por registrarte en nuestro sistema.</p>
      <p>Haz clic en el siguiente enlace para confirmar tu cuenta:</p>
      <a href="${confirmUrl}" style="background:#007bff;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;">Confirmar correo</a>
      <p>Este enlace expirará en 24 horas.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

exports.sendWelcomeEmail = async (to, empresaNombre, tempPassword, resetLink) => {
  const mailOptions = {
    from: `"${empresaNombre}" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Bienvenido a tu nueva empresa 🚀',
    html: `
      <h2>¡Tu empresa ha sido activada!</h2>
      <p>Tu usuario SuperAdmin ha sido creado con éxito.</p>
      <p><strong>Correo:</strong> ${to}</p>
      <p><strong>Contraseña temporal:</strong> ${tempPassword}</p>
      <p>Por seguridad, te recomendamos cambiar tu contraseña inmediatamente:</p>
      <a href="${resetLink}" style="background:#28a745;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;">Establecer nueva contraseña</a>
      <p>Después podrás iniciar sesión desde el portal principal.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};
