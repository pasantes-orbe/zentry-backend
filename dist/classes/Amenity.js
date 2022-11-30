"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const amenity_model_1 = __importDefault(require("../models/amenity.model"));
class Amenity {
    constructor(country, name, avatar = "", address = "") {
        this.setName(name);
        this.setAvatar(avatar);
        this.setAddress(address);
        this.setCountry(country);
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //TODO: Crear modelo de Amenity
                console.log("AAAAAAAA", this.getCountry().getId());
                console.log(this.getName());
                console.log(this.getAvatar());
                console.log(this.getAddress());
                const amenityToSave = new amenity_model_1.default({
                    name: this.getName(),
                    image: this.getAvatar(),
                    address: this.getAddress(),
                    id_country: this.getCountry().getId()
                });
                return yield amenityToSave.save();
            }
            catch (error) {
            }
        });
    }
    //Accesors
    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }
    getAvatar() {
        return this.avatar;
    }
    setAvatar(avatar) {
        this.avatar = avatar;
    }
    getAddress() {
        return this.address;
    }
    setAddress(address) {
        this.address = address;
    }
    getCountry() {
        return this.country;
    }
    setCountry(country) {
        this.country = country;
    }
}
exports.default = Amenity;
//# sourceMappingURL=Amenity.js.map