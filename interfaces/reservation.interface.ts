import { UserInterface } from './user.interface';
import { AmenityInterface } from './amenity.interface'; // crea esta interfaz si no la tienes

export interface ReservationAttributes {
  id: number;
  date: Date;
  details?: string;       // opcional, porque en el modelo puede ser null
  status?: string;        // opcional, porque en el modelo puede ser null
  id_user: number;
  id_amenity: number;
  user?: UserInterface;       // asociación opcional con User
  amenity?: AmenityInterface; // asociación opcional con Amenity
}
