// app/api/send/route.js
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req) {

    const [stands, products, partners, stores] = await Promise.all([
        prisma.stand.count(),
        prisma.product.count(),
        prisma.partner.count(),
        prisma.store.count(),
    ]);


    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const info = await transporter.sendMail({
            from: `"Test" <${process.env.SMTP_USER}>`,
            to: "kallnoob11@gmail.com",
            subject: "Test email",
            html: `<h1>Zdr brat
            
            ${stands}
            ${products}
            ${partners}
            ${stores}
            </h1>`,
        });

        return Response.json({ success: true, messageId: info.messageId });
    } catch (err) {
        console.error("Error sending email:", err);
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
