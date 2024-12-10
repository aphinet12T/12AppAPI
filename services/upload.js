const fs = require('fs');
const path = require('path');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('storeImage');

const timestamp = () => {
    const date = new Date();
    return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
};

exports.uploadImage = async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ status: 400, message: err.message });
            }

            const image = req.file;
            const { area } = req.body;

            if (!image) {
                throw new Error('No file uploaded');
            }

            const imageName = `${Date.now()}-${timestamp()}${path.extname(image.originalname)}`;
            const imageDir = path.join(__dirname, '../public/images/stores', area);
            const imageSave = path.join('/stores', area);

            if (!fs.existsSync(imageDir)) {
                await fs.promises.mkdir(imageDir, { recursive: true });
            }

            const imagePath = path.join(imageDir, imageName);
            const pathImg = process.env.CVS_IMG_URI+path.join(imageSave, imageName);
            await fs.promises.writeFile(imagePath, image.buffer);

            res.status(201).json({
                status: 201,
                message: 'Upload Image Successfully',
                data: { ImageName: imageName, path: pathImg },
            });
        });
    } catch (error) {
        res.status(500).json({ status: 501, message: error.message });
    }
}