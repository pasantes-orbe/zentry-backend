import { UserInterface } from './user.interface';


export interface ReservationAttributes {
  id: number;
  date: Date;
  id_amenity: number;
  user?: UserInterface;  // relación incluida opcionalmente
  // otras propiedades que uses
}