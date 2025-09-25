import 'dotenv/config'
import nodemailer from 'nodemailer'
import express from 'express'


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "justin.alkire@gmail.com",
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});


  try {
   
    // if (!register.email) {
    //   console.log("Request Error", req.body.register);
    //   return res.status(400).send("Bad Request");}
    
    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: 'bcumbie@una.edu',
      subject: 'I DID IT!!!!!!!!!',
      text: 'Sup man, Justin got it done'

    };

    // await registrations.insertOne(req.body);
   
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error('Error:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
 
  } catch (error) {
    console.error('Error in /register:', error);
    res.status(500).send("Internal Server Error");
  }