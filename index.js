const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(bodyParser.json());

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('Error:', error);
    }
    console.log('Email sent:', info.response);
  });
};

// Endpoint to handle referrals
app.post('/api/referral', async (req, res) => {
  const { yourName, yourEmail, friendName, friendEmail } = req.body;

  try {
    const newReferral = await prisma.referral.create({
      data: {
        yourName,
        yourEmail,
        friendName,
        friendEmail,
      },
    });

    sendEmail(
      friendEmail,
      'Referral Notification',
      `Hello ${friendName},\n\nYou have been referred by ${yourName}  .\n\nBest regards,\nAccredian`
    );

    res.status(201).json(newReferral);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
