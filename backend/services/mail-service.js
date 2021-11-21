const nodemailer = require('nodemailer');

class MailService {

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.NO_REPLY_EMAIL,
                pass: process.env.NO_REPLY_PASSWORD
            }
        });
    };

    async sendActivationMail(to, link) {
        await this.transporter.sendMail({
            from: process.env.NO_REPLY_EMAIL,
            to,
            subject: 'Account created successfully! Site:' + process.env.API_URL,
            text: '',
            html:
                `
                    <div>
                         <h1>Activate by link:</h1>
                         <a href="${ link }">tab</a>
                    </div>
                `
        });
    };
}

module.exports = new MailService();
