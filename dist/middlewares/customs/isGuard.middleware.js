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
const UserClass_1 = __importDefault(require("../../classes/UserClass"));
const userExists_middleware_1 = __importDefault(require("./userExists.middleware"));
function isGuard(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const exists = yield (0, userExists_middleware_1.default)(id);
        const isGuard = yield new UserClass_1.default().is("vigilador", id);
        if (!isGuard) {
            throw new Error(`El usuario no es un vigilador`);
        }
    });
}
exports.default = isGuard;
//# sourceMappingURL=isGuard.middleware.js.map