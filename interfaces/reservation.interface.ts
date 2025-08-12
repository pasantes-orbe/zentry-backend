import { Model, Optional } from 'sequelize';
import { UserInterface } from './user.interface';
import { AmenityInterface } from './amenity.interface';

// Exportamos la interfaz de atributos de la reserva
export interface ReservationAttributes {
    id?: number; 
    date: Date;
    details?: string;
    status?: string;
    id_user: number;
    id_amenity: number;
    user?: UserInterface;
    amenity?: AmenityInterface;
}

// Exportamos el tipo de atributos de creación, donde 'id' es opcional.
export type ReservationCreationAttributes = Optional<ReservationAttributes, 'id'>;