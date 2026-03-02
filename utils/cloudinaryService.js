const cloudinary = require("../config/cloudinary");

class CloudinaryService {
  async uploadImage(fileBuffer, folder = "myopia-examinations") {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "image" },
        (error, result) => {
          if (error) return reject(new Error("Failed to upload image to Cloudinary"));
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );
      uploadStream.end(fileBuffer);
    });
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
