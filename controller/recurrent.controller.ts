// controller/recurrent.controller.ts
import { Request, Response } from "express";
import { Op, Model, ModelStatic } from "sequelize";
import db from "../models";

// -------- Helpers --------
const getVal = (m: any, key: string) => (m?.get ? m.get(key) : m?.[key]);

// -------- Modelos (tipado laxo) --------
const RecurrentModel      = db.recurrent       as unknown as ModelStatic<Model<any, any>>;
const PropertyModel       = db.property        as unknown as ModelStatic<Model<any, any>>;
const UserPropertiesModel = db.user_properties as unknown as ModelStatic<Model<any, any>>;

class RecurrentController {
  public async getAll(req: Request, res: Response) {
    try {
      const recurrents = await RecurrentModel.findAll({
        include: [{ model: PropertyModel, as: "property" }],
      });
      return res.json(recurrents);
    } catch (error) {
      return res
        .status(500)
        .json({ msg: "Error al obtener invitados recurrentes", error });
    }
  }

  public async getByID(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ msg: "ID inválido" });

    try {
      const foundRecurrent = await RecurrentModel.findByPk(id, {
        include: [{ model: PropertyModel, as: "property" }],
      });
      if (foundRecurrent) return res.json(foundRecurrent);
      return res
        .status(404)
        .json({ msg: `No existe el invitado recurrente con el id ${id}` });
    } catch (error) {
      return res
        .status(500)
        .json({ msg: "Error al obtener invitado recurrente", error });
    }
  }

  public async getByCountry(req: Request, res: Response) {
    const id_country = Number(req.params.id_country);
    if (isNaN(id_country))
      return res.status(400).json({ msg: "ID de country inválido" });

    try {
      const recurrentsByCountry = await RecurrentModel.findAll({
        include: [
          {
            model: PropertyModel,
            as: "property",
            where: { id_country },
          },
        ],
      });
      return res.json(recurrentsByCountry);
    } catch (error) {
      return res
        .status(500)
        .json({ msg: "Error al obtener recurrentes por country", error });
    }
  }

  public async getByProperty(req: Request, res: Response) {
    const id_property = Number(req.params.id_property);
    if (isNaN(id_property))
      return res.status(400).json({ msg: "ID de propiedad inválido" });

    try {
      const list = await RecurrentModel.findAll({ where: { id_property } });
      return res.json(list);
    } catch (error) {
      return res
        .status(500)
        .json({ msg: "Error al obtener recurrentes por propiedad", error });
    }
  }

  public async getByOwner(req: Request, res: Response) {
    const id_owner = Number(req.params.id_owner);
    if (isNaN(id_owner)) {
      return res.status(400).json({ msg: "ID de propietario inválido" });
    }

    try {
      // 1) Propiedades asignadas al owner
      const links = await UserPropertiesModel.findAll({
        where: { id_user: id_owner },
        attributes: ["id_property"],
      });

      const propertyIds = links.map((up) => getVal(up, "id_property")).filter(Boolean);
      if (propertyIds.length === 0) {
        return res.json([]); // no tiene propiedades asignadas
      }

      // 2) Recurrentes de esas propiedades
      const recurrentsOfOwner = await RecurrentModel.findAll({
        where: { id_property: { [Op.in]: propertyIds } },
        include: [{ model: PropertyModel, as: "property" }],
      });

      return res.json(recurrentsOfOwner);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        msg: "Error al obtener los invitados recurrentes por propietario",
        error,
      });
    }
  }

  public async create(req: Request, res: Response) {
    const { body } = req;
    try {
      // completar id_country desde la propiedad si no vino
      if (!body.id_country && body.id_property) {
        const prop = await PropertyModel.findByPk(body.id_property);
        const idCountry = prop ? getVal(prop, "id_country") : undefined;
        if (idCountry) body.id_country = idCountry;
        else {
          return res.status(400).json({
            msg: "No se pudo obtener el country a partir de la propiedad",
          });
        }
      }

      // evitar duplicados por dni + propiedad
      const exists = await RecurrentModel.findOne({
        where: { dni: body.dni, id_property: body.id_property },
        include: [{ model: PropertyModel, as: "property" }],
      });
      if (exists) {
        const propertyName =
          (exists as any).property?.name ?? getVal((exists as any).property, "name");
        return res.status(400).send({
          msg: `Ya existe un invitado recurrente con el DNI ${body.dni} para el country ${propertyName ?? "desconocido"}`,
          guest: exists,
        });
      }

      const newRecurrent = await RecurrentModel.create({
        ...body,
        status: true,
      });

      return res.json({
        msg: "El invitado recurrente se cargó con éxito",
        recurrent: newRecurrent,
      });
    } catch (error) {
      return res.status(500).json({
        msg: "No se pudo insertar el invitado recurrente, intente de nuevo.",
        error,
      });
    }
  }

  public async changeStatus(req: Request, res: Response) {
    const recurrentID = Number(req.params.id_recurrent);
    const { status } = req.body;
    if (isNaN(recurrentID))
      return res.status(400).json({ msg: "ID de recurrente inválido" });

    try {
      const changed = await RecurrentModel.update(
        { status },
        { where: { id: recurrentID } }
      );
      return res.json(changed);
    } catch (error) {
      return res.status(500).send(error);
    }
  }

  public async delete(req: Request, res: Response) {
    const recurrentID = Number(req.params.id_recurrent);
    if (isNaN(recurrentID)) {
      return res.status(400).json({ msg: "ID de recurrente inválido" });
    }

    try {
      const deleted = await RecurrentModel.destroy({ where: { id: recurrentID } });
      if (deleted === 0) {
        return res
          .status(404)
          .json({ msg: `No existe el invitado recurrente con el id ${recurrentID}` });
      }
      return res
        .status(200)
        .json({ msg: "Invitado recurrente eliminado correctamente" });
    } catch (error) {
      return res
        .status(500)
        .json({ msg: "Error al eliminar el invitado recurrente", error });
    }
  }
}

export default RecurrentController;


