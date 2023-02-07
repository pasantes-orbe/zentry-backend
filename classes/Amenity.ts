import AmenityModel from "../models/amenity.model";
import Country from "./Country";

class Amenity {

    private name: string;
    private avatar: string;
    private address: string;
    private country: Country;



    constructor(country: Country, name: string, avatar: string = "", address: string = ""){
        this.setName(name);
        this.setAvatar(avatar);
        this.setAddress(address);
        this.setCountry(country);
    }

    public async save(){

        try {
            //TODO: Crear modelo de Amenity

            console.log("AAAAAAAA", this.getCountry().getId());
            console.log(this.getName());
            console.log(this.getAvatar());
            console.log(this.getAddress());

            const amenityToSave = new AmenityModel({
                name: this.getName(),
                image: this.getAvatar(),
                address: this.getAddress(),
                id_country: this.getCountry().getId()
            });

            return await amenityToSave.save();

        } catch (error) {
            
        }

    }

    //Accesors

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