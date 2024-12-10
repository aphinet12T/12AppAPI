const fs = require('fs')
const path = require('path')

const timestamp = () => {
    const date = new Date()
    return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`
}

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