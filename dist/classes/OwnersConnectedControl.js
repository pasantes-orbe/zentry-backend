"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class OwnersConnectedControl {
    constructor() {
        this.owners = [];
    }
    addowner(id_user, id_socket) {
        let new_owner = { id_user, id_socket };
        const old_owner = this.getownersByUserId(id_user);
        if (old_owner) {
            this.deleteowner(id_user);
            this.owners = [...this.owners, new_owner];
            // this.owners.push(new_owner);
        }
        else {
            this.owners = [...this.owners, new_owner];
            // this.owners.push(new_owner);
        }
        console.log(this.owners);
        return this.owners;
    }
    getownersByUserId(id) {
        let owner = this.owners.filter(owner => {
            return owner.id_user == id;
        })[0];
        return owner;
    }
    getowners() {
        const owners = this.owners;
        return owners;
    }
    deleteowner(id) {
        let ownerDeleted = this.getownersByUserId(id);
        this.owners = this.owners.filter(owner => {
            return owner.id_user != id;
        });
        return ownerDeleted;
    }
}
exports.default = OwnersConnectedControl;
//# sourceMappingURL=OwnersConnectedControl.js.map