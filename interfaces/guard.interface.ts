export interface GuardInterface {
  id_country: number;
  id_user: number;
  id?: number;           // opcional
  name: string;
  email?: string;
  [key: string]: any;    // para evitar errores de índice
  [key: symbol]: any;
}
