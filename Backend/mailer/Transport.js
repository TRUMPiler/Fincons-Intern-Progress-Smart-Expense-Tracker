// import nodemailer from 'nodemailer';
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "naishal036@gmail.com",
//     pass:process.env.GOOGLE_SECRET_ID,
//   },
// });

export default resend;
// export default transporter;