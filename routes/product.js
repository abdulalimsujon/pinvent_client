const express = require('express');
const { createProduct, getAllProduct } = require('../controllers/product');

const router = express.Router();

const { upload } = require("../utils/fileUpload")
const protect = require('../middlewares/auth');








router.post("/", protect, upload.single("image"), createProduct);
router.get("/getallproducts", protect, getAllProduct);



module.exports = router;