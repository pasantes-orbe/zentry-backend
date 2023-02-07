class DatesHelper {

    public getDay(number_of_week: number){
        const days = [
            "lunes",
            "martes",
            "miercoles",
            "jueves",
            "viernes",
            "sabado",
            "domingo"
        ]

        return days[number_of_week - 1];
    }

}


export default DatesHelper;