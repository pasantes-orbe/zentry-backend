// helpers/mailer.helper.ts
import nodemailer from "nodemailer";

class Mailer {

    public async send(message: string, email:string) {

        console.log("Este es el email ", email);

        console.log("SENDING");

        
        let transporter = nodemailer.createTransport({
            host: "c2301030.ferozo.com",
            port: 465,
            secure: true, // upgrade later with STARTTLS
            auth: {
                user: "contacto@orbesoftware.com.ar",
                pass: "Erio0s/142",
            }
        });
        

        const verify = await transporter.verify();
        console.log(verify);

        let msg = {
            from: 'contacto@orbesoftware.com.ar',
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

    //AJUSTAR ESTO POR ULTIMO 
    public async sendResetLink(email: string, resetLink: string) {
        console.log("Enviar reset link a:", email, resetLink);

        const transporter = nodemailer.createTransport({
            host: "c2301030.ferozo.com",
            port: 465,
            secure: true,
            auth: {
                user: "contacto@orbesoftware.com.ar",
                pass: "Erio0s/142",
            }
        });

        await transporter.verify();

        const msg = {
            from: 'contacto@orbesoftware.com.ar',
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
