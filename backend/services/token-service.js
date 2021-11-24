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
    };

    async removeToken(refreshToken) {
        const deleteToken = await TokenModel.deleteOne({ refreshToken });
        return deleteToken;
    };

    async findToken(refreshToken) {
        const findToken = await TokenModel.findOne({ refreshToken });
        return findToken;
    };

    async validateAccessToken(token) {
        try {
           const tokenData = jwt.verify(token, process.env.ACCESS_SEKRET_KEY);
           return tokenData;
        } catch (e) {
            return null;
        }
    };

    async validateRefreshToken(token) {
        try {
           const tokenData = jwt.verify(token, process.env.REFRESH_SEKRET_KEY);
           return tokenData;
        } catch (e) {
            return null;
        }
    };
}

module.exports = new TokenService();
