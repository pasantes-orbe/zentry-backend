// interfaces/recurrent.interface.ts
export interface RecurrentInterface {
  id: number;
  idProperty: number;
  status: boolean;
  guestName: string;
  guestLastName: string;
  dni: string;
  roleRecurrent?: string;
  access_days?: string;
}
