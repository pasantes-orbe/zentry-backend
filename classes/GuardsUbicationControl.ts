

class GuardUbicationControl {
    public guards: any[];

    constructor() {
        this.guards = [];
    }

    addGuard(lat: number, lng: number, id_user: string, id_country: string, user_name: string, user_lastname: string) {
        let new_guard = { lat, lng, id_user, id_country, user_name, user_lastname, timestamp: Date.now() }
        const old_guard = this.getGuardsByUserId(id_user)
        if (old_guard) {
            this.deleteGuard(id_user)
            this.guards = [...this.guards, new_guard]

            // this.guards.push(new_guard);
        } else {
            this.guards = [...this.guards, new_guard]
            // this.guards.push(new_guard);
        }
        console.log(this.guards)
        return this.guards;
    }
    getGuardsByUserId(id: any) {
        let guard = this.guards.filter(guard => {
            return guard.id_user == id
        })[0];
        return guard
    }

    getGuardsByCountry(id: any) {
        let guards = this.guards.filter(guard => {
            return guard.id_country == id
        })
        return guards
    }

    getGuards(): any[] {
        const guards = this.guards
        return guards
    }


    deleteGuard(id: any) {
        let guardDeleted = this.getGuardsByUserId(id);
        this.guards = this.guards.filter(guard => {
            return guard.id_user != id
        })
        return guardDeleted;
    }

    // Limpiar guardias inactivos (más de 30 segundos sin actualizar)
    cleanInactiveGuards() {
        const now = Date.now();
        const initialCount = this.guards.length;
        this.guards = this.guards.filter(guard => {
            const isActive = (now - guard.timestamp) <= 30000;
            if (!isActive) {
                console.log(`[GuardControl] Guardia ${guard.id_user} (${guard.user_name} ${guard.user_lastname}) marcado como inactivo`);
            }
            return isActive;
        });
        const removedCount = initialCount - this.guards.length;
        if (removedCount > 0) {
            console.log(`[GuardControl] ${removedCount} guardia(s) inactivo(s) eliminado(s)`);
        }
        return this.guards;
    }
}

export default GuardUbicationControl;