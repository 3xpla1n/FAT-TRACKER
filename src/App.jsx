import { useState, useEffect } from 'react';
import { Camera } from './components/Camera';
import { HistoryList } from './components/HistoryList';
import { analyzeFoodImage, getApiKey, saveApiKey } from './services/openai';
import { storageService } from './services/storage';
import './App.css';

function App() {
  const [meals, setMeals] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [error, setError] = useState(null);
  const [dailyStats, setDailyStats] = useState(null);

  useEffect(() => {
    // Загружаем сохраненные данные
    const savedMeals = storageService.getAllMeals();
    setMeals(savedMeals);
    setDailyStats(storageService.getDailyStats());

    // Проверяем наличие API ключа
    const savedApiKey = getApiKey();
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      setShowApiKeyInput(true);
    }
  }, []);

  const handleCapture = async (imageBlob) => {
    if (!apiKey) {
      setError('Пожалуйста, введите API ключ OpenAI в настройках');
      setShowApiKeyInput(true);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Создаем URL для отображения изображения
      const imageUrl = URL.createObjectURL(imageBlob);

      // Анализируем изображение через OpenAI
      const foodData = await analyzeFoodImage(imageBlob, apiKey);

      // Сохраняем прием пищи
      const meal = storageService.saveMeal({
        ...foodData,
        imageUrl
      });

      // Обновляем состояние
      const updatedMeals = storageService.getAllMeals();
      setMeals(updatedMeals);
      setDailyStats(storageService.getDailyStats());

      setShowCamera(false);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Ошибка при анализе изображения. Проверьте API ключ и подключение к интернету.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteMeal = (id) => {
    if (confirm('Удалить этот прием пищи?')) {
      storageService.deleteMeal(id);
      const updatedMeals = storageService.getAllMeals();
      setMeals(updatedMeals);
      setDailyStats(storageService.getDailyStats());
    }
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      saveApiKey(apiKey);
      setShowApiKeyInput(false);
      setError(null);
    } else {
      setError('API ключ не может быть пустым');
    }
  };

  const handleClearHistory = () => {
    if (confirm('Очистить всю историю? Это действие нельзя отменить.')) {
      storageService.clearAll();
      setMeals([]);
      setDailyStats({ calories: 0, proteins: 0, fats: 0, carbs: 0, count: 0 });
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🍽️ Калории Трекер</h1>
        <div className="header-actions">
          <button
            className="btn-icon"
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            aria-label="Настройки"
            title="Настройки API"
          >
            ⚙️
          </button>
          {meals.length > 0 && (
            <button
              className="btn-icon"
              onClick={handleClearHistory}
              aria-label="Очистить историю"
              title="Очистить историю"
            >
              🗑️
            </button>
          )}
        </div>
      </header>

      {showApiKeyInput && (
        <div className="api-key-modal">
          <div className="modal-content">
            <h2>Настройка API ключа</h2>
            <p className="modal-description">
              Введите ваш OpenAI API ключ. Вы можете получить его на{' '}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                platform.openai.com
              </a>
            </p>
            <input
              type="password"
              className="api-key-input"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSaveApiKey()}
            />
            <div className="modal-actions">
              <button className="btn-primary" onClick={handleSaveApiKey}>
                Сохранить
              </button>
              <button className="btn-secondary" onClick={() => setShowApiKeyInput(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {isAnalyzing && (
        <div className="analyzing-overlay">
          <div className="analyzing-content">
            <div className="spinner"></div>
            <p>Анализирую изображение...</p>
            <p className="analyzing-hint">Это может занять несколько секунд</p>
          </div>
        </div>
      )}

      <main className="app-main">
        <HistoryList
          meals={meals}
          onDeleteMeal={handleDeleteMeal}
          dailyStats={dailyStats}
        />
      </main>

      <button
        className="btn-fab"
        onClick={() => setShowCamera(true)}
        disabled={isAnalyzing}
        aria-label="Сфотографировать еду"
      >
        📷
      </button>

      {showCamera && (
        <Camera
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}

export default App;

