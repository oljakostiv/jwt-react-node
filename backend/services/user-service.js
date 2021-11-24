const bcrypt = require('bcrypt');
const { v4 } = require('uuid');
const UserModel = require('../databases/user-db');
const { sendActivationMail } = require('./mail-service');
const { generateTokensPair, saveRefreshToken, removeToken, validateRefreshToken, findToken } = require('./token-service');
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
    };

    async login(email, password) {
        const user = await UserModel.findOne({ email });

        if (!user) {
            throw ApiError.BadRequest('User is not exist! Or email or password is wrong');
        }

        const isPassEquals = await bcrypt.compare(password, user.password);

        if (!isPassEquals) {
            throw ApiError.BadRequest('User is not exist! Or email or password is wrong');
        }

        const userDTO = new UserDTO(user);

        const tokensPair = generateTokensPair({ ...userDTO });
        await saveRefreshToken(userDTO.id, tokensPair.refreshToken);

        return {
            ...tokensPair,
            user: userDTO
        };
    };

    async logout (refreshToken) {
        const token = await removeToken(refreshToken);
        return token;
    };

    async refresh (refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }

        const tokenData = validateRefreshToken(refreshToken);

        const tokenFromDb = await findToken(refreshToken);

        if (!tokenData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }

        const user = await UserModel.findById(tokenData.id);
        const userDTO = new UserDTO(user);

        const tokensPair = generateTokensPair({ ...userDTO });
        await saveRefreshToken(userDTO.id, tokensPair.refreshToken);

        return {
            ...tokensPair,
            user: userDTO
        };
    };

    async getUsers() {
        const users = await UserModel.find();
        return users;
    }
}

module.exports = new UserService();
