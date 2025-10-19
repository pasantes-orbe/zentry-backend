// controller/recurrent.controller.ts
import { Request, Response } from "express";
import db from "../models";

const { recurrent, property } = db;

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
}

export default RecurrentController;
