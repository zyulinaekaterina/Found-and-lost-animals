import torch
import torchvision.transforms as T
from PIL import Image
from timm import create_model
from io import BytesIO
import requests

# Конфигурация модели
MODEL_NAME = "vit_base_patch16_224"
EMBEDDING_DIM = 768

device = "cuda" if torch.cuda.is_available() else "cpu"

# Загружаем модель без головы классификации
model = create_model(MODEL_NAME, pretrained=True, num_classes=0)
model = model.eval().to(device)

# Трансформации: как при предобучении
transform = T.Compose([
    T.Resize(256),
    T.CenterCrop(224),
    T.ToTensor(),
    T.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])  # ViT использует [-1, 1] нормализацию
])


def get_embedding_from_image_url(image_url: str) -> list[float]:
    """Получить embedding из изображения по URL"""
    try:
        # Добавляем User-Agent, чтобы обойти блокировку
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        response = requests.get(image_url, timeout=10)
        response.raise_for_status()
        # Проверяем, что контент — изображение
        content_type = response.headers.get('content-type', '')
        if not content_type.startswith('image/'):
            raise ValueError("URL does not point to an image")

        image = Image.open(BytesIO(response.content)).convert("RGB")
        return _get_embedding_from_pil(image)
    except Exception as e:
        raise ValueError(f"Не удалось загрузить или обработать изображение: {e}")


def _get_embedding_from_pil(image: Image.Image) -> list[float]:
    """Внутренняя функция: PIL → embedding"""
    tensor = transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        embedding = model(tensor).cpu().numpy()[0]
    return embedding.tolist()


# Публичная функция
def get_embedding_from_pil(image: Image.Image) -> list[float]:
    """Публичная функция для использования в роутах"""
    return _get_embedding_from_pil(image)