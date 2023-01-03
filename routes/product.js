const express = require('express');
const { createProduct, getAllProduct, singleProduct, deleteOne, updateProduct } = require('../controllers/product');

const router = express.Router();

const { upload } = require("../utils/fileUpload")
const protect = require('../middlewares/auth');









router.post("/", protect, upload.single("image"), createProduct);
router.get("/getallproducts", protect, getAllProduct);
router.get("/singleproduct/:id", protect, singleProduct);
router.delete("/deleteone/:id", protect, deleteOne);
router.patch("/update/:id", upload.single("image"), protect, updateProduct);



module.exports = router;