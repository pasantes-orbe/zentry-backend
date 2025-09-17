// controller/reservations.controller.ts
import { Request, Response } from "express";
// Importamos el objeto 'db' centralizado
import db from "../models";
import Server from "../models/server"; // Asumimos que esta clase tiene el socket.io
import io from "../sockets/controller"; // ¡Esta importación no es necesaria!

const createReservation = async (req: Request, res: Response) => {
  try {
    // 1. Lógica para guardar la nueva reserva en la base de datos
    const newReservation = await db.reservation.create(req.body);

    // 2. Crear y guardar la notificación en la base de datos
    const newNotification = await db.notification.create({
      id_user: req.body.ownerId, // O el ID del administrador
      title: 'Nueva reserva recibida',
      content: `Se ha solicitado una reserva para ${req.body.amenity}.`,
      // ...otros campos de la notificación
    });

    // 3. Emitir el evento de WebSocket a todos los clientes conectados
    // Accedemos a la instancia de socket.io desde la clase Server
    const serverInstance = Server.instance; // Asumimos que hay una propiedad 'instance' o similar
    serverInstance.io.emit('new-notification', newNotification);

    // 4. Enviar una respuesta al frontend para confirmar que todo salió bien
    res.status(201).json(newReservation);
  } catch (error) {
    console.error('Error al crear la reserva:', error);
    res.status(500).json({ error: 'Error al crear la reserva.' });
  }
};