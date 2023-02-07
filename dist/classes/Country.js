"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const country_model_1 = __importDefault(require("../models/country.model"));
class Country {
    constructor(name, latitude, longitude, image = "", id = 0) {
        this.setId(id);
        this.setName(name);
        this.setLatitude(latitude);
        this.setLongitude(longitude);
        this.setImage(image);
    }
    save() {
        try {
            const countryToSave = new country_model_1.default({
                name: this.getName(),
                avatar: this.getImage(),
                latitude: this.getLatitude(),
                longitude: this.getLongitude()
            });
            countryToSave.save();
            return true;
        }
        catch (error) {
            return false;
        }
    }
    // Accesors
    getId() {
        return this.id;
    }
    setId(id) {
        this.id = id;
    }
    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }
    getImage() {
        return this.image;
    }
    setImage(image) {
        this.image = image;
    }
    getLatitude() {
        return this.latitude;
    }
    setLatitude(latitude) {
        this.latitude = latitude;
    }
    getLongitude() {
        return this.longitude;
    }
    setLongitude(longitude) {
        this.longitude = longitude;
    }
    getAmenities() {
        return this.Amenities;
    }
    setAmenities(Amenities) {
        this.Amenities = Amenities;
    }
    getProperties() {
        return this.properties;
    }
    setProperties(properties) {
        this.properties = properties;
    }
    getRecurrents() {
        return this.recurrents;
    }
    setRecurrents(recurrents) {
        this.recurrents = recurrents;
    }
}
exports.default = Country;
//# sourceMappingURL=Country.js.map