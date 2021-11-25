const { Router } = require('express');
const router = Router();
const { body } = require('express-validator');
const { registration, login, logout, activate, refresh, getUsers } = require('../controllers/user-controller');
const authMiddleware = require('../middlewares/auth-middleware');

router.post('/registration',
    body('email').isEmail().trim(),
    body('password').trim().isLength({ min: 4, max: 32 }),
    registration);
router.post('/login', login);
router.post('/logout', logout);
router.get('/activate/:link', activate);
router.get('/refresh', refresh);
router.get('/users', authMiddleware, getUsers);

module.exports = router;
