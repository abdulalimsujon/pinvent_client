
const { readdirSync } = require("fs");
const path = require("path");
const express = require('express');
const app = express();

const helmet = require('helmet')
const mongoose = require('mongoose')
require("dotenv").config();

const morgan = require("morgan");
const cors = require('cors');
const cookieParser = require("cookie-parser");
const errorHandler = require("./middlewares/errorHandler");


// middlewares
app.use(helmet())
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json())
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cors());


// routes middleware
readdirSync("./routes").map(r => app.use("/api/v1", require(`./routes/${r}`)))

//error handler
app.use(errorHandler);

mongoose
    .connect(process.env.DATABASE)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('app is running on port ', process.env.PORT)
        })

    })
    .catch((error) => {
        console.log('the database error', error)
    })
