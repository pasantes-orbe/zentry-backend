// classes/UserClass.ts
import { getModels } from "../models/getModels";
import { Model } from "sequelize";

// Tipados y helpers

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
    const { user, role } = getModels();
    const users = (await (user as any).findAll({
      attributes: { exclude: ["password", "role_id"] },
      include: [{ model: role, as: "userRole" }],
    })) as Model<any, any>[];

    users.forEach((u) => {
      const current = getVal(u, "avatar") as string | null | undefined;
      setVal(u, "avatar", toAvatarUrl(current));
    });

    return users;
  }

  public async getAllByRole(roleName: string): Promise<Model<any, any>[]> {
    const { user, role } = getModels();
    const users = (await (user as any).findAll({
      where: { "$userRole.name$": roleName },
      attributes: { exclude: ["password", "role_id"] },
      include: [{ model: role, as: "userRole" }],
    })) as Model<any, any>[];

    users.forEach((u) => {
      const current = getVal(u, "avatar") as string | null | undefined;
      setVal(u, "avatar", toAvatarUrl(current));
    });

    return users;
  }

  public async is(roleName: string, id: number | string): Promise<boolean> {
    const { user, role } = getModels();
    const foundUser = (await (user as any).findByPk(id, {
      attributes: { exclude: ["password", "role_id"] },
      include: [{ model: role, as: "userRole" }],
    })) as Model<any, any> | null;

    const userRole = foundUser ? getVal(foundUser, "userRole") : null;
    if (!userRole) return false;

    const name = getVal(userRole, "name");
    return String(name) === roleName;
  }
}

export default UserClass;
