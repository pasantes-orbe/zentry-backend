import db from "../models";
import Country from "./Country";

// Desestructuramos el modelo 'amenity' (en minúscula)
const { amenity } = db;

class Amenity {
    private name!: string;
    private avatar!: string;
    private address!: string;
    private country!: Country;

    constructor(country: Country, name: string, avatar: string = "", address: string = "") {
        this.setName(name);
        this.setAvatar(avatar);
        this.setAddress(address);
        this.setCountry(country);
    }

    public async save() {
        try {
            console.log("AAAAAAAA", this.getCountry().getId());
            console.log(this.getName());
            console.log(this.getAvatar());
            console.log(this.getAddress());

            // Usamos la instancia del modelo 'amenity' corregida
            const amenityToSave = amenity.build({
                name: this.getName(),
                image: this.getAvatar(),
                address: this.getAddress(),
                id_country: this.getCountry().getId()
            });

            return await amenityToSave.save();

        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    // Accesors

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getAvatar(): string {
        return this.avatar;
    }

    public setAvatar(avatar: string): void {
        this.avatar = avatar;
    }

    public getAddress(): string {
        return this.address;
    }

    public setAddress(address: string): void {
        this.address = address;
    }

    public getCountry(): Country {
        return this.country;
    }

    public setCountry(country: Country): void {
        this.country = country;
    }
}

export default Amenity;
