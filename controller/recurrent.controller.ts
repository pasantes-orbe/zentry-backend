import { Request, Response } from "express";
import CountryModel from "../models/country.model";
import Property from "../models/property.model";
import Recurrent from "../models/recurrent.model";

class RecurrentController {

    public async getAll(req: Request, res: Response) {
        try {
            const recurrents = await Recurrent.findAll({
                include: [Property],
                attributes: ['id', 'status', 'guest_name', 'guest_lastname', 'dni']
            });
            return res.json(recurrents);
        } catch (error) {
            return res.status(500).json({ msg: "Error al obtener invitados recurrentes", error });
        }
    }

    public async getByID(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ msg: "ID inválido" });

        try {
            const recurrent = await Recurrent.findByPk(id, {
                include: Property,
                attributes: ['id', 'status', 'guest_name', 'guest_lastname', 'dni']
            });
            if (recurrent) {
                return res.json(recurrent);
            }
            return res.status(404).json({ msg: `No existe el invitado recurrente con el id ${id}` });
        } catch (error) {
            return res.status(500).json({ msg: "Error al obtener invitado recurrente", error });
        }
    }

    public async getByCountry(req: Request, res: Response) {
        const id_country = Number(req.params.id_country);
        if (isNaN(id_country)) return res.status(400).json({ msg: "ID de country inválido" });

        try {
            const recurrents_by_country = await Recurrent.findAll({
                include: [{
                    model: Property,
                    where: { id_country }
                }]
            });
            return res.json(recurrents_by_country);
        } catch (error) {
            return res.status(500).json({ msg: "Error al obtener recurrentes por country", error });
        }
    }

    public async getByProperty(req: Request, res: Response) {
        const id_property = Number(req.params.id_property);
        if (isNaN(id_property)) return res.status(400).json({ msg: "ID de propiedad inválido" });

        try {
            const recurrent = await Recurrent.findAll({
                where: { id_property }
            });
            return res.json(recurrent);
        } catch (error) {
            return res.status(500).json({ msg: "Error al obtener recurrentes por propiedad", error });
        }
    }

    public async create(req: Request, res: Response) {
        const { body } = req;
        try {
            // Chequear si no existe el recurrente a la misma propiedad por DNI
            const exists = await Recurrent.findOne({
                where: {
                    dni: body.dni,
                    id_property: body.id_property
                },
                include: Property
            });
            if (exists) {
                // Accedemos a la propiedad incluida usando get() y forzamos tipo a cualquier
                const property = exists.get('property') as any;
                return res.status(400).send({
                    msg: `Ya existe un invitado recurrente con el dni ${body.dni} para el country ${property?.name || 'desconocido'}`,
                    guest: exists
                });
            }

            // Crear recurrente con status true
            const recurrent = await Recurrent.create({ ...body, status: true });
            return res.json({
                msg: "El invitado recurrente se cargó con éxito",
                recurrent
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                msg: "No se pudo insertar el invitado recurrente, intente de nuevo.",
                error
            });
        }
    }

    public async changeStatus(req: Request, res: Response) {
        const recurrentID = Number(req.params.id_recurrent);
        const { status } = req.body;
        if (isNaN(recurrentID)) return res.status(400).json({ msg: "ID de recurrente inválido" });
        try {
            const changed = await Recurrent.update({ status }, {
                where: { id: recurrentID }
            });
            return res.json(changed);
        } catch (error) {
            return res.status(500).send(error);
        }
    }
}
export default RecurrentController;
