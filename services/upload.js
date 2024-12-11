const fs = require('fs')
const path = require('path')
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage }).array('storeImages', 10)
const { timestamp } = require('../utilitys/utility')

exports.uploadImage = async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ status: 400, message: err.message })
            }

            const images = req.files
            const { area } = req.body

            if (!images || images.length === 0) {
                throw new Error('No files uploaded')
            }

            const imageResponses = await Promise.all(
                images.map(async (image) => {
                    const imageName = `${Date.now()}-${timestamp()}${path.extname(image.originalname)}`
                    const imageDir = path.join(__dirname, '../public/images/stores', area)

                    if (!fs.existsSync(imageDir)) {
                        await fs.promises.mkdir(imageDir, { recursive: true })
                    }

                    const imagePath = path.join(imageDir, imageName);
                    await fs.promises.writeFile(imagePath, image.buffer)

                    return {
                        ImageName: imageName,
                        path: imagePath,
                    };
                })
            );

            res.status(201).json({
                status: 201,
                message: 'Upload Images Successfully',
                data: imageResponses, 
            });
        });
    } catch (error) {
        res.status(500).json({ status: 501, message: error.message })
    }
}