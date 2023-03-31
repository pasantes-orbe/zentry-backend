"use strict";
//lat:
//lng:
// id_user:
//id_country:
//user_name:
//  user_lastname:
Object.defineProperty(exports, "__esModule", { value: true });
//}
class GuardUbication {
    constructor(lat, lng, id_user, id_country, user_name, user_lastname) {
        this.lat = lat;
    }
    get lat() {
        return this.lat;
    }
    set lat(lat) {
        this.lat = lat;
    }
    get lng() {
        return this.lng;
    }
    set lng(lng) {
        this.lng = lng;
    }
    get iduser() {
        return this.id_user;
    }
    set iduser(iduser) {
        this.id_user = iduser;
    }
    get idcountry() {
        return this.id_country;
    }
    set idcountry(idcountry) {
        this.id_country = idcountry;
    }
    get username() {
        return this.user_name;
    }
    set username(username) {
        this.user_name = username;
    }
    get userlastname() {
        return this.user_lastname;
    }
    set userlastname(userlastname) {
        this.user_lastname = userlastname;
    }
}
exports.default = GuardUbication;
//# sourceMappingURL=GuardUbication.js.map