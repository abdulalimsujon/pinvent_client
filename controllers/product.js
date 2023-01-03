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


//get all product


const getAllProduct = asyncHandler(async (req, res) => {

    const products = await Product.find({ user: req.user.id }).sort("-createAt");

    res.status(200).json(products);

})

// get single product

const singleProduct = asyncHandler(async (req, res) => {

    const id = req.params.id;

    const product = await Product.findById(id);
    if (!product) {
        res.status(404)
        throw new Error('Product doesnt found')
    }

    // Match product to its user

    if (product.user.toString() !== req.user.id) {
        res.status(401)
        throw new Error("user not authorized")
    }


    res.status(200).json(product);


})


// delete the product 

const deleteOne = asyncHandler(async (req, res) => {

    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) {
        res.status(404)
        throw new Error('product not found')
    }
    if (product.user.toString() !== req.user.id) {

        res.status(401)
        throw new Error('Authentication failed')

    }

    await product.remove();

    res.status(200).json({ message: 'delete successful' })
})

const updateProduct = asyncHandler(async (req, res) => {

    const { name, sku, category, quantity, price, description } = req.body;

    const id = req.params.id;

    const product = await Product.findById(id);

    if (!product) {
        res.status(404)
        throw new Error("product not found")
    }

    if (product.user.toString() !== req.user.id) {
        res.status(401)
        throw new Error('Authentication failed')
    }

    const filedata = {}

    if (req.file) {
        filedata = {
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            fileSize: req.file.size
        }
    }


    const updateProduct = await Product.findByIdAndUpdate(
        { _id: id },
        {
            name,
            sku,
            category,
            quantity,
            price,
            description,
            image: Object.keys(filedata).length === 0 ? product?.image : filedata,

        },
        {
            new: true,
            runValidators: true
        }

    )

    res.status(200).json('product updated Successfully')

})


module.exports = {
    createProduct,
    getAllProduct,
    singleProduct,
    deleteOne,
    updateProduct
};