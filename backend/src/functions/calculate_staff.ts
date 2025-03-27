import dayjs, {Dayjs} from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/ru';
import {EquipmentItem, Period} from 'src/types/equipment';

// Импорт данных
const nonOfficerData: EquipmentItem[] = require('../data/non_officer_data.json');
const officerData: EquipmentItem[] = require('../data/officer_data.json');
const womanNonOfficerData: EquipmentItem[] = require('../data/woman_non_officer_data.json');
const womanOfficerData: EquipmentItem[] = require('../data/woman_officer_data.json');

// Инициализация dayjs
dayjs.extend(customParseFormat);
dayjs.locale('ru');

/**
 * Преобразует строку даты в объект Dayjs
 */
function parseDate(date: string | Date): Dayjs {
    if (date instanceof Date) {
        return dayjs(date);
    }
    const parsedDate = dayjs(date, 'DD.MM.YYYY');
    if (!parsedDate.isValid()) {
        console.error('Некорректная дата:', date);
        throw new Error(`Некорректная дата: ${date}`);
    }
    return parsedDate;
}

/**
 * Форматирует дату в строку
 */
function formatDate(date: Dayjs | Date): string {
    return dayjs(date).format('DD.MM.YYYY');
}

/**
 * Находит применимый период для даты выдачи
 * @param item - Предмет обмундирования
 * @param issueDate - Дата выдачи
 * @returns Период выдачи или null, если период не найден
 */
function findApplicablePeriod(
    item: EquipmentItem | undefined,
    issueDate: Dayjs | Date
): Period | null {
    if (!item) return null;

    console.log('Периоды предмета:', item.periods);
    console.log('Поиск периода для даты:', formatDate(issueDate), 'в предмете:', item.item_name);

    const period = item.periods.find((period) => {
        const startDate = period.start_date ? parseDate(period.start_date) : dayjs('1970-01-01');
        const endDate = period.end_date ? parseDate(period.end_date) : dayjs('2100-01-01');
        const issueDateTime = dayjs(issueDate);

        const isInPeriod =
            (issueDateTime.isAfter(startDate) || issueDateTime.isSame(startDate)) &&
            (issueDateTime.isBefore(endDate) || issueDateTime.isSame(endDate));

        console.log('Проверка периода:', {
            periodStart: formatDate(startDate),
            periodEnd: formatDate(endDate),
            isInPeriod,
        });

        return isInPeriod;
    });

    console.log('Найденный период:', period);
    return period;
}

export function calculateEquipmentDates(
    startWorkDate: string,
    officerPromotionDate: string,
    itemName: string,
    gender: 'male' | 'female',
    maternityLeaveStart: string | null = null,
    maternityLeaveDuration: number = 0
) {
    console.log('Начало расчета выдачи для:', {
        startWorkDate,
        officerPromotionDate,
        itemName,
        gender,
    });

    const workStartDate = parseDate(startWorkDate);
    const promotionDate = parseDate(officerPromotionDate);
    const maternityStart = maternityLeaveStart ? parseDate(maternityLeaveStart) : null;
    const currentDate = dayjs();

    const issuances = [];
    let totalQuantity = 0;

    // Выбор данных в зависимости от пола
    const nonOfficerItem =
        gender === 'female'
            ? womanNonOfficerData.find((item) => item.item_name === itemName)
            : nonOfficerData.find((item) => item.item_name === itemName);

    const officerItem =
        gender === 'female'
            ? womanOfficerData.find((item) => item.item_name === itemName)
            : officerData.find((item) => item.item_name === itemName);

    console.log('Найденные предметы:', {
        nonOfficerItem: nonOfficerItem?.item_name,
        officerItem: officerItem?.item_name,
    });

    if (!nonOfficerItem && !officerItem) {
        return {issuances: [], totalQuantity: 0};
    }

    // Определяем начальную дату выдачи
    let currentIssueDate = determineFirstAvailableDate(
        nonOfficerItem || officerItem,
        workStartDate,
        promotionDate,
        !nonOfficerItem && !!officerItem
    );

    console.log('Начальная дата выдачи:', {
        currentIssueDate: formatDate(currentIssueDate),
        workStartDate: formatDate(workStartDate),
        promotionDate: formatDate(promotionDate),
    });

    let lastIssuanceDate = null;

    while (currentIssueDate.isBefore(currentDate) || currentIssueDate.isSame(currentDate)) {
        const isOfficer =
            currentIssueDate.isAfter(promotionDate) || currentIssueDate.isSame(promotionDate);
        const currentItem = isOfficer ? officerItem : nonOfficerItem;

        console.log('Итерация цикла:', {
            currentIssueDate: formatDate(currentIssueDate),
            isOfficer,
            hasItem: !!currentItem,
            itemName: currentItem?.item_name,
        });

        if (!currentItem) {
            console.log('Прерывание: нет текущего предмета');
            break;
        }

        const applicablePeriod = findApplicablePeriod(currentItem, currentIssueDate);
        console.log('Найденный период:', applicablePeriod);

        if (!applicablePeriod) {
            console.log('Прерывание: не найден применимый период');
            break;
        }

        // Проверка переходного периода
        if (lastIssuanceDate && !isOfficer) {
            const nextIssueDate = dayjs(lastIssuanceDate).add(
                applicablePeriod.period_months,
                'month'
            );

            console.log('Проверка переходного периода:', {
                lastIssueDate: formatDate(lastIssuanceDate),
                nextIssueDate: formatDate(nextIssueDate),
                promotionDate: formatDate(promotionDate),
                isAfterPromotion: nextIssueDate.isAfter(promotionDate),
                currentItem: currentItem.item_name,
                period_months: applicablePeriod.period_months,
            });

            // Если срок следующей выдачи заходит за дату присвоения звания,
            // нужно доносить текущий предмет до конца срока
            if (nextIssueDate.isAfter(promotionDate)) {
                if (nextIssueDate.isAfter(currentDate)) {
                    break;
                }
                // Следующая выдача будет по офицерской норме после окончания срока носки
                currentIssueDate = nextIssueDate;
                continue;
            }
        }

        // Проверка срока предыдущей выдачи
        if (
            lastIssuanceDate &&
            !isPreviousIssuanceExpired(
                lastIssuanceDate,
                applicablePeriod.period_months,
                currentIssueDate,
                maternityStart,
                maternityLeaveDuration
            )
        ) {
            currentIssueDate = dayjs(lastIssuanceDate).add(applicablePeriod.period_months, 'month');
            continue;
        }

        // Добавление выдачи
        issuances.push({
            date: formatDate(currentIssueDate),
            quantity: applicablePeriod.quantity,
            used: 0,
        });
        totalQuantity += applicablePeriod.quantity;

        lastIssuanceDate = currentIssueDate;
        currentIssueDate = currentIssueDate.add(applicablePeriod.period_months, 'month');

        // Учет декретного отпуска
        if (maternityStart && gender === 'female') {
            if (
                currentIssueDate.isBefore(maternityStart) &&
                currentIssueDate
                    .add(applicablePeriod.period_months, 'month')
                    .isAfter(maternityStart)
            ) {
                currentIssueDate = currentIssueDate.add(maternityLeaveDuration, 'month');
            }
        }
    }

    console.log('Результат расчета:', {
        itemName,
        totalQuantity,
        issuancesCount: issuances.length,
    });

    return {
        issuances,
        totalQuantity,
    };
}

/**
 * Обрабатывает все предметы для сотрудника
 */
export function processEquipment(
    startWorkDate: Date | string,
    officerPromotionDate: Date | string,
    gender: 'male' | 'female',
    maternityLeaveStart: Date | string | null = null,
    maternityLeaveDuration: number = 0
) {
    const formattedStartDate = formatDate(dayjs(startWorkDate));
    const formattedOfficerDate = formatDate(dayjs(officerPromotionDate));
    const formattedMaternityDate = maternityLeaveStart
        ? formatDate(dayjs(maternityLeaveStart))
        : null;

    const allItems = new Set([
        ...(gender === 'female' ? womanOfficerData : officerData).map((item) => item.item_name),
        ...(gender === 'female' ? womanNonOfficerData : nonOfficerData).map(
            (item) => item.item_name
        ),
    ]);

    return Array.from(allItems).map((itemName) => {
        const itemResult = calculateEquipmentDates(
            formattedStartDate,
            formattedOfficerDate,
            itemName,
            gender,
            formattedMaternityDate,
            maternityLeaveDuration
        );

        // Получаем информацию о денежной компенсации
        const officerItem = (gender === 'female' ? womanOfficerData : officerData).find(
            (item) => item.item_name === itemName
        );
        const nonOfficerItem = (gender === 'female' ? womanNonOfficerData : nonOfficerData).find(
            (item) => item.item_name === itemName
        );
        const cashValue = (officerItem || nonOfficerItem)?.cash || 0;

        return {
            name: itemName,
            issuances: itemResult.issuances,
            totalQuantity: itemResult.totalQuantity,
            cash: cashValue,
        };
    });
}

/**
 * Определяет дату первой возможной выдачи предмета
 */
function determineFirstAvailableDate(
    item: EquipmentItem,
    workStartDate: Dayjs,
    promotionDate: Dayjs,
    isOfficerOnly: boolean
): Dayjs {
    const firstPeriod = item.periods[0];
    const periodStartDate = firstPeriod.start_date
        ? parseDate(firstPeriod.start_date)
        : dayjs('1970-01-01');

    if (isOfficerOnly) {
        const earliestDate = dayjs(promotionDate).isAfter(periodStartDate)
            ? promotionDate
            : periodStartDate;
        return dayjs(earliestDate).isAfter(workStartDate) ? earliestDate : workStartDate;
    }

    return dayjs(periodStartDate).isAfter(workStartDate) ? periodStartDate : workStartDate;
}

/**
 * Проверяет, истек ли срок предыдущей выдачи
 */
function isPreviousIssuanceExpired(
    lastIssueDate: Dayjs,
    periodMonths: number,
    currentDate: Dayjs,
    maternityStart: Dayjs | null,
    maternityLeaveDuration: number
): boolean {
    if (!lastIssueDate) return true;
    let expirationDate = dayjs(lastIssueDate).add(periodMonths, 'month');

    if (
        maternityStart &&
        dayjs(lastIssueDate).isBefore(maternityStart) &&
        dayjs(maternityStart).isBefore(expirationDate)
    ) {
        expirationDate = expirationDate.add(maternityLeaveDuration, 'month');
    }

    return dayjs(currentDate).isAfter(expirationDate) || dayjs(currentDate).isSame(expirationDate);
}
