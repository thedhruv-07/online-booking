const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getFactories, createFactory } = require('../controllers/userController');

router.get('/factories', auth, getFactories);
router.post('/factories', auth, createFactory);

router.get('/contacts', auth, require('../controllers/userController').getContacts);
router.post('/contacts', auth, require('../controllers/userController').createContact);

module.exports = router;
