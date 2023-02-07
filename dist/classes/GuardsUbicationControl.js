"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GuardUbicationControl {
    constructor() {
        this.guards = [];
    }
    addGuard(lat, lng, id_user, id_country, user_name, user_lastname) {
        let new_guard = { lat, lng, id_user, id_country, user_name, user_lastname };
        const old_guard = this.getGuardsByUserId(id_user);
        if (old_guard) {
            this.deleteGuard(id_user);
            this.guards = [...this.guards, new_guard];
            // this.guards.push(new_guard);
        }
        else {
            this.guards = [...this.guards, new_guard];
            // this.guards.push(new_guard);
        }
        console.log(this.guards);
        return this.guards;
    }
    getGuardsByUserId(id) {
        let guard = this.guards.filter(guard => {
            return guard.id_user == id;
        })[0];
        return guard;
    }
    getGuardsByCountry(id) {
        let guards = this.guards.filter(guard => {
            return guard.id_country == id;
        });
        return guards;
    }
    getGuards() {
        const guards = this.guards;
        return guards;
    }
    deleteGuard(id) {
        let guardDeleted = this.getGuardsByUserId(id);
        this.guards = this.guards.filter(guard => {
            return guard.id_user != id;
        });
        return guardDeleted;
    }
}
exports.default = GuardUbicationControl;
//# sourceMappingURL=GuardsUbicationControl.js.map