const nodemailer = require("nodemailer");
// const pug = require("pug");
const { htmlForOTP, adminReplyEmail } = require("./html");
let Email = class Email {
  constructor(user, resetcode) {
    this.to = user.email;
    this.username = user.name.split(" ")[0];
    this.resetcode = resetcode;
    this.from = `${process.env.clientEmail}`;
  }
  newTransport() {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.clientEmail,
        pass: process.env.email_pass_key,
      },
    });
  }
  async send() {
    const mailOptions = {
      from: "Cribhub app",
      to: this.to,
      subject: "Cribhub verification code",
      html: htmlForOTP.replace("#code#", this.resetcode),
    };

    await this.newTransport().sendMail(mailOptions);
  }
  async sendVerificationCode() {
    await this.send();
  }
};

let AdminReply = class AdminReply {
  constructor(user, message) {
    this.to = user;
    this.message = message;
    this.from = `${process.env.clientEmail}`;
  }
  newTransport() {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.clientEmail,
        pass: process.env.email_pass_key,
      },
    });
  }
  async send() {
    const mailOptions = {
      from: "Cribhub app",
      to: this.to,
      subject: "Cribhub verification code",
      html: adminReplyEmail.replace("#message#", this.message),
    };

    await this.newTransport().sendMail(mailOptions);
  }
  async sendMessage() {
    await this.send();
  }
};

module.exports = {
  Email,
  AdminReply
};
