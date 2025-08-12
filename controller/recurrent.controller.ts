import { Request, Response } from "express";
// Importamos el objeto 'db' centralizado para acceder a todos los modelos
import db from "../models";
import { RecurrentInterface } from "../interfaces/recurrent.interface";
import { PropertyInterface } from "../interfaces/property.interface";

// Corregimos la desestructuración para usar 'recurrent' y 'property' en minúsculas
const { recurrent, property } = db;

class RecurrentController {

    public async getAll(req: Request, res: Response) {
        try {
            // Usamos los modelos corregidos: 'recurrent' y 'property'
            const recurrents = await recurrent.findAll({
                include: [property],
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
            // Usamos los modelos corregidos: 'recurrent' y 'property'
            const foundRecurrent = await recurrent.findByPk(id, {
                include: property,
                attributes: ['id', 'status', 'guest_name', 'guest_lastname', 'dni']
            });
            if (foundRecurrent) {
                return res.json(foundRecurrent);
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
            // Usamos los modelos corregidos: 'recurrent' y 'property'
            const recurrents_by_country = await recurrent.findAll({
                include: [{
                    model: property,
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
            // Usamos el modelo corregido: 'recurrent'
            const foundRecurrent = await recurrent.findAll({
                where: { id_property }
            });
            return res.json(foundRecurrent);
        } catch (error) {
            return res.status(500).json({ msg: "Error al obtener recurrentes por propiedad", error });
        }
    }

    public async create(req: Request, res: Response) {
        const { body } = req;
        try {
            // Usamos los modelos corregidos: 'recurrent' y 'property'
            const exists = await recurrent.findOne({
                where: {
                    dni: body.dni,
                    id_property: body.id_property
                },
                include: property
            });
            if (exists) {
                const propertyName = exists.get('property') as unknown as PropertyInterface;
                return res.status(400).send({
                    msg: `Ya existe un invitado recurrente con el dni ${body.dni} para el country ${propertyName?.name || 'desconocido'}`,
                    guest: exists
                });
            }

            // Usamos el modelo corregido: 'recurrent'
            const newRecurrent = await recurrent.create({ ...body, status: true });
            return res.json({
                msg: "El invitado recurrente se cargó con éxito",
                recurrent: newRecurrent
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
            // Usamos el modelo corregido: 'recurrent'
            const changed = await recurrent.update({ status }, {
                where: { id: recurrentID }
            });
            return res.json(changed);
        } catch (error) {
            return res.status(500).send(error);
        }
    }
}
export default RecurrentController;