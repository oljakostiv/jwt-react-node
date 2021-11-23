const bcrypt = require('bcrypt');
const { v4 } = require('uuid');
const UserModel = require('../databases/user-db');
const { sendActivationMail } = require('./mail-service');
const { generateTokensPair, saveRefreshToken } = require('./token-service');
const UserDTO = require('../dtos/user-dto');
const ApiError = require('../exceptions/error-api');

class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({ email });

        if (candidate) {
            throw ApiError.BadRequest(`User with email ${ email } is exist`);
        }

        const hashPassword = await bcrypt.hash(password, 5);
        const activationLink = v4();
        const user = await UserModel.create({ email, password: hashPassword, activationLink });

        // await sendActivationMail(email, `${ process.env.API_ACTIVATE_URL }/${ activationLink }`);

        const userDTO = new UserDTO(user);
        const tokensPair = generateTokensPair({ ...userDTO });
        await saveRefreshToken(userDTO.id, tokensPair.refreshToken);

        return {
            ...tokensPair,
            user: userDTO
        };
    }

    async activate(activationLink) {
        const user = UserModel.findOne(activationLink);

        if (!user) {
            throw ApiError.BadRequest('Incorrect activation link');
        }

        user.isActivated = true;
        await user.save();
    }
}

module.exports = new UserService();
