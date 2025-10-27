// controller/property.controller.ts
import { Request, Response } from "express";
import { Op } from "sequelize";
// Importamos el objeto 'db' centralizado para acceder a todos los modelos
import db from "../models";
import Uploader from "../classes/Uploader";
import { PropertyInterface } from "../interfaces/property.interface"; // Importamos la interfaz del modelo 'Property'
import { UserPropertyInterface } from "../interfaces/user.property.interface"; // Importamos la interfaz del modelo 'UserProperties'

// Corregimos la desestructuración para usar 'property' y 'user_properties' en minúsculas
const { property, user_properties, user } = db;

class PropertyController {

  public async getAll(req: Request, res: Response) {
    try {
      const properties = await property.findAll({
        include: [
          {
            model: user_properties,
            as: 'UserProperties' // 🟢 Usamos el alias consistente 'UserProperties'
          }
        ]
      });
      res.json(properties);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Error al obtener propiedades" });
    }
  }

  public async search(req: Request, res: Response) {
    const { search } = req.params;

    try {
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
      const foundProperty = await property.findByPk(id, {
        include: [
          {
            model: user_properties,
            as: 'UserProperties', // 🟢 Usamos el alias consistente 'UserProperties'
            include: [
              {
                model: user,
                as: 'user' // 🟢 Asumimos 'user' si la tabla pivote lo usa (user_properties.model.ts)
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

      // ✅ Manejar el caso de que no se suba un avatar
      let secure_url = null;

      if (req.files?.avatar) {
        const { tempFilePath }: any = req.files?.avatar;
        const result = await new Uploader().uploadImage(tempFilePath);
        secure_url = result.secure_url;
      }
      body['avatar'] = secure_url;

      console.log("DATOS LISTOS PARA INSERT:", body);

      const newProperty = await property.create(body);

      console.log("PROPIEDAD CREADA:", newProperty.id);

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
    // 1) Trae TODAS las propiedades del country (asignadas o no)
    const properties = await property.findAll({
      where: { id_country: req.params.id_country }
    });

    // 2) Por cada propiedad, trae sus asignaciones en user_properties
    const response = await Promise.all(
      properties.map(async (p: any) => {
        const owners = await user_properties.findAll({
          where: { id_property: p.id },
          include: [{ model: user, as: 'user', attributes: ['id','email','name','lastname','avatar'] }]
        });

        // Normalizar avatar del usuario incluido
        const placeholder = 'https://ionicframework.com/docs/img/demos/avatar.svg';
        const cloudName = 'dkfzxplwp';
        const toAvatarUrl = (val?: string | null) => {
          if (!val) return placeholder;
          const s = String(val);
          if (/^https?:\/\//i.test(s)) return s; // absolute URL
          if (s.startsWith('/')) return s; // relative path
          return `https://res.cloudinary.com/${cloudName}/image/upload/${s}`; // public_id
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

      // 🟢 NUEVO MÉTODO: Obtiene las propiedades del usuario logueado
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
                .filter(up => up.property)
                .map(up => up.property.toJSON()); // Convertimos a JSON

            return res.json(properties);

        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Error al obtener las propiedades del propietario." });
        }
    }

  public async update(req: Request, res: Response) {
    const { name, number, address } = req.body;
    let avatar = req.files?.avatar;
    let avatarEdit: string = "";
    const { id } = req.params;

    try {
      if (avatar) {
        const { tempFilePath }: any = req.files?.avatar;
        const { secure_url } = await new Uploader().uploadImage(tempFilePath);
        avatarEdit = secure_url;
      }

      await property.update({
        name,
        number,
        address,
        avatar: avatarEdit
      }, { where: { id } });

      return res.json({
        msg: "Actualizado correctamente",
      });

    } catch (error) {
      return res.status(500).send({
        msg: "Error en el servidor",
        error
      });
    }
  }

  public async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
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

/* 24-8import { Request, Response } from "express";
import { Op } from "sequelize";
// Importamos el objeto 'db' centralizado para acceder a todos los modelos
import db from "../models";
import Uploader from "../classes/Uploader";
import { PropertyInterface } from "../interfaces/property.interface"; // Importamos la interfaz del modelo 'Property'
import { UserPropertyInterface } from "../interfaces/user.property.interface"; // Importamos la interfaz del modelo 'UserProperties'

// Corregimos la desestructuración para usar 'property' y 'user_properties' en minúsculas
const { property, user_properties } = db;

class PropertyController {
  public async getAll(req: Request, res: Response) {
    const properties = await property.findAll();
    res.json(properties);
  }

  public async search(req: Request, res: Response) {
    const { search } = req.params;
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
  }

  public async getByID(req: Request, res: Response) {
    const { id } = req.params;
    const foundProperty = await property.findByPk(id);
    if (foundProperty) {
      return res.json(foundProperty);
    }
    res.status(404).json({
      msg: `No existe la propiedad con el id ${id}`,
    });
  }

  public async create(req: Request, res: Response) {
    const { body } = req;
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
    try {
      const { tempFilePath }: any = req.files?.avatar;
      const { secure_url } = await new Uploader().uploadImage(tempFilePath);
      body['avatar'] = secure_url;
      const newProperty = await property.create(body);
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

  public async getByCountry(req: Request, res: Response) {
    const properties = await property.findAll({
      where: {
        id_country: req.params.id_country
      }
    });

    const response = await Promise.all(
      // Añadimos el tipo de dato 'PropertyInterface' al parámetro 'property'
      properties.map(async (p: PropertyInterface) => {
        const owners = await user_properties.findAll({
          where: { id_property: p.id } // Usamos 'p.id' para acceder al id
        });
        return {
          property: p,
          owners
        };
      })
    );
    return res.json(response);
  }

  public async update(req: Request, res: Response) {
    const { name, number, address } = req.body;
    let avatar = req.files?.avatar;
    let avatarEdit: string = "";
    const { id } = req.params;
    try {
      if (avatar) {
        const { tempFilePath }: any = req.files?.avatar;
        const { secure_url } = await new Uploader().uploadImage(tempFilePath);
        avatarEdit = secure_url;
      }
      await property.update({
        name,
        number,
        address,
        avatar: avatarEdit
      }, { where: { id } });
      return res.json({
        msg: "Actualizado correctamente",
      });
    } catch (error) {
      return res.status(500).send({
        msg: "Error en el servidor",
        error
      });
    }
  }

  public async delete(req: Request, res: Response) {
    const { id } = req.params;
    try {
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
export default PropertyController;*/


/*import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { Op, Sequelize } from "sequelize";
import Uploader from "../classes/Uploader";
import Property from "../models/property.model";
import UserProperties from "../models/user_properties.model";

class PropertyController {
    public async getAll(req: Request, res: Response) {
        const properties = await Property.findAll();
        res.json(properties);
    }
    public async search(req: Request, res: Response) {
        const { search } = req.params;
        if (!Number.isInteger(+search)) {
            const properties = await Property.findAll({
                where: {
                    id_country: req.params.id_country,
                    name: { [Sequelize.Op.iLike]: `%${String(req.params.search)}%` }
                }
            });
            return res.json(properties);
        }
        const properties = await Property.findAll({
            where: {
                id_country: req.params.id_country,
                number: search
            }
        });
        return res.json(properties);
    }

    public async getByID(req: Request, res: Response) {
        const { id } = req.params;
        const property = await Property.findByPk(id);
        if (property) {
            return res.json(property);
        }
        res.status(404).json({
            msg: `No existe la propiedad con el id ${id}`,
        });
    }
    public async create(req: Request, res: Response) {
        const { body } = req;
        const propertyNumber = await Property.findOne({
            where: {
                "number": body.number,
                "id_country": body.id_country
            }
        })
        if (propertyNumber) {
            return res.status(400).send({
                msg: `Ya existe una propiedad con el N° ${body.number}`
            })
        }
        try {
            const { tempFilePath }: any = req.files?.avatar;
            const { secure_url } = await new Uploader().uploadImage(tempFilePath);
            body['avatar'] = secure_url;
            const property = new Property(body);
            await property.save();
            res.json({
                msg: "La propiedad se creo con exito",
                property
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: "No se pudo crear la propiedad, intente de nuevo."
            })
        }
    }
    public async getByCountry(req: Request, res: Response) {
        // Obtiene todas las propiedades
        const properties = await Property.findAll({
            where: {
                id_country: req.params.id_country
            }
        });
        // Crea una promesa por cada iteración del map para que lea los valores asíncronos.
        const response = await Promise.all(
            properties.map(async (property) => {
                const owners = await UserProperties.findAll({
                    where: { id_property: property.id }
                })
                return {
                    property,
                    owners
                };
            })
        )
        return res.json(response);
    }
    public async update(req: Request, res: Response) {
        const { name, number, address } = req.body;
        let avatar = req.files?.avatar;
        let avatarEdit: string = "";
        const { id } = req.params;
        const property = await Property.findOne({
            where: { "id_country": id }
        });
        try {
            if (avatar) {
                const { tempFilePath }: any = req.files?.avatar;
                const { secure_url } = await new Uploader().uploadImage(tempFilePath);
                avatarEdit = secure_url;
            }
            console.log(avatar);
            const property_update = await Property.update({
                name,
                number,
                address,
                avatar: avatarEdit
            }, { where: { id } });
            return res.json({
                msg: "Actualizado correctamente",
            })
            
        } catch (error) {
            return res.status(500).send({
                msg: "Error en el servidor",
                error
            })
        }
    }

    public async delete(req: Request, res: Response){
        const { id } = req.params;
        try {
            const deleted = await Property.destroy({
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
export default PropertyController;*/

