import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class UploadService {
  private s3: S3Client;
  private bucketName: string;
  private publicBucketUrl: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('cloudflare.bucketName')!;
    this.publicBucketUrl = this.configService.get<string>(
      'cloudflare.publicBucketUrl',
    )!;

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: this.configService.get<string>('cloudflare.endpoint')!,
      credentials: {
        accessKeyId: this.configService.get<string>('cloudflare.r2Key')!,
        secretAccessKey: this.configService.get<string>('cloudflare.r2Secret')!,
      },
    });
  }

  async uploadImage(
    image: string,
    imageName: string,
    commerceId: string,
  ): Promise<string> {
    const imageBuffer = Buffer.from(image, 'base64');
    const objectKey = `${imageName}-${commerceId}-${Date.now()}.png`;

    const putCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: objectKey,
      Body: imageBuffer,
      ContentType: 'image/png',
    });

    try {
      await this.s3.send(putCommand);
      const encodedObjectKey = encodeURIComponent(objectKey);
      return `${this.publicBucketUrl}/${encodedObjectKey}`;
    } catch (error) {
      console.error(`Error uploading image: ${error}`);
      return '';
    }
  }
}
