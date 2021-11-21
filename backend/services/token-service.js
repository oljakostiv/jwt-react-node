const jwt = require('jsonwebtoken');
const TokenModel = require('../databases/token-db');

class TokenService {
    generateTokensPair(payload) {
        const accessToken = jwt.sign(payload, process.env.ACCESS_SEKRET_KEY, { expiresIn: '15m' });
        const refreshToken = jwt.sign(payload, process.env.REFRESH_SEKRET_KEY, { expiresIn: '30d' });

        return {
            accessToken,
            refreshToken
        };
    };

    async saveRefreshToken(userId, refreshToken) {
        const findToken = await TokenModel.findOne({ user: userId });

        if (findToken) {
            findToken.refreshToken = refreshToken;
            return findToken.save();
        }

        const token = await TokenModel.create({ user: userId, refreshToken });
        return token;
    }
}

module.exports = new TokenService();
