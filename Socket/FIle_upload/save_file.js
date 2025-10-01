const fs = require('fs');
const path = require('path');

function save_file(file) {
    if (!file || !file.data) return null;

    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // make unique filename
    const fileName = Date.now() + "-" + file.name;
    const filePath = path.join(uploadDir, fileName);

    // strip base64 prefix (e.g. "data:image/png;base64,")
    const base64Data = file.data.split(";base64,").pop();

    fs.writeFileSync(filePath, base64Data, { encoding: "base64" });

    return {
        url: `/uploads/${fileName}`,
        name: file.name,
        type: file.type,
        size: file.size || null
    };
}

module.exports = save_file;