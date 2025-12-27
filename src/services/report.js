import { storageService } from './storage';

/**
 * Генерирует текстовый отчет за день
 * @param {Date} date - Дата для отчета (по умолчанию сегодня)
 * @returns {string} - Текст отчета
 */
export function generateDailyReport(date = new Date()) {
  const meals = storageService.getMealsByDate(date);
  const stats = storageService.getDailyStats(date);

  if (meals.length === 0) {
    return `Отчет за ${formatDate(date)}\n\nНет данных за этот день.`;
  }

  const dateStr = formatDate(date);
  let report = `═══════════════════════════════════════\n`;
  report += `   ОТЧЕТ О ПИТАНИИ\n`;
  report += `   ${dateStr}\n`;
  report += `═══════════════════════════════════════\n\n`;

  // Список приемов пищи
  report += `ПРИЕМЫ ПИЩИ:\n`;
  report += `${'─'.repeat(40)}\n\n`;

  meals.forEach((meal, index) => {
    const time = formatTime(meal.timestamp);
    report += `${index + 1}. ${meal.name}\n`;
    report += `   Время: ${time}\n`;
    report += `   Калории: ${meal.calories} ккал\n`;
    report += `   Белки: ${meal.proteins} г | Жиры: ${meal.fats} г | Углеводы: ${meal.carbs} г\n`;
    report += `\n`;
  });

  // Итоговая статистика
  report += `${'─'.repeat(40)}\n`;
  report += `ИТОГО ЗА ДЕНЬ:\n`;
  report += `${'─'.repeat(40)}\n`;
  report += `Всего приемов пищи: ${stats.count}\n`;
  report += `Калории: ${stats.calories} ккал\n`;
  report += `Белки: ${stats.proteins} г\n`;
  report += `Жиры: ${stats.fats} г\n`;
  report += `Углеводы: ${stats.carbs} г\n`;
  report += `\n`;
  report += `═══════════════════════════════════════\n`;
  report += `Сгенерировано: ${formatDateTime(new Date())}\n`;
  report += `═══════════════════════════════════════\n`;

  return report;
}

/**
 * Скачивает отчет как TXT файл
 * @param {Date} date - Дата для отчета
 */
export function downloadDailyReport(date = new Date()) {
  const report = generateDailyReport(date);
  const dateStr = formatDateForFilename(date);
  const filename = `отчет_${dateStr}.txt`;

  // Создаем blob с UTF-8 BOM для правильного отображения кириллицы
  const blob = new Blob(['\ufeff' + report], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  // Создаем временную ссылку и кликаем по ней
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Очищаем
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Форматирует дату для отображения
 */
function formatDate(date) {
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
}

/**
 * Форматирует дату для имени файла
 */
function formatDateForFilename(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Форматирует время
 */
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Форматирует дату и время
 */
function formatDateTime(date) {
  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

