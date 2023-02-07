import nodemailer from "nodemailer";

class Mailer {


    public async send(message, email:string) {

        console.log("SENDING");

        let transporter = nodemailer.createTransport({
            host: "c2301030.ferozo.com",
            port: 465,
            secure: true, // upgrade later with STARTTLS
            auth: {
                user: "contacto@orbesoftware.com.ar",
                pass: "Orb3Erios142",
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

        const info = await transporter.sendMail(msg);

        console.log(info);

        // let info = transporter.sendMail(msg, (error, info) => {
        //     if (error) {
        //         return console.log(error);
        //     }
        //     console.log('Message sent: %s', info.messageId);
        // });

        // return info;

    }

}

export default Mailer;