const { timestamp } = require('./utility')
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage }).array('storeImages', 10)

const uploadFiles = async (files, basePath, subFolder = '') => {
    const uploadedFiles = await Promise.all(
        files.map(async (file) => {

            const imageName = `${Date.now()}-${timestamp()}${path.extname(file.originalname)}`

            const targetDir = path.join(basePath, subFolder)
            if (!fs.existsSync(targetDir)) {
                await fs.promises.mkdir(targetDir, { recursive: true })
            }

            const filePath = path.join(targetDir, imageName)
            const publicPath = path.join('/', subFolder, imageName)

            await fs.promises.writeFile(filePath, file.buffer)

            return {
                name: imageName,
                path: process.env.CVS_IMG_URI + publicPath, 
                fullPath: filePath, 
            };
        })
    );

    return uploadedFiles
};

module.exports = { uploadFiles }