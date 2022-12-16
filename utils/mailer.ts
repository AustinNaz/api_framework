import nodemailer from "nodemailer";

const mailer = (() => {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
})();

const templates = {
  basic: (email: string) => ({
    from: 'Enter Sender Email here: "Sender" <sender@sender.com> ',
    to: email,
    subject: "This is a basic email!",
    text: "This is a basic email!",
  }),
};

export { mailer, templates };
