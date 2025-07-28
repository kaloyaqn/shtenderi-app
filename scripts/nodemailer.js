const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
});

(async () => {
    const info = await transporter.sendMail({
        from: `${process.env.SMTP_USER}`,
        to: "hello@stendo.bg",
        subject: "test",
        html: "<h1>zdr brat</h1>"
    })

    console.log("message sent:", info.messageId, info)
})