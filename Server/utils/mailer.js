
const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'maskdecoration@gmail.com',
//     pass: 'cdzs fcif bvxy jzjq', // NOT normal password
//   },
// });

// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 465,
//   secure: true,
//   auth: {
//     user: 'maskdecoration@gmail.com',
//     pass: 'cdzsfcifbvxyjzjq',
//   },
// });

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: 'maskdecoration@gmail.com',
    pass: 'cdzsfcifbvxyjzjq',
  },
});

exports.sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: 'maskdecoration@gmail.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}`, // fallback
    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Your OTP Code</h2>
        <p>Please use the following OTP to verify your account:</p>

        <div style="
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 5px;
          margin: 20px 0;
        ">
          ${otp}
        </div>

        <p>This OTP will expire in 5 minutes.</p>
      </div>
    `
  });
};