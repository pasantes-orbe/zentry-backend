"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DatesHelper {
    getDay(number_of_week) {
        const days = [
            "lunes",
            "martes",
            "miercoles",
            "jueves",
            "viernes",
            "sabado",
            "domingo"
        ];
        return days[number_of_week - 1];
    }
}
exports.default = DatesHelper;
//# sourceMappingURL=Dates.js.map