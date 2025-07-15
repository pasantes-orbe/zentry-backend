/* 15/07/25 import jwt from "jsonwebtoken";
const generateToken = ( uid = '' ) => {
    return new Promise( (resolve, reject) => {
        const payload = { uid };
        jwt.sign(payload, "SUPER_SECRET_PASSWORD", {expiresIn: '7d'}, (err, token) => {
            if(err) reject('No se pudo generar el token');
            resolve(token);
        });
    } )
}
export default generateToken;*/

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_PASSWORD";

const generateToken = async (uid: string | number): Promise<string> => {
    const payload = { uid: String(uid) };

    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: "7d" },
            (err, token) => {
                if (err || !token) {
                    reject(new Error("No se pudo generar el token"));
                } else {
                    resolve(token);
                }
            }
        );
    });
};

export default generateToken;
