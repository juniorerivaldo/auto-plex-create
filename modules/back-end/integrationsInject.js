import fs from "fs-extra";
import npmlog from "npmlog";

npmlog.heading = "Auto-Plex";

export async function integrationsInject(projectName) {
  npmlog.info("create","creating integration files...");
  const srcDir = `${projectName}/server/src`;
  fs.ensureDirSync(srcDir);
  const emailSender = `
const nodemailer = require('nodemailer');
const path = require('path');
const hbs = require('nodemailer-express-handlebars');

exports.createTransporter = async function () {
  return nodemailer.createTransport({
    name: process.env.SMTP_USER_FROM,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secureConnection: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    }
  });
};

interface User {
  name: string;
  email: string;
  access_token: string;
  id: string;
  // Outras propriedades do usuário, se houver
}

exports.sendRegisterEmail = async function (user: User, accessToken: string) {
  const handlebarOptions = {
    viewEngine: {
      extName: ".handlebars",
      partialsDir: path.resolve("src", "views"),
      defaultLayout: false,
    },
    viewPath: path.resolve("src", "views"),
    extName: ".handlebars",
  };

  const transporter = await this.createTransporter();
  transporter.use("compile", hbs(handlebarOptions));

  var mailOptions = {
    from: process.env.SMTP_USER_FROM,
    to: user.email,
    subject: "Register Email",
    text: "",
    template: "register",
    context: {
      accessToken: accessToken,
      processenv: process.env.ACTIVATE_URL,
    },
  };

  if (process.env.NODE_ENV !== "test") {
    transporter.sendMail(mailOptions, function (error: Error, info: any) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }
};

exports.sendForgotPasswordEmail = async function (user: User) {
  console.log(user.id)
  const handlebarOptions = {
    viewEngine: {
      extName: ".handlebars",
      partialsDir: path.resolve("src", "views"),
      defaultLayout: false,
    },
    viewPath: path.resolve("src", "views"),
    extName: ".handlebars",
  };

  const transporter = await this.createTransporter();
  transporter.use("compile", hbs(handlebarOptions));

  var mailOptions = {
    from: process.env.SMTP_USER_FROM,
    to: user.email,
    subject: "Forgot Password email",
    text: "",
    template: "forgotPassword",
    context: {
      const resetUrl = process.env.RESET_URL + '?' + user.id;
    },
  };

  if (process.env.NODE_ENV !== "test") {
    transporter.sendMail(mailOptions, function (error: Error, info: any) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }
};
`;

    fs.writeFileSync(`${ srcDir }/emailSender.ts`, emailSender);
    
}
