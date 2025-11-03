// src/models/index.d.ts
import { Sequelize, Model, ModelCtor } from "sequelize";

// ======================================================================
// 1) IMPORTS DE TUS INTERFACES
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
import { AmenityInterface } from "../interfaces/amenity";
import { ReservationAttributes } from "../interfaces/reservation.interface";
import { GuardScheduleInterface } from "../interfaces/guard_schedule.interface";

// ======================================================================
// 2) INTERFAZ DEL OBJETO db (lo que exporta models/index.ts)
// ======================================================================
export interface DbInterface {
  // helpers
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;

  // modelos (los que sí o sí esperás tener)
  user: ModelCtor<Model<UserInterface>>;
  role: ModelCtor<Model<RoleInterface>>;
  property: ModelCtor<Model<PropertyInterface>>;
  amenity: ModelCtor<Model<AmenityInterface>>;
  reservation: ModelCtor<Model<ReservationAttributes>>;
  recurrent: ModelCtor<Model<RecurrentInterface>>;
  country: ModelCtor<Model<CountryInterface>>;
  notification: ModelCtor<Model<NotificationInterface>>;
  appid: ModelCtor<Model<AppIdInterface>>;
  checkin: ModelCtor<Model<CheckInInterface>>;
  checkout: ModelCtor<Model<CheckOutInterface>>;
  antipanic: ModelCtor<Model<AntipanicInterface>>;
  guard_country: ModelCtor<Model<GuardCountryInterface>>;
  guard_schedule: ModelCtor<Model<GuardScheduleInterface>>;
  owner_country: ModelCtor<Model<OwnerCountryInterface>>;
  invitation: ModelCtor<Model<InvitationInterface>>;

  // nombres alternativos que pueden variar según tu código histórico
  // (los marco opcionales para no romper el tipado si no existen)
  user_properties?: ModelCtor<Model<UserPropertiesInterface>>;
  userProperties?: ModelCtor<Model<UserPropertiesInterface>>;
  passwordChangeRequest?: ModelCtor<Model<passwordChangeRequestInterface>>;
  ["password_change_request"]?: ModelCtor<Model<passwordChangeRequestInterface>>;
}

// ======================================================================
// 3) DECLARACIÓN DEL VALOR POR DEFECTO QUE EXPORTA models/index.ts
// ======================================================================
declare const db: DbInterface;
export default db;
