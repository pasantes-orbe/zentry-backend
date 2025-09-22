//interfaces/country.interface.ts
export interface CountryInterface {
  id?: number;         // Opcional, porque en creación no lo tenés
  name: string;
  latitude: number;
  longitude: number;
  avatar?: string;     // Opcional, puede no venir
}
