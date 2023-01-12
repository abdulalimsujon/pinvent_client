
const express = require('express');
const { getContract } = require('../controllers/contract');
const protect = require('../middlewares/auth');

const router = express.Router();

router.post('/', protect, getContract)


module.exports = router;