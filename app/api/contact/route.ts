import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req: NextRequest) {
  const { name, email, rating, message, type } = await req.json()

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Configure SMTP transport using environment variables
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: ["sheiduhalilu@lincoln.edu.ng", "info@lincoln.edu.ng"],
    subject: `E-Library Feedback (${type}) from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nType: ${type}\nRating: ${rating}\nMessage:\n${message}`,
    html: `<p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Type:</b> ${type}</p><p><b>Rating:</b> ${rating} star(s)</p><p><b>Message:</b><br/>${message.replace(/\n/g, '<br/>')}</p>`
  }

  try {
    await transporter.sendMail(mailOptions)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
} 