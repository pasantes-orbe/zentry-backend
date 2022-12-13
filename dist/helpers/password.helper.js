"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const generate_password_1 = __importDefault(require("generate-password"));
class PasswordHelper {
    hash(password, salt = 10) {
        return bcrypt_1.default.hashSync(password, salt);
    }
    generate(length = 10, numbers = true) {
        const password = generate_password_1.default.generate({
            length,
            numbers
        });
        return password;
    }
}
exports.default = PasswordHelper;
//# sourceMappingURL=password.helper.js.map