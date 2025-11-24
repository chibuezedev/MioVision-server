const cloudinary = require("../config/cloudinary");
const fs = require("fs");

class CloudinaryService {
  async uploadImage(filePath, folder = "myopia-examinations") {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: folder,
        resource_type: "image",
      });

      fs.unlinkSync(filePath);

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw new Error("Failed to upload image to Cloudinary");
    }
  }

  async deleteImage(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error("Failed to delete image from Cloudinary:", error);
    }
  }
}

module.exports = new CloudinaryService();
