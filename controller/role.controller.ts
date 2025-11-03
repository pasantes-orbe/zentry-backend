// controller/role.controller.ts
import { Request, Response } from "express";
import { getModels } from "../models/getModels";

class RoleController {
  public async getAllRoles(req: Request, res: Response) {
    const { role } = getModels() as any;
    if (!role) return res.status(500).json({ msg: "Modelo 'role' no encontrado" });

    try {
      const roles = await role.findAll();
      return res.json(roles);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Error al obtener todos los roles." });
    }
  }

  public async getRoleById(req: Request, res: Response) {
    const { role } = getModels() as any;
    if (!role) return res.status(500).json({ msg: "Modelo 'role' no encontrado" });

    const { id } = req.params;
    try {
      const foundRole = await role.findByPk(id);
      if (foundRole) return res.json(foundRole);
      return res.status(404).json({ msg: `No existe rol con el id ${id}` });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Error al obtener el rol por ID." });
    }
  }

  public async createRole(req: Request, res: Response) {
    const { role } = getModels() as any;
    if (!role) return res.status(500).json({ msg: "Modelo 'role' no encontrado" });

    const { body } = req;
    if (body.name) body.name = String(body.name).toLowerCase();

    try {
      const newRole = await role.create(body);
      return res.status(201).json({ msg: "El rol se creó con éxito", newRole });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "No se pudo crear el rol, intente de nuevo." });
    }
  }
}

export default RoleController;
