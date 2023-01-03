
const multer = require('multer')



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../upload/image')

    },
    filename: (req, file, cb) => {
        cb(null,
            new Date().toISOString.replace(/./g, "-") + "-" + file.originalname

        )
    }
})

const filefilter = (req, file, cb) => {

    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png'
    ) {
        cb(null, true)

    } else {
        cb(null, false)
    }

}

const upload = multer(storage, filefilter)


module.exports = { upload };