const { Router } = require('express');
const router = Router();
const { registration, login, logout, activate, refresh, getUsers} = require('../controllers/user-controller');

router.post('/registration', registration);
router.post('/login', login);
router.post('/logout', logout);
router.get('/activate/:link', activate);
router.get('/refresh', refresh);
router.get('/users', getUsers);

module.exports = router;
