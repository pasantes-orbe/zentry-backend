// controller/property.controller.ts
import { Request, Response } from "express";
import { Op } from "sequelize";
import { getModels } from "../models/getModels";
import Uploader from "../classes/Uploader";
import { PropertyInterface } from "../interfaces/property.interface"; // Importamos la interfaz del modelo 'Property'
import { UserPropertyInterface } from "../interfaces/user.property.interface"; // Importamos la interfaz del modelo 'UserProperties'

class PropertyController {

  public async getAll(req: Request, res: Response) {
    try {
      const { property, user_properties } = getModels();
      const properties = await property.findAll({
        include: [
          {
            model: user_properties,
            as: 'userProperty' // Usamos el alias consistente 'UserProperties'
          }
        ]
      });
      res.json(properties);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Error al obtener propiedades" });
    }
  }

  public async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { isActive } = req.body as { isActive?: boolean };
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ msg: 'Campo isActive requerido y debe ser booleano' });
    }
    try {
      const { property } = getModels();
      const found = await property.findByPk(id);
      if (!found) {
        return res.status(404).json({ msg: `No existe la propiedad con el id ${id}` });
      }
      const updated = await (found as any).update({ isActive });
      return res.json({ msg: 'Estado actualizado', property: updated });
    } catch (error) {
      return res.status(500).json({ msg: 'Error al actualizar estado' });
    }
  }

  public async search(req: Request, res: Response) {
    const { search } = req.params;

    try {
      const { property } = getModels();
      if (!Number.isInteger(+search)) {
        const properties = await property.findAll({
          where: {
            id_country: req.params.id_country,
            name: { [Op.iLike]: `%${String(search)}%` }
          }
        });

        return res.json(properties);
      }

      const properties = await property.findAll({
        where: {
          id_country: req.params.id_country,
          number: search
        }
      });

      return res.json(properties);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Error en la búsqueda" });
    }
  }

  public async getByID(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const { property, user_properties, user } = getModels();
      const foundProperty = await property.findByPk(id, {
        include: [
          {
            model: user_properties,
            as: 'userProperty', // Usamos el alias consistente 'UserProperties'
            include: [
              {
                model: user,
                as: 'user' // Asumimos 'user' si la tabla pivote lo usa (user_properties.model.ts)
              }
            ]
          }
        ]
      });

      if (foundProperty) {
        return res.json(foundProperty);
      }

      res.status(404).json({
        msg: `No existe la propiedad con el id ${id}`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Error al obtener la propiedad" });
    }
  }

  public async create(req: Request, res: Response) {
    const { body } = req;
    
    console.log("--- DEBUG START: Propiedad a crear ---");
    console.log("req.body:", req.body);
    console.log("req.params:", req.params);
    console.log("req.files (Avatar):", req.files);
    console.log("-------------------------------------");
    
    try {
      const { property } = getModels();
      const propertyNumber = await property.findOne({
        where: {
          number: body.number,
          id_country: body.id_country
        }
      });

      if (propertyNumber) {
        return res.status(400).send({
          msg: `Ya existe una propiedad con el N° ${body.number}`
        });
      }

      // Manejar el caso de que no se suba un avatar
      let secure_url = null;

      if (req.files?.avatar) {
        const { tempFilePath }: any = req.files?.avatar;
        const result = await new Uploader().uploadImage(tempFilePath);
        secure_url = result.secure_url;
      }
      body['avatar'] = secure_url;

      console.log("DATOS LISTOS PARA INSERT:", body);

      const newProperty = await property.create(body);

      console.log("PROPIEDAD CREADA:", newProperty.get('id'));  

      res.json({
        msg: "La propiedad se creó con éxito",
        property: newProperty
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({
        msg: "No se pudo crear la propiedad, intente de nuevo."
      });
    }
  }

  /**
   * Obtiene todas las propiedades de un país, incluyendo los usuarios/propietarios relacionados.
   * La respuesta se mapea a la estructura AGRUPADA { property: {...}, owners: [...] }
   * para coincidir con la Property_OwnerInterface del frontend.
   */
  public async getByCountry(req: Request, res: Response) {
  try {
    const { property, user_properties, user } = getModels();
    const includeInactive = String((req.query as any)?.includeInactive ?? '').toLowerCase() === 'true' || String((req.query as any)?.status ?? '').toLowerCase() === 'all';
    const properties = await property.findAll({
      where: includeInactive
        ? { id_country: req.params.id_country }
        : { id_country: req.params.id_country, isActive: true }
    });

    // 2) Por cada propiedad, trae sus asignaciones en user_properties
    const response = await Promise.all(
      properties.map(async (p: any) => {
        const owners = await user_properties.findAll({
          where: { id_property: p.id },
          include: [{ model: user, as: 'user', attributes: ['id','email','name','lastname','avatar','isActive'], where: { isActive: true }, required: true }]
        });

        // Normalizar avatar del usuario incluido
        const placeholder = 'https://ionicframework.com/docs/img/demos/avatar.svg';
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
        const toAvatarUrl = (val?: string | null) => {
          if (!val) return placeholder;
          const s = String(val);
          if (/^https?:\/\//i.test(s)) return s; // absolute URL
          if (s.startsWith('/')) return s; // relative path
          return cloudName
            ? `https://res.cloudinary.com/${cloudName}/image/upload/${s}`
            : s; // public_id
        };

        const ownersJson = owners.map((o: any) => {
          const j = o.toJSON();
          if (j.user) {
            j.user.avatar = toAvatarUrl(j.user.avatar);
          }
          return j;
        });

        return {
          property: p.toJSON(),            // lo que el front usa como property.property.*
          owners: ownersJson // puede ser []
        };
      })
    );

    return res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener propiedades por país' });
  }
}

  public async getByCountryAll(req: Request, res: Response) {
  try {
    const { property, user_properties, user } = getModels();
    const properties = await property.findAll({
      where: { id_country: req.params.id_country }
    });

    const response = await Promise.all(
      properties.map(async (p: any) => {
        const owners = await user_properties.findAll({
          where: { id_property: p.id },
          include: [{ model: user, as: 'user', attributes: ['id','email','name','lastname','avatar','isActive'], where: { isActive: true }, required: true }]
        });

        const placeholder = 'https://ionicframework.com/docs/img/demos/avatar.svg';
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
        const toAvatarUrl = (val?: string | null) => {
          if (!val) return placeholder;
          const s = String(val);
          if (/^https?:\/\//i.test(s)) return s;
          if (s.startsWith('/')) return s;
          return cloudName
            ? `https://res.cloudinary.com/${cloudName}/image/upload/${s}`
            : s;
        };

        const ownersJson = owners.map((o: any) => {
          const j = o.toJSON();
          if (j.user) {
            j.user.avatar = toAvatarUrl(j.user.avatar);
          }
          return j;
        });

        return {
          property: p.toJSON(),
          owners: ownersJson
        };
      })
    );

    return res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener todas las propiedades por país' });
  }
}

      // NUEVO MÉTODO: Obtiene las propiedades del usuario logueado
    public async getPropertiesByOwner(req: Request, res: Response) {
        // El middleware validateJWT debe haber inyectado el objeto user en req.user
        // Si usas TypeScript, probablemente req.user no exista en la definición de Request por defecto.
        // Asumo que tu validateJWT adjunta req.user.id o req.uid. Usaremos req.uid por convención.
        // SI TU JWT ADJUNTA req.user.id, USA ESA PROPIEDAD EN SU LUGAR.
        const ownerId = (req as any).uid || (req as any).user?.id; // Usamos un fallback si es necesario

        if (!ownerId) {
            return res.status(401).json({ msg: "ID de usuario no encontrado en el token." });
        }

        try {
            // Buscamos las entradas en la tabla intermedia user_properties
            // e incluimos los detalles de la propiedad asociada (Property)
            const { user_properties, property } = getModels();
            const userProperties = await user_properties.findAll({
                where: { id_user: ownerId }, // Buscamos por el ID del usuario logueado
                include: [
                    { 
                        model: property, // Incluimos la tabla Property
                        as: 'property', // Usamos el alias de la relación (debes verificarlo en user_properties.model.ts)
                        attributes: ['id', 'name', 'number', 'address', 'id_country', 'avatar'] // Atributos que necesitamos
                    }
                ]
            });

            // Mapeamos el resultado para obtener solo los objetos Property que se mostrarán en el Front
            // Usamos .toJSON() para serializar los objetos Sequelize correctamente.
            const properties = userProperties
                .filter((up: any) => up?.property)  
                .map((up: any) => up.property.toJSON());


            return res.json(properties);

        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Error al obtener las propiedades del propietario." });
        }
    }

  public async update(req: Request, res: Response) {
    const { name, number, address, isActive } = req.body as { name?: string; number?: string | number; address?: string; isActive?: boolean };
    const { id } = req.params;

    try {
      const { property } = getModels();
      const found = await property.findByPk(id);
      if (!found) {
        return res.status(404).json({ msg: `No existe la propiedad con el id ${id}` });
      }

      const payload: any = {};
      if (typeof name !== 'undefined') payload.name = name;
      if (typeof address !== 'undefined') payload.address = address;
      if (typeof number !== 'undefined') payload.number = number;
      if (typeof isActive !== 'undefined') payload.isActive = isActive;

      await (found as any).update(payload);

      // Devolver la propiedad completa y actualizada
      const updated = await property.findByPk(id);
      return res.json(updated);

    } catch (error) {
      return res.status(500).send({
        msg: "Error en el servidor",
        error
      });
    }
  }

  public async updateAvatar(req: Request, res: Response) {
    const { id } = req.params;
    const files: any = (req as any).files;
    const inputFile: any = files?.file || files?.avatar;

    if (!inputFile || !inputFile.tempFilePath) {
      return res.status(400).json({ msg: 'Campo file requerido' });
    }

    try {
      const { property } = getModels();
      const found = await property.findByPk(id);
      if (!found) {
        return res.status(404).json({ msg: `No existe la propiedad con el id ${id}` });
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      const size = Number(inputFile.size) || 0;
      const mime = String(inputFile.mimetype || '');
      if (size > maxSize) {
        return res.status(413).json({ msg: 'El archivo supera el tamaño máximo de 5MB' });
      }
      if (!/^image\//i.test(mime)) {
        return res.status(400).json({ msg: 'El archivo debe ser una imagen (image/*)' });
      }

      const cloudOk = (!!process.env.CLOUDINARY_URL) || (!!process.env.CLOUDINARY_CLOUD_NAME && !!process.env.CLOUDINARY_API_KEY && !!process.env.CLOUDINARY_API_SECRET);
      if (!cloudOk) {
        return res.status(500).json({ msg: 'Cloudinary no configurado' });
      }

      const tempFilePath = inputFile.tempFilePath;
      const uploader = new Uploader();
      const uploaded: any = await uploader.uploadImage(tempFilePath);
      const secureUrl = uploaded?.secure_url;

      if (!secureUrl) {
        return res.status(500).json({ msg: 'No se pudo obtener URL de la imagen subida' });
      }

      await (found as any).update({ avatar: secureUrl });
      const updated = await property.findByPk(id);
      return res.json(updated);

    } catch (error) {
      console.error('updateAvatar (property) error:', error);
      return res.status(500).json({ msg: 'Error actualizando avatar de la propiedad' });
    }
  }

  public async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const { property } = getModels();
      await property.destroy({
        where: { id }
      });

      return res.json({
        msg: "Eliminado correctamente"
      });

    } catch (error) {
      return res.status(500).send(error);
    }
  }

}

export default PropertyController;
