import { RoleInterface } from "./role.interface";

export interface UserInterface {
    id?: number;
    email: string;
    name: string;
    lastname: string;
    password: string;
    phone: number;
    birthday: string;
    dni: number;
    avatar: string;
    role_id: number;              // ✅ nombre de la clave foránea en DB
    role?: RoleInterface;        // ✅ asociación (objeto Role completo, opcional)
}

/* 15/7/25 export interface UserInterface {
    id?: number;
    email: string,
    name: string,
    lastname: string,
    password: string,
    phone: number,
    birthday: string,
    dni: number,
    avatar: string,
    role: number
}*/

