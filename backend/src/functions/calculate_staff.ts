const fs = require('fs');
const readline = require('readline');
const path = require('path');

const officerData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'data', 'officer_data.json'), 'utf8')
);
const nonOfficerData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'data', 'non_officer_data.json'), 'utf8')
);

/**
 * Add new data files
 */
const womanOfficerData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'data', 'woman_officer_data.json'), 'utf8')
);
const womanNonOfficerData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'data', 'woman_non_officer_data.json'), 'utf8')
);

/**
 * Преобразует строку даты из формата DD.MM.YYYY в объект Date
 * @param {string} dateStr - Дата в формате DD.MM.YYYY
 * @returns {Date|null} - Объект Date или null, если дата не указана
 */
function parseDate(dateStr) {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Форматирует объект Date в строку формата DD.MM.YYYY
 * @param {Date} date - Объект даты
 * @returns {string} - Отформатированная дата
 */
function formatDate(date) {
    return date
        .toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
        .replace(/\./g, '.');
}

/**
 * Находит применимый период для указанной даты в данных об имуществе
 * @param {Object} data - Данные об имуществе
 * @param {Date} date - Дата для поиска периода
 * @returns {Object|null} - Найденный период или null
 */
function findApplicablePeriod(data, date) {
    return data.periods.find((period) => {
        const periodStart = period.start_date ? parseDate(period.start_date) : new Date(0);
        const periodEnd = period.end_date ? parseDate(period.end_date) : new Date(9999, 11, 31);
        return date >= periodStart && date <= periodEnd;
    });
}

/**
 * Проверяет, истек ли срок предыдущей выдачи
 * @param {Date} lastIssueDate - Дата последней выдачи
 * @param {number} periodMonths - Период в месяцах
 * @param {Date} currentDate - Текущая дата
 * @returns {boolean} - true если срок истек
 */
function isPreviousIssuanceExpired(lastIssueDate, periodMonths, currentDate) {
    if (!lastIssueDate) return true;
    const expirationDate = new Date(lastIssueDate);
    expirationDate.setMonth(expirationDate.getMonth() + periodMonths);
    return currentDate >= expirationDate;
}

/**
 * Определяет дату первой возможной выдачи предмета
 * @param {Object} item - Данные о предмете
 * @param {Date} workStartDate - Дата начала работы
 * @param {Date} promotionDate - Дата получения звания офицера
 * @param {boolean} isOfficerOnly - Предмет доступен только офицерам
 * @returns {Date} - Дата первой возможной выдачи
 */
function determineFirstAvailableDate(item, workStartDate, promotionDate, isOfficerOnly) {
    // Находим самый ранний период, в котором предмет стал доступен
    const firstPeriod = item.periods[0];
    const periodStartDate = firstPeriod.start_date
        ? parseDate(firstPeriod.start_date)
        : new Date(0);

    // Для предметов, доступных только офицерам
    if (isOfficerOnly) {
        // Выдача не раньше даты получения звания офицера
        const earliestDate = promotionDate > periodStartDate ? promotionDate : periodStartDate;
        return earliestDate > workStartDate ? earliestDate : workStartDate;
    }

    // Для обычных предметов
    return periodStartDate > workStartDate ? periodStartDate : workStartDate;
}

/**
 * Рассчитывает даты выдачи имущества с учетом статуса офицера
 * @param {string} startWorkDate - Дата начала работы
 * @param {string} officerPromotionDate - Дата получения звания офицера
 * @param {string} itemName - Наименование имущества
 * @returns {Object} - Объект с датами выдачи и количеством
 */
function calculateEquipmentDates(startWorkDate, officerPromotionDate, itemName, gender) {
    const workStartDate = parseDate(startWorkDate);
    const promotionDate = parseDate(officerPromotionDate);
    const currentDate = new Date();
    const issuances = [];
    let totalQuantity = 0;

    // Select data based on gender
    const nonOfficerItem =
        gender === 'female'
            ? womanNonOfficerData.find((item) => item.item_name === itemName)
            : nonOfficerData.find((item) => item.item_name === itemName);

    const officerItem =
        gender === 'female'
            ? womanOfficerData.find((item) => item.item_name === itemName)
            : officerData.find((item) => item.item_name === itemName);

    if (!nonOfficerItem && !officerItem) return {issuances: [], totalQuantity: 0};

    // Определяем, доступен ли предмет только офицерам
    const isOfficerOnly = !nonOfficerItem && officerItem;

    // Определяем начальную дату выдачи
    let currentIssueDate;
    if (isOfficerOnly) {
        // Для предметов только для офицеров
        currentIssueDate = determineFirstAvailableDate(
            officerItem,
            workStartDate,
            promotionDate,
            true
        );
    } else {
        // Для обычных предметов
        const relevantItem = nonOfficerItem || officerItem;
        currentIssueDate = determineFirstAvailableDate(
            relevantItem,
            workStartDate,
            promotionDate,
            false
        );
    }

    let lastIssuanceDate = null;

    while (currentIssueDate <= currentDate) {
        // Определяем, какой набор данных использовать
        const isOfficer = currentIssueDate >= promotionDate;
        const currentItem = isOfficer ? officerItem : nonOfficerItem;

        if (!currentItem) break;

        // Находим применимый период
        const applicablePeriod = findApplicablePeriod(currentItem, currentIssueDate);
        if (!applicablePeriod) break;

        // Проверяем, истек ли срок предыдущей выдачи
        if (lastIssuanceDate) {
            const prevPeriod = findApplicablePeriod(
                isOfficer ? nonOfficerItem || officerItem : nonOfficerItem,
                lastIssuanceDate
            );
            if (
                prevPeriod &&
                !isPreviousIssuanceExpired(
                    lastIssuanceDate,
                    prevPeriod.period_months,
                    currentIssueDate
                )
            ) {
                // Если срок не истек, переходим к следующей дате
                currentIssueDate = new Date(lastIssuanceDate);
                currentIssueDate.setMonth(currentIssueDate.getMonth() + prevPeriod.period_months);
                continue;
            }
        }

        // Добавляем выдачу
        issuances.push({
            date: formatDate(currentIssueDate),
            quantity: applicablePeriod.quantity,
            used: 0,
        });
        totalQuantity += applicablePeriod.quantity;

        // Обновляем данные для следующей итерации
        lastIssuanceDate = new Date(currentIssueDate);
        currentIssueDate = new Date(currentIssueDate);
        currentIssueDate.setMonth(currentIssueDate.getMonth() + applicablePeriod.period_months);
    }

    // Get the cash value from the appropriate item
    const cash = isOfficerOnly ? officerItem.cash : nonOfficerItem?.cash || officerItem?.cash;

    return {issuances, totalQuantity, cash};
}

export function processEquipment(startWorkDate, officerPromotionDate, gender) {
    const allItems = new Set([
        ...(gender === 'female' ? womanOfficerData : officerData).map((item) => item.item_name),
        ...(gender === 'female' ? womanNonOfficerData : nonOfficerData).map(
            (item) => item.item_name
        ),
    ]);

    const result = Array.from(allItems).map((itemName) => {
        const itemResult = calculateEquipmentDates(
            startWorkDate,
            officerPromotionDate,
            itemName,
            gender
        );
        return {
            name: itemName,
            issuances: itemResult.issuances,
            totalQuantity: itemResult.totalQuantity,
            cash: itemResult.cash,
        };
    });

    return result;
}

// Example calculation for summer dress
const result = processEquipment('12.02.2012', '12.02.2018', 'female');
const summerDress = result.find((item) => item.name === 'платье летнее');
console.log('Summer Dress Issuances:', summerDress);

// // Создание интерфейса для чтения пользовательского ввода
// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
// });

// // Запрос дат у пользователя и обработка данных
// rl.question('Введите дату начала работы (в формате DD.MM.YYYY): ', (startWorkDate) => {
//     rl.question(
//         'Введите дату получения звания офицера (в формате DD.MM.YYYY): ',
//         (officerPromotionDate) => {
//             const result = processEquipment(startWorkDate, officerPromotionDate);
//             fs.writeFileSync('result.json', JSON.stringify(result, null, 2), 'utf8');
//             console.log('Результат сохранен в файл result.json');
//             rl.close();
//         }
//     );
// });
