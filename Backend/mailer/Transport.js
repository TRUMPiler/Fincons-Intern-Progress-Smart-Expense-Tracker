import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "naishal036@gmail.com",
    pass:process.env.GOOGLE_SECRET_ID,
  },
});

export default transporter;