"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
class Mailer {
    send(message, email) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Este es el email ", email);
            console.log("SENDING");
            let transporter = nodemailer_1.default.createTransport({
                host: "c2301030.ferozo.com",
                port: 465,
                secure: true, // upgrade later with STARTTLS
                auth: {
                    user: "contacto@orbesoftware.com.ar",
                    pass: "Orb3Erios142",
                }
            });
            const verify = yield transporter.verify();
            console.log(verify);
            let msg = {
                from: 'contacto@orbesoftware.com.ar',
                to: email,
                subject: 'Nueva Contraseña',
                text: `Tu nueva contraseña para ingresar a la aplicación es: ${message}`,
                html: `<p>Tu nueva contraseña para ingresar a la aplicación es: ${message}</p>`
            };
            try {
                const info = yield transporter.sendMail(msg);
                console.log(info);
            }
            catch (error) {
                console.log("err", error);
            }
            // let info = transporter.sendMail(msg, (error, info) => {
            //     if (error) {
            //         return console.log(error);
            //     }
            //     console.log('Message sent: %s', info.messageId);
            // });
            // return info;
        });
    }
}
exports.default = Mailer;
//# sourceMappingURL=mailer.helper.js.map