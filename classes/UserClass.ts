// classes/UserClass.ts
import db from "../models";
import { Model, ModelStatic } from "sequelize";

// Tipados laxos de los modelos para evitar errores de "this context" en TS
const userModel = db.user as unknown as ModelStatic<Model<any, any>>;
const roleModel = db.role as unknown as ModelStatic<Model<any, any>>;

// Helper seguro para leer/escribir campos en instancias de Sequelize
const getVal = (m: any, key: string) => (m?.get ? m.get(key) : m?.[key]);
const setVal = (m: any, key: string, val: any) =>
  (m?.setDataValue ? m.setDataValue(key, val) : (m[key] = val));

// Normalizador de avatar (URL absoluta, relativa o Cloudinary public_id)
const placeholder = "https://ionicframework.com/docs/img/demos/avatar.svg";
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
const toAvatarUrl = (val?: string | null) => {
  if (!val) return placeholder;
  const s = String(val);
  if (/^https?:\/\//i.test(s)) return s;        // URL absoluta
  if (s.startsWith("/")) return s;                // ruta relativa (el front la resolverá)
  return cloudName
    ? `https://res.cloudinary.com/${cloudName}/image/upload/${s}` // public_id Cloudinary
    : s;
};

class UserClass {
  public async getAll(): Promise<Model<any, any>[]> {
    const users = (await userModel.findAll({
      attributes: { exclude: ["password", "role_id"] },
      include: [{ model: roleModel, as: "userRole" }],
    })) as Model<any, any>[];

    users.forEach((u) => {
      const current = getVal(u, "avatar") as string | null | undefined;
      setVal(u, "avatar", toAvatarUrl(current));
    });

    return users;
  }

  public async getAllByRole(roleName: string): Promise<Model<any, any>[]> {
    const users = (await userModel.findAll({
      where: { "$userRole.name$": roleName },
      attributes: { exclude: ["password", "role_id"] },
      include: [{ model: roleModel, as: "userRole" }],
    })) as Model<any, any>[];

    users.forEach((u) => {
      const current = getVal(u, "avatar") as string | null | undefined;
      setVal(u, "avatar", toAvatarUrl(current));
    });

    return users;
  }

  public async is(roleName: string, id: number | string): Promise<boolean> {
    const foundUser = (await userModel.findByPk(id, {
      attributes: { exclude: ["password", "role_id"] },
      include: [{ model: roleModel, as: "userRole" }],
    })) as Model<any, any> | null;

    const userRole = foundUser ? getVal(foundUser, "userRole") : null;
    if (!userRole) return false;

    const name = getVal(userRole, "name");
    return String(name) === roleName;
  }
}

export default UserClass;
