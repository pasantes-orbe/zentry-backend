import bcrypt from "bcrypt";

class PasswordHelper{

    public hash(password: string, salt = 10): string{
        return bcrypt.hashSync(password, salt);
    }

}

export default PasswordHelper;