import jwt from "jsonwebtoken";

const generateToken = ( uid = '' ) => {

    return new Promise( (resolve, reject) => {

        const payload = { uid };

        jwt.sign(payload, "SUPER_SECRET_PASSWORD", {expiresIn: '7d'}, (err, token) => {
            if(err) reject('No se pudo generar el token');
            resolve(token);
        });

    } )

}

export default generateToken;