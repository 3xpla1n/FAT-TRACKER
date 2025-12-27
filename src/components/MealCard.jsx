export function MealCard({ meal, onDelete }) {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="meal-card">
      <div className="meal-header">
        <h3 className="meal-name">{meal.name}</h3>
        {onDelete && (
          <button
            className="btn-delete"
            onClick={() => onDelete(meal.id)}
            aria-label="Удалить"
          >
            🗑️
          </button>
        )}
      </div>
      
      {meal.imageUrl && (
        <div className="meal-image">
          <img src={meal.imageUrl} alt={meal.name} />
        </div>
      )}

      <div className="meal-nutrition">
        <div className="nutrition-item">
          <span className="nutrition-label">Калории</span>
          <span className="nutrition-value calories">{meal.calories} ккал</span>
        </div>
        <div className="nutrition-grid">
          <div className="nutrition-item">
            <span className="nutrition-label">Белки</span>
            <span className="nutrition-value">{meal.proteins} г</span>
          </div>
          <div className="nutrition-item">
            <span className="nutrition-label">Жиры</span>
            <span className="nutrition-value">{meal.fats} г</span>
          </div>
          <div className="nutrition-item">
            <span className="nutrition-label">Углеводы</span>
            <span className="nutrition-value">{meal.carbs} г</span>
          </div>
        </div>
      </div>

      <div className="meal-time">
        {formatDate(meal.timestamp)}
      </div>
    </div>
  );
}

