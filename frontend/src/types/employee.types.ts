import {v4 as uuidv4} from 'uuid';

/**
 * Тип для валидации формата даты (DD.MM.YYYY)
 */
type RussianDateString = string & {_brand: 'RussianDateString'};

/**
 * Тип для UUID v4
 */
type UUID = string & {_brand: 'UUID'};

/**
 * Тип для валидированного имени
 */
type ValidatedName = string & {_brand: 'ValidatedName'};

/**
 * Функция для валидации UUID v4
 */
export function toUUID(id: string): UUID | null {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id) ? (id as UUID) : null;
}

/**
 * Создает новый UUID v4
 */
export function generateUUID(): UUID {
    return uuidv4() as UUID;
}

/**
 * Функция для валидации и преобразования строки в формат DD.MM.YYYY
 */
export function toRussianDateString(date: string): RussianDateString | null {
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/;
    if (!dateRegex.test(date)) return null;

    const [day, month, year] = date.split('.').map(Number);
    const parsedDate = new Date(year, month - 1, day);

    if (
        parsedDate.getDate() !== day ||
        parsedDate.getMonth() !== month - 1 ||
        parsedDate.getFullYear() !== year ||
        isNaN(parsedDate.getTime())
    ) {
        return null;
    }

    return date as RussianDateString;
}

/**
 * Функция для валидации и форматирования имени
 */
export function toValidatedName(name: string): ValidatedName | null {
    const trimmedName = name.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
        return null;
    }

    const nameRegex = /^[а-яёА-ЯЁa-zA-Z\s-]+$/;
    if (!nameRegex.test(trimmedName)) {
        return null;
    }

    const formattedName = trimmedName
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    return formattedName as ValidatedName;
}

/**
 * Перечисление для пола сотрудника
 */
export enum Gender {
    /** Мужской */
    Male = 'male',
    /** Женский */
    Female = 'female',
}

/**
 * Интерфейс, представляющий период ношения вещи
 */
export interface WearingPeriod {
    /** Дата периода в формате DD.MM.YYYY */
    date: RussianDateString;
    /** Количество */
    quantity: number;
    /** Использовано */
    used: number;
}

/**
 * Интерфейс, представляющий имущество
 */
export interface Staff {
    /** Наименование имущества */
    name: string;
    /** Массив периодов ношения */
    issuances: WearingPeriod[];
    /** Общее количество */
    totalQuantity: number;
    /** Стоимость */
    cash: number;
}

/**
 * Интерфейс, представляющий декретный отпуск
 */
export interface Decree {
    /** Дата начала в формате DD.MM.YYYY */
    date: RussianDateString;
    /** Длительность в месяцах */
    duration: number;
}

/**
 * Интерфейс, представляющий сотрудника
 */
export interface Employee {
    /** Уникальный идентификатор в формате UUID v4 */
    id: UUID;
    /** Имя сотрудника (валидированное) */
    name: ValidatedName;
    /** Пол сотрудника */
    gender: Gender;
    /** Дата начала службы в формате DD.MM.YYYY */
    startDate: RussianDateString;
    /** Дата присвоения звания офицера в формате DD.MM.YYYY */
    officerDate: RussianDateString;
    /** Информация о декретном отпуске (если есть) */
    decree?: Decree;
    /** Выданное имущество */
    staff: Staff[];
}

export type {RussianDateString, UUID, ValidatedName};
