import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export interface MediaFile {
    name: string;
    url: string;
    publicId: string;
}

const FOLDER = 'bosward';

@Injectable()
export class CloudinaryService implements OnModuleInit {
    constructor(private readonly config: ConfigService) { }

    onModuleInit() {
        cloudinary.config({
            cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: this.config.get<string>('CLOUDINARY_API_KEY'),
            api_secret: this.config.get<string>('CLOUDINARY_API_SECRET'),
        });
    }

    upload(file: Express.Multer.File): Promise<MediaFile> {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: FOLDER, resource_type: 'auto' },
                (error, result) => {
                    if (error || !result) return reject(error);
                    resolve({
                        name: file.originalname,
                        url: result.secure_url,
                        publicId: result.public_id,
                    });
                },
            );
            stream.end(file.buffer);
        });
    }

    async list(): Promise<MediaFile[]> {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: `${FOLDER}/`,
            max_results: 100,
        });

        return result.resources.map((resource) => ({
            name: resource.format
                ? `${resource.public_id.split('/').pop()}.${resource.format}`
                : (resource.public_id.split('/').pop() ?? resource.public_id),
            url: resource.secure_url,
            publicId: resource.public_id,
        }));
    }

    async remove(publicId: string): Promise<void> {
        await cloudinary.uploader.destroy(publicId);
    }
}
