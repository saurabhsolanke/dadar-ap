'use server'

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export async function uploadImage(formData: FormData) {
    try {
        const file = formData.get('file');

        if (!file || !(file instanceof File)) {
            throw new Error('No file uploaded or invalid file');
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result = await new Promise<string>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'Home', // Optional: organize uploads in a folder
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error.message);
                    } else {
                        resolve(result?.secure_url || '');
                    }
                }
            );

            uploadStream.end(buffer);
        });

        return { success: true, url: result };
    } catch (error) {
        console.error('Upload action error:', error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
