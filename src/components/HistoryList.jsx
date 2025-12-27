import { MealCard } from './MealCard';
import { downloadDailyReport } from '../services/report';

export function HistoryList({ meals, onDeleteMeal, dailyStats }) {
  if (meals.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🍽️</div>
        <h3>История пуста</h3>
        <p>Сфотографируйте свою еду, чтобы начать отслеживать калории</p>
      </div>
    );
  }

  // Группируем по дням
  const groupedMeals = meals.reduce((groups, meal) => {
    const date = new Date(meal.timestamp).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(meal);
    return groups;
  }, {});

  return (
    <div className="history-list">
      {dailyStats && dailyStats.count > 0 && (
        <div className="daily-stats">
          <div className="daily-stats-header">
            <h2>Сегодня</h2>
            <button
              className="btn-download"
              onClick={() => downloadDailyReport()}
              aria-label="Скачать отчет"
              title="Скачать отчет за день"
            >
              📥 Скачать отчет
            </button>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Калории</span>
              <span className="stat-value calories">{dailyStats.calories} ккал</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Белки</span>
              <span className="stat-value">{dailyStats.proteins} г</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Жиры</span>
              <span className="stat-value">{dailyStats.fats} г</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Углеводы</span>
              <span className="stat-value">{dailyStats.carbs} г</span>
            </div>
          </div>
        </div>
      )}

      {Object.entries(groupedMeals).map(([date, dayMeals]) => (
        <div key={date} className="day-group">
          <h3 className="day-header">{date}</h3>
          <div className="meals-container">
            {dayMeals.map(meal => (
              <MealCard
                key={meal.id}
                meal={meal}
                onDelete={onDeleteMeal}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

