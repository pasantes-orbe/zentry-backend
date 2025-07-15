export interface NotificationInterface {
  id: number;
  idEmitter: number;
  idReceiver: number;
  type: string; // "Evento" | "Ingreso" | "Información"
  title: string;
  body: string;
}
