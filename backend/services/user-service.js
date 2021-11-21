const bcrypt = require('bcrypt');
const { v4 } = require('uuid');
const UserModel = require('../databases/user-db');
const { sendActivationMail } = require('./mail-service');
const { generateTokensPair, saveRefreshToken } = require('./token-service');
const UserDTO = require('../dtos/user-dto');

class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({ email });

        if (candidate) {
            throw new Error(`User with email ${ email } is exist`);
        }

        const hashPassword = await bcrypt.hash(password, 5);
        const activationLink = v4();
        const user = await UserModel.create({ email, password: hashPassword, activationLink });

        await sendActivationMail(email, `${ process.env.API_ACTIVATE_URL }/${ activationLink }`);

        const userDTO = new UserDTO(user);
        const tokensPair = generateTokensPair({ ...userDTO });
        await saveRefreshToken(userDTO.id, tokensPair.refreshToken);

        return {
            ...tokensPair,
            user: userDTO
        };
    }
}

module.exports = new UserService();
