/*12-7-25
import { DataTypes } from "sequelize";
import db from "../DB/connection";
import User from "./user.model";

const CheckInModel = db.define('checkin', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    guest_name: {type: DataTypes.STRING},
    guest_lastname: {type: DataTypes.STRING},
    DNI: {type: DataTypes.BIGINT},
    income_date: {type: DataTypes.DATE},
    transport: {type: DataTypes.STRING},
    patent: {type: DataTypes.STRING},
    details: {type: DataTypes.TEXT},
    confirmed_by_owner: {type: DataTypes.BOOLEAN},
    check_in: {type: DataTypes.BOOLEAN},
    check_out: {type: DataTypes.BOOLEAN},
},
{
    
    timestamps: false
}
);

export default CheckInModel;*/
import { Model, DataTypes, Optional } from "sequelize";
import db from "../DB/connection";

interface CheckInAttributes {
    id: number;
    guest_name: string;
    guest_lastname: string;
    DNI: string;
    income_date: Date;
    transport?: string;
    patent?: string;
    details?: string;
    id_guard?: number | null;
    id_owner: number;
    confirmed_by_owner: boolean;
    id_country: number;
    check_out: boolean;
    check_in: boolean;
}

interface CheckInCreationAttributes extends Optional<CheckInAttributes, "id" | "transport" | "patent" | "details" | "id_guard" | "confirmed_by_owner" | "check_out" | "check_in"> { }

class CheckIn extends Model<CheckInAttributes, CheckInCreationAttributes> implements CheckInAttributes {
    public id!: number;
    public guest_name!: string;
    public guest_lastname!: string;
    public DNI!: string;
    public income_date!: Date;
    public transport?: string;
    public patent?: string;
    public details?: string;
    public id_guard?: number | null;
    public id_owner!: number;
    public confirmed_by_owner!: boolean;
    public id_country!: number;
    public check_out!: boolean;
    public check_in!: boolean;

    // Método personalizado para aprobar
    public async approve(): Promise<this> {
        this.check_in = true;
        await this.save();
        return this;
    }

    // Otro método ejemplo
    public async ownerConfirm(): Promise<this> {
        this.confirmed_by_owner = true;
        await this.save();
        return this;
    }

    // Métodos adicionales pueden ir acá...
}

CheckIn.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        guest_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        guest_lastname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        DNI: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        income_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        transport: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        patent: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        details: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        id_guard: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        id_owner: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        confirmed_by_owner: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        id_country: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        check_out: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        check_in: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        sequelize: db,
        tableName: "checkins",
        timestamps: false,
    }
);

export default CheckIn;
