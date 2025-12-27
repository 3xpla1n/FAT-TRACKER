// Конфигурация API
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Анализирует фото еды через OpenAI Vision API
 * @param {File|Blob} imageFile - Файл изображения
 * @param {string} apiKey - API ключ OpenAI
 * @returns {Promise<Object>} - Объект с информацией о еде (калории, БЖУ)
 */
export async function analyzeFoodImage(imageFile, apiKey) {
  if (!apiKey) {
    throw new Error('OpenAI API key is required. Please set it in the settings.');
  }

  // Конвертируем файл в base64
  const base64Image = await fileToBase64(imageFile);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Проанализируй это фото еды и определи:
1. Название блюда/продукта
2. Примерное количество калорий (ккал)
3. Белки (г)
4. Жиры (г)
5. Углеводы (г)

Ответь ТОЛЬКО в формате JSON без дополнительного текста:
{
  "name": "название блюда",
  "calories": число,
  "proteins": число,
  "fats": число,
  "carbs": число
}

Если не можешь определить точные значения, укажи примерные на основе типичных порций.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from API');
    }

    // Парсим JSON из ответа
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from API response');
    }

    const foodData = JSON.parse(jsonMatch[0]);

    // Валидация и нормализация данных
    return {
      name: foodData.name || 'Неизвестное блюдо',
      calories: Math.round(foodData.calories || 0),
      proteins: Math.round((foodData.proteins || 0) * 10) / 10,
      fats: Math.round((foodData.fats || 0) * 10) / 10,
      carbs: Math.round((foodData.carbs || 0) * 10) / 10
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

/**
 * Конвертирует файл в base64 строку
 * @param {File|Blob} file - Файл для конвертации
 * @returns {Promise<string>} - Base64 строка
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Сохраняет API ключ в localStorage
 */
export function saveApiKey(apiKey) {
  localStorage.setItem('openai-api-key', apiKey);
}

/**
 * Получает сохраненный API ключ
 */
export function getApiKey() {
  return localStorage.getItem('openai-api-key') || '';
}

