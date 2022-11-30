
import CountryModel from '../models/country.model';

class Country {
    private id: number;
    private name: string;
    private image: string;
    private latitude: number;
    private longitude: number;
    private Amenities: [];
    private properties: [];
    private recurrents: [];

    constructor(name: string, latitude: number, longitude: number, image: string="", id: number = 0){
        this.setId(id);
        this.setName(name);
        this.setLatitude(latitude);
        this.setLongitude(longitude);
        this.setImage(image);
    }

    public save(): boolean{

        try {

            const countryToSave = new CountryModel({
                name: this.getName(),
                avatar: this.getImage(),
                latitude: this.getLatitude(),
                longitude: this.getLongitude()
            });

            countryToSave.save();
            return true;
            
        } catch (error) {
            return false;
        }

    }

    
    
    // Accesors

    public getId(): number {
        return this.id;
    }

    public setId(id: number): void {
        this.id = id;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getImage(): string {
        return this.image;
    }

    public setImage(image: string): void {
        this.image = image;
    }

    public getLatitude(): number {
        return this.latitude;
    }

    public setLatitude(latitude: number): void {
        this.latitude = latitude;
    }

    public getLongitude(): number {
        return this.longitude;
    }

    public setLongitude(longitude: number): void {
        this.longitude = longitude;
    }

    public getAmenities(): [] {
        return this.Amenities;
    }

    public setAmenities(Amenities: []): void {
        this.Amenities = Amenities;
    }

    public getProperties(): [] {
        return this.properties;
    }

    public setProperties(properties: []): void {
        this.properties = properties;
    }

    public getRecurrents(): [] {
        return this.recurrents;
    }

    public setRecurrents(recurrents: []): void {
        this.recurrents = recurrents;
    }


}

export default Country;