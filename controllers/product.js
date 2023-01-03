const asyncHandler = require("express-async-handler");

const Product = require('../models/product');

const createProduct = asyncHandler(async (req, res) => {

    const { name, sku, category, quantity, price, description } = req.body;


    //   Validation
    if (!name || !category || !quantity || !price || !description) {
        res.status(400);
        throw new Error("Please fill in all fields");
    }

    // Handle Image upload
    let fileData = {};
    if (req.file) {

        fileData = {
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            fileSize: req.file.size
        };
    }

    // Create Product
    const product = await Product.create({
        user: req.user.id,
        name,
        sku,
        category,
        quantity,
        price,
        description,
        image: fileData,
    });

    res.status(201).json(product);

});


const getAllProduct = asyncHandler(async (req, res) => {

    const products = await Product.find({ user: req.user.id }).sort("-createAt");

    res.status(200).json(products);

})




module.exports = {
    createProduct,
    getAllProduct
};