export interface EventInterface {
  id: number;
  idUser: number;
  idAmenity: number;
  date: string;
  details: string;
  status: string; // "Pendiente" | "Aprobado" | "Rechazado"
}
