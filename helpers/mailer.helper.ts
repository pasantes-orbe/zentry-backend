// helpers/mailer.helper.ts
import nodemailer from "nodemailer";

class Mailer {

    public async send(message: string, email:string) {

        console.log("Este es el email ", email);

        console.log("SENDING");

        
        const host = process.env.SMTP_HOST || "c2301030.ferozo.com";
        const port = parseInt(process.env.SMTP_PORT || "587", 10);
        const secure = (process.env.SMTP_SECURE || "false") === "true";
        const smtpUser = process.env.SMTP_USER || "contacto@orbesoftware.com.ar";
        const smtpPass = process.env.SMTP_PASS || "Erio0s/142";

        let transporter = nodemailer.createTransport({
            host,
            port,
            secure, // true: TLS implícito (465). false: STARTTLS (587)
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
            requireTLS: !secure,
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 20000,
        });
        

        const verify = await transporter.verify();
        console.log(verify);

        let msg = {
            from: smtpUser,
            to: email,
            subject: 'Nueva Contraseña',
            text: `Tu nueva contraseña para ingresar a la aplicación es: ${message}`,
            html: `<p>Tu nueva contraseña para ingresar a la aplicación es: ${message}</p>`
        }


        try {
            const info = await transporter.sendMail(msg);
            console.log(info);

        } catch (error) {

            console.log("err", error);
            
        }

        // let info = transporter.sendMail(msg, (error, info) => {
        //     if (error) {
        //         return console.log(error);
        //     }
        //     console.log('Message sent: %s', info.messageId);
        // });

        // return info;

    }

    public async sendResetLink(email: string, resetLink: string) {
        console.log("Enviar reset link a:", email);

        const host = process.env.SMTP_HOST || "c2301030.ferozo.com";
        const port = parseInt(process.env.SMTP_PORT || "587", 10);
        const secure = (process.env.SMTP_SECURE || "false") === "true";
        const smtpUser = process.env.SMTP_USER || "contacto@orbesoftware.com.ar";
        const smtpPass = process.env.SMTP_PASS || "Erio0s/142";

        const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
            requireTLS: !secure,
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 20000,
        });

        await transporter.verify();

        const msg = {
            from: smtpUser,
            to: email,
            subject: 'Restablecer contraseña',
            text: `Para restablecer tu contraseña, abrí este enlace: ${resetLink}`,
            html: `<p>Para restablecer tu contraseña, hacé clic en el siguiente enlace:</p><p><a href="${resetLink}" target="_blank">Restablecer contraseña</a></p>`
        } as any;

        try {
            const info = await transporter.sendMail(msg);
            console.log('Reset link enviado:', info?.messageId || info);
        } catch (error) {
            console.error('Error enviando reset link:', error);
        }
    }

}

export default Mailer;
