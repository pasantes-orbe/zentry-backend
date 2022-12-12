"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Uploader_1 = __importDefault(require("../classes/Uploader"));
const property_model_1 = __importDefault(require("../models/property.model"));
class PropertyController {
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const properties = yield property_model_1.default.findAll();
            res.json(properties);
        });
    }
    search(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const properties = yield property_model_1.default.findAll({
                where: {
                    id_country: req.params.id_country,
                    $or: [
                        {
                            name: {
                                // [Op.like]: `%${req.params.search}%`
                                [sequelize_1.Sequelize.Op.iLike]: `%${req.params.search}%`
                            }
                        },
                        {
                            number: req.params.search
                        }
                    ]
                }
            });
            res.json(properties);
        });
    }
    getByID(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const property = yield property_model_1.default.findByPk(id);
            if (property) {
                return res.json(property);
            }
            res.status(404).json({
                msg: `No existe la propiedad con el id ${id}`,
            });
        });
    }
    create(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { body } = req;
            const propertyNumber = yield property_model_1.default.findOne({
                where: {
                    "number": body.number,
                    "id_country": body.id_country
                }
            });
            if (propertyNumber) {
                return res.status(400).send({
                    msg: `Ya existe una propiedad con el N° ${body.number}`
                });
            }
            try {
                const { tempFilePath } = (_a = req.files) === null || _a === void 0 ? void 0 : _a.avatar;
                const { secure_url } = yield new Uploader_1.default().uploadImage(tempFilePath);
                body['avatar'] = secure_url;
                const property = new property_model_1.default(body);
                yield property.save();
                res.json({
                    msg: "La propiedad se creo con exito",
                    property
                });
            }
            catch (error) {
                console.log(error);
                res.status(500).json({
                    msg: "No se pudo crear la propiedad, intente de nuevo."
                });
            }
        });
    }
}
exports.default = PropertyController;
//# sourceMappingURL=property.controller.js.map