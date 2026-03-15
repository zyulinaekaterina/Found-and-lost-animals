import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from fastapi import HTTPException
import os
from app.core.config import settings

class MinioService:
    def __init__(self):
        self.client = boto3.client(
            's3',
            endpoint_url=f"http://{settings.MINIO_ENDPOINT}",
            aws_access_key_id=settings.MINIO_ACCESS_KEY,
            aws_secret_access_key=settings.MINIO_SECRET_KEY,
            config=Config(signature_version='s3v4'),
            verify=False
        )
        self.bucket = settings.MINIO_BUCKET
        self._ensure_bucket()

    def _ensure_bucket(self):
        try:
            self.client.head_bucket(Bucket=self.bucket)
        except ClientError:
            self.client.create_bucket(Bucket=self.bucket)

    def upload_file(self, file_data: bytes, object_name: str, content_type: str = "image/jpeg"):
        """Загружает файл в MinIO и возвращает имя объекта"""
        try:
            self.client.put_object(
                Bucket=self.bucket,
                Key=object_name,
                Body=file_data,
                ContentType=content_type
            )
            return object_name
        except ClientError as e:
            raise HTTPException(status_code=500, detail=f"MinIO upload failed: {str(e)}")

    def get_presigned_url(self, object_name: str, expires_in: int = 3600):
        """Возвращает временную ссылку на объект"""
        try:
            url = self.client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket, 'Key': object_name},
                ExpiresIn=expires_in
            )
            return url
        except ClientError as e:
            raise HTTPException(status_code=500, detail=f"MinIO URL generation failed: {str(e)}")

    def delete_file(self, object_name: str):
        """Удаляет файл из MinIO"""
        try:
            self.client.delete_object(Bucket=self.bucket, Key=object_name)
        except ClientError as e:
            raise HTTPException(status_code=500, detail=f"MinIO delete failed: {str(e)}")

# Создаём глобальный экземпляр
minio_service = MinioService()