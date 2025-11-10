// controller/authorizations.controller.ts
import { Request, Response } from "express";
import { Op } from "sequelize";
import { getModels } from "../models/getModels";

// Util simple para ventana del día actual si no pasan rango
const getTodayWindow = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export default class AuthorizationsController {
  public async getPendingCheckin(req: Request, res: Response) {
    try {
      const { recurrent, reservation, invitation, checkin, property } = getModels() as any;

      const id_country = req.query.id_country ? Number(req.query.id_country) : undefined;
      const id_property = req.query.id_property ? Number(req.query.id_property) : undefined;
      const fromParam = req.query.from as string | undefined;
      const toParam = req.query.to as string | undefined;

      if (Number.isNaN(id_country as number) && Number.isNaN(id_property as number)) {
        return res.status(400).json({
          msg: "Debe especificar al menos id_country o id_property para filtrar",
        });
      }

      const window = (fromParam && toParam)
        ? { start: new Date(fromParam), end: new Date(toParam) }
        : getTodayWindow();

      // 1) Check-ins abiertos (para evitar duplicar ingresos): tomamos DNIs con check_out = false
      const openCheckins = await checkin.findAll({
        attributes: ["DNI"],
        where: { check_out: false },
      });
      const openDNI = new Set<string>(openCheckins.map((c: any) => String(c.DNI)));

      // Utilidad: ¿está autorizado para el día actual?
      const dayName = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase(); // e.g. "sat"
      const esToEn: Record<string, string> = { lunes: 'mon', martes: 'tue', miercoles: 'wed', miércoles: 'wed', jueves: 'thu', viernes: 'fri', sabado: 'sat', sábado: 'sat', domingo: 'sun' };
      const normDays = (s?: string) =>
        String(s || '')
          .toLowerCase()
          .replace(/\s+/g, '')
          .split(',')
          .map((d) => (esToEn[d] ? esToEn[d] : d))
          .filter(Boolean);
      const isAuthorizedToday = (access_days?: string) => {
        const list = normDays(access_days);
        // admitir números 0-6 (dom=0) y alias mon..sun
        const dow = new Date().getDay(); // 0..6 (dom=0)
        return (
          list.includes(dayName) ||
          list.includes(['sun','mon','tue','wed','thu','fri','sat'][dow]) ||
          list.includes(String(dow))
        );
      };

      // 2) Recurrentes activos por país/propiedad (solo los autorizados para HOY)
      const recurrentWhere: any = { status: true };
      if (id_country && !Number.isNaN(id_country)) recurrentWhere.id_country = id_country;
      if (id_property && !Number.isNaN(id_property)) recurrentWhere.id_property = id_property;

      const recurrents = await recurrent.findAll({
        where: recurrentWhere,
        include: property ? [{ model: property, as: "property" }] : [],
      });

      // 3) Reservas con invitaciones
      const reservationWhere: any = {};
      if (id_country && property) {
        // filtrar por country a través de amenity/property si estuviera disponible
        // como fallback, traemos todas en ventana y luego filtramos por country via property de check-in si hiciera falta
      }
      reservationWhere.date = { [Op.gte]: new Date(0) };

      // a) reservas del día/ventana
      const reservationsToday = await reservation.findAll({
        where: {
          date: { [Op.between]: [window.start, window.end] },
        },
        include: [{ model: invitation, as: "invitations" }],
      });

      // b) reservas futuras (fuera de ventana)
      const reservationsFuture = await reservation.findAll({
        where: {
          date: { [Op.gt]: window.end },
        },
        include: [{ model: invitation, as: "invitations" }],
      });

      // 4) Normalizar DTO
      type Item = {
        type: "recurrente" | "invitado";
        source_id: number;
        guest_name: string;
        guest_lastname: string;
        dni: string;
        id_owner?: number;
        id_property?: number;
        id_country?: number;
        scheduled_at?: string;
        available_for_checkin: boolean;
        reason_unavailable?: string;
      };

      const items: Item[] = [];

      // recurrents activos y autorizados hoy
      for (const r of recurrents) {
        const dni = String((r as any).dni);
        // Solo incluir si está autorizado para el día actual
        if (!isAuthorizedToday((r as any).access_days)) continue;
        const available = !openDNI.has(dni);
        // opcional: si tenés reglas de días/horarios, aplicarlas aquí
        items.push({
          type: "recurrente",
          source_id: (r as any).id,
          guest_name: String((r as any).guest_name || ""),
          guest_lastname: String((r as any).guest_lastname || ""),
          dni,
          id_owner: undefined,
          id_property: (r as any).id_property,
          id_country: (r as any).id_country,
          available_for_checkin: available,
          reason_unavailable: available ? undefined : "ya tiene ingreso abierto",
        });
      }

      // invitations de reservas en ventana (disponibles)
      for (const resv of reservationsToday) {
        const resvPlain = (resv as any).get ? (resv as any).get({ plain: true }) : resv;
        const id_owner = resvPlain.id_user;
        const scheduled_at = new Date(resvPlain.date).toISOString();
        const invs: any[] = resvPlain.invitations || [];
        for (const inv of invs) {
          const dni = String(inv.dni);
          const available = !openDNI.has(dni);
          items.push({
            type: "invitado",
            source_id: inv.id,
            guest_name: String(inv.guest_name || ""),
            guest_lastname: String(inv.guest_lastname || ""),
            dni,
            id_owner,
            id_property: undefined,
            id_country: id_country,
            scheduled_at,
            available_for_checkin: available,
            reason_unavailable: available ? undefined : "ya tiene ingreso abierto",
          });
        }
      }

      // invitations de reservas futuras (no disponibles)
      for (const resv of reservationsFuture) {
        const resvPlain = (resv as any).get ? (resv as any).get({ plain: true }) : resv;
        const id_owner = resvPlain.id_user;
        const scheduled_at = new Date(resvPlain.date).toISOString();
        const invs: any[] = resvPlain.invitations || [];
        for (const inv of invs) {
          const dni = String(inv.dni);
          items.push({
            type: "invitado",
            source_id: inv.id,
            guest_name: String(inv.guest_name || ""),
            guest_lastname: String(inv.guest_lastname || ""),
            dni,
            id_owner,
            id_property: undefined,
            id_country: id_country,
            scheduled_at,
            available_for_checkin: false,
            reason_unavailable: "reserva futura",
          });
        }
      }

      // Responder en dos secciones para UX simple
      const pending = items.filter((i) => i.available_for_checkin === true);
      const future = items.filter((i) => i.available_for_checkin === false && i.reason_unavailable === "reserva futura");

      return res.status(200).json({
        pending,
        future,
        window: { start: window.start.toISOString(), end: window.end.toISOString() },
        total: { pending: pending.length, future: future.length },
      });
    } catch (error) {
      console.error("Error en getPendingCheckin:", error);
      return res.status(500).json({ msg: "Error interno al listar pendientes de check-in" });
    }
  }

  public async getRecurrentAttendanceSummary(req: Request, res: Response) {
    try {
      const { recurrent, checkin } = getModels() as any;

      const id_country = req.query.id_country ? Number(req.query.id_country) : undefined;
      const id_property = req.query.id_property ? Number(req.query.id_property) : undefined;
      const fromParam = req.query.from as string | undefined;
      const toParam = req.query.to as string | undefined;

      if (!fromParam || !toParam) {
        return res.status(400).json({ msg: "Parámetros 'from' y 'to' (ISO) son requeridos" });
      }

      const from = new Date(fromParam);
      const to = new Date(toParam);
      if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
        return res.status(400).json({ msg: "Rango de fechas inválido" });
      }

      const dayKey = (d: Date) => d.toISOString().slice(0, 10); // YYYY-MM-DD
      const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
      const rangeDays: string[] = [];
      for (let cur = new Date(from); cur <= to; cur = addDays(cur, 1)) {
        rangeDays.push(dayKey(cur));
      }

      // Normalización de días
      const esToEn: Record<string, string> = { lunes: 'mon', martes: 'tue', miercoles: 'wed', miércoles: 'wed', jueves: 'thu', viernes: 'fri', sabado: 'sat', sábado: 'sat', domingo: 'sun' };
      const normDays = (s?: string) =>
        String(s || '')
          .toLowerCase()
          .replace(/\s+/g, '')
          .split(',')
          .map((d) => (esToEn[d] ? esToEn[d] : d))
          .filter(Boolean);
      const dowAlias = ['sun','mon','tue','wed','thu','fri','sat'];
      const isAuthorized = (access_days: string | undefined, dateStr: string) => {
        const list = normDays(access_days);
        const d = new Date(dateStr + 'T00:00:00.000Z');
        const dow = d.getUTCDay(); // 0..6
        return list.includes(dowAlias[dow]) || list.includes(String(dow));
      };

      // Traer recurrents activos en el ámbito
      const recurrentWhere: any = { status: true };
      if (id_country && !Number.isNaN(id_country)) recurrentWhere.id_country = id_country;
      if (id_property && !Number.isNaN(id_property)) recurrentWhere.id_property = id_property;

      const recurrents = await recurrent.findAll({ where: recurrentWhere });

      // Pre-cargar checkins del rango para DNIs relevantes para minimizar consultas N+1
      const dnis = Array.from(new Set<string>(recurrents.map((r: any) => String(r.dni))));
      let presentByDni = new Map<string, Set<string>>();
      if (dnis.length > 0) {
        const rows = await checkin.findAll({
          attributes: ['DNI', 'income_date', 'check_in'],
          where: {
            DNI: dnis,
            income_date: { [Op.between]: [from, to] },
            // presencia: consideramos check_in=true en ese día
            check_in: true,
          },
        });
        for (const r of rows) {
          const dni = String((r as any).DNI);
          const day = dayKey(new Date((r as any).income_date));
          if (!presentByDni.has(dni)) presentByDni.set(dni, new Set<string>());
          presentByDni.get(dni)!.add(day);
        }
      }

      const summary = recurrents.map((rec: any) => {
        const dni = String(rec.dni);
        const authDays = rangeDays.filter((ds) => isAuthorized(rec.access_days, ds));
        const presentDays = Array.from(presentByDni.get(dni) || []);
        const passed = authDays.filter((d) => presentDays.includes(d));
        const missing = authDays.filter((d) => !presentDays.includes(d));

        return {
          recurrent_id: rec.id,
          guest_name: rec.guest_name,
          guest_lastname: rec.guest_lastname,
          dni,
          id_property: rec.id_property,
          id_country: rec.id_country,
          access_days: rec.access_days,
          days_passed: passed,
          days_missing: missing,
        };
      });

      return res.status(200).json({ from: from.toISOString(), to: to.toISOString(), items: summary });
    } catch (error) {
      console.error('Error en getRecurrentAttendanceSummary:', error);
      return res.status(500).json({ msg: 'Error interno al obtener resumen de asistencia de recurrentes' });
    }
  }
}
