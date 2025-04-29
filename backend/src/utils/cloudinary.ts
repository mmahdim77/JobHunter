import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFile = async (
  file: Express.Multer.File,
  folder: string = 'uploads'
): Promise<{ url: string; public_id: string }> => {
  try {
    // Convert the buffer to base64
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder,
      resource_type: 'auto',
      // Add any additional options here
      use_filename: true,
      unique_filename: true,
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

export const deleteFile = async (public_id: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
};

export const generateSignature = (params: Record<string, any>): string => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  return cloudinary.utils.api_sign_request(
    { timestamp, ...params },
    process.env.CLOUDINARY_API_SECRET || ''
  );
};

export default cloudinary; 