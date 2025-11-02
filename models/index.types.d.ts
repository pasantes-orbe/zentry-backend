//models/index.d.ts
import { Model, ModelCtor } from "sequelize";

// ======================================================================
// 1. IMPORTA TUS 15 INTERFACES
// ======================================================================
import { AppIdInterface } from "../interfaces/appid";
import { AntipanicInterface } from "../interfaces/antipanic";
import { CheckInInterface } from "../interfaces/checkin";
import { CheckOutInterface } from "../interfaces/checkout";
import { CountryInterface } from "../interfaces/country";
import { GuardCountryInterface } from "../interfaces/guard_country";
import { InvitationInterface } from "../interfaces/invitation";
import { NotificationInterface } from "../interfaces/notification";
import { OwnerCountryInterface } from "../interfaces/owner_country";
import { passwordChangeRequestInterface } from "../interfaces/passwordChangeRequest";
import { PropertyInterface } from "../interfaces/property";
import { RecurrentInterface } from "../interfaces/recurrent";
import { RoleInterface } from "../interfaces/role";
import { UserInterface } from "../interfaces/user";
import { UserPropertiesInterface } from "../interfaces/userProperties";
import { UserPropertyInterface } from "../interfaces/user.property.interface";

import { AmenityInterface } from "../interfaces/amenity"; 
import { ReservationAttributes } from '../interfaces/reservation.interface';
import { GuardScheduleInterface } from '../interfaces/guard_schedule.interface'; 





// ======================================================================
// 2. DEFINE EL OBJETO 'db' con todos los modelos
// ======================================================================
export interface DbInterface {
    sequelize: any;
    DataTypes: any;
    appid: ModelCtor<AppIdInterface>;
    antipanic: ModelCtor<AntipanicInterface>;
    checkin: ModelCtor<CheckInInterface>;
    checkout: ModelCtor<CheckOutInterface>;
    country: ModelCtor<CountryInterface>;
    guard_country: ModelCtor<GuardCountryInterface>;
    invitation: ModelCtor<InvitationInterface>;
    notification: ModelCtor<NotificationInterface>;
    owner_country: ModelCtor<OwnerCountryInterface>;
    passwordChangeRequest: ModelCtor<passwordChangeRequestInterface>;
    property: ModelCtor<PropertyInterface>;
    recurrent: ModelCtor<RecurrentInterface>;
    role: ModelCtor<RoleInterface>;
    user: ModelCtor<UserInterface>;
    user_properties: ModelCtor<UserPropertiesInterface>;
    amenity: ModelCtor<AmenityInterface>;
    reservation: ModelCtor<Model<ReservationAttributes>>;
    guard_schedule: ModelCtor<GuardScheduleInterface>;



}

// ======================================================================
// 3. DECLARACIÓN DEL MÓDULO
// ======================================================================
