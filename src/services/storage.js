const STORAGE_KEY = 'fat-tracker-meals';

export const storageService = {
  // Получить все приемы пищи
  getAllMeals() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from storage:', error);
      return [];
    }
  },

  // Сохранить прием пищи
  saveMeal(meal) {
    try {
      const meals = this.getAllMeals();
      const newMeal = {
        ...meal,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      };
      meals.unshift(newMeal); // Добавляем в начало
      localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
      return newMeal;
    } catch (error) {
      console.error('Error saving to storage:', error);
      throw error;
    }
  },

  // Удалить прием пищи
  deleteMeal(id) {
    try {
      const meals = this.getAllMeals();
      const filtered = meals.filter(meal => meal.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting from storage:', error);
      return false;
    }
  },

  // Получить статистику за день
  getDailyStats(date = new Date()) {
    const meals = this.getAllMeals();
    const dateStr = date.toISOString().split('T')[0];
    
    const dayMeals = meals.filter(meal => {
      const mealDate = new Date(meal.timestamp).toISOString().split('T')[0];
      return mealDate === dateStr;
    });

    return dayMeals.reduce((stats, meal) => {
      stats.calories += meal.calories || 0;
      stats.proteins += meal.proteins || 0;
      stats.fats += meal.fats || 0;
      stats.carbs += meal.carbs || 0;
      stats.count += 1;
      return stats;
    }, { calories: 0, proteins: 0, fats: 0, carbs: 0, count: 0 });
  },

  // Получить приемы пищи за день
  getMealsByDate(date = new Date()) {
    const meals = this.getAllMeals();
    const dateStr = date.toISOString().split('T')[0];
    
    return meals.filter(meal => {
      const mealDate = new Date(meal.timestamp).toISOString().split('T')[0];
      return mealDate === dateStr;
    }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  },

  // Очистить все данные
  clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }
};

