export function formatDateToDDMMYYYY(dateString) {
    // Создаем объект Date из строки в формате ISO
    const date = new Date(dateString);

    // Извлекаем день, месяц и год
    const day = String(date.getUTCDate()).padStart(2, '0'); // День (с ведущим нулем)
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Месяц (с ведущим нулем, +1 так как месяцы начинаются с 0)
    const year = date.getUTCFullYear(); // Год

    // Формируем строку в формате DD.MM.YYYY
    return `${day}.${month}.${year}`;
}
