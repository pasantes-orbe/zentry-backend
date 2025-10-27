// controller/recurrent.controller.ts
import { Request, Response } from "express";
import { Op } from "sequelize";
import db from "../models";

const { recurrent, property, user_properties } = db;

class RecurrentController {
  public async getAll(req: Request, res: Response) {
    try {
      const recurrents = await recurrent.findAll({
        include: [{ model: property, as: "property" }],
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
      const foundRecurrent = await recurrent.findByPk(id, {
        include: [{ model: property, as: "property" }],
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
      const recurrentsByCountry = await recurrent.findAll({
        include: [
          {
            model: property,
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
      const list = await recurrent.findAll({ where: { id_property } });
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
      // 1) Obtener las propiedades asignadas al usuario (owner)
      const links = await user_properties.findAll({
        where: { id_user: id_owner },
        attributes: ["id_property"],
      });

      const propertyIds = links.map((up: any) => up.id_property);

      if (propertyIds.length === 0) {
        return res.json([]); // no tiene propiedades asignadas
      }

      // 2) Traer los recurrentes de esas propiedades
      const recurrentsOfOwner = await recurrent.findAll({
        where: { id_property: { [Op.in]: propertyIds } },
        include: [{ model: property, as: "property" }],
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
        const prop = await property.findByPk(body.id_property);
        if (prop?.id_country) body.id_country = prop.id_country;
        else
          return res.status(400).json({
            msg: "No se pudo obtener el country a partir de la propiedad",
          });
      }

      // evitar duplicados por dni + propiedad
      const exists = await recurrent.findOne({
        where: { dni: body.dni, id_property: body.id_property },
        include: [{ model: property, as: "property" }],
      });
      if (exists) {
        const propertyName = (exists as any).property?.name;
        return res.status(400).send({
          msg: `Ya existe un invitado recurrente con el DNI ${body.dni} para el country ${propertyName ?? "desconocido"}`,
          guest: exists,
        });
      }

      const newRecurrent = await recurrent.create({
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
      const changed = await recurrent.update(
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
      const deleted = await recurrent.destroy({ where: { id: recurrentID } });
      if (deleted === 0) {
        return res.status(404).json({ msg: `No existe el invitado recurrente con el id ${recurrentID}` });
      }
      return res.status(200).json({ msg: "Invitado recurrente eliminado correctamente" });
    } catch (error) {
      return res.status(500).json({ msg: "Error al eliminar el invitado recurrente", error });
    }
  }
}

export default RecurrentController;

