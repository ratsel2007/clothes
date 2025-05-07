import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import * as fs from 'fs';
import * as path from 'path';

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

interface Period {
    start_date: string;
    end_date: string;
    nonOfficer: {
        period_months: number;
        quantity: number;
    };
    isOfficer: {
        period_months: number;
        quantity: number;
    };
}

interface EquipmentItem {
    item_name: string;
    periods: Period[];
    attention: boolean;
    cash: number;
}

interface Issuance {
    date: string;
    quantity: number;
    used: number;
    period_months: number;
}

interface ResultItem {
    name: string;
    issuances: Issuance[];
    totalQuantity: number;
    cash: number;
}

export function calculateEquipment(
    gender: 'male' | 'female',
    startDate: string,
    officerDate: string | null,
    maternityDate?: string,
    maternityMonths?: number
) {
    try {
        const currentDate = dayjs();
        const employeeStartDate = dayjs(startDate, 'DD.MM.YYYY');
        const employeeOfficerDate = officerDate ? dayjs(officerDate, 'DD.MM.YYYY') : null;
        const maternityStartDate = maternityDate ? dayjs(maternityDate, 'DD.MM.YYYY') : null;

        // Load data based on gender
        const dataFileName = gender === 'male' ? 'men_data.json' : 'woman_data.json';
        const dataPath = path.join(__dirname, '..', 'data', dataFileName);
        
        const equipmentData: EquipmentItem[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

        const result: ResultItem[] = [];

        for (const item of equipmentData) {
            // console.log('Processing item:', item.item_name);
            const issuances: Issuance[] = [];
            let currentIssueDate = employeeStartDate;
            let totalQuantity = 0;

            while (currentIssueDate.isBefore(currentDate) || currentIssueDate.isSame(currentDate, 'day')) {
                for (const period of item.periods) {
                    const periodStartDate = dayjs(period.start_date, 'DD.MM.YYYY');
                    const periodEndDate = dayjs(period.end_date, 'DD.MM.YYYY');

                    if (currentIssueDate.isBetween(periodStartDate, periodEndDate, 'day', '[]')) {
                        if (period === item.periods[0] && periodStartDate.isAfter(employeeStartDate)) {
                            currentIssueDate = periodStartDate;
                        }

                        const isOfficer = employeeOfficerDate && 
                            (startDate === officerDate || 
                            currentIssueDate.isAfter(employeeOfficerDate));

                        const rules = isOfficer ? period.isOfficer : period.nonOfficer;
                        
                        if (rules.quantity > 0) {
                            // Calculate adjusted period months considering maternity leave
                            let adjustedPeriodMonths = rules.period_months;
                            
                            if (gender === 'female' && maternityStartDate && maternityMonths) {
                                const issueEndDate = currentIssueDate.add(rules.period_months, 'month');
                                
                                // If maternity leave overlaps with current issuance period
                                if (maternityStartDate.isBetween(currentIssueDate, issueEndDate, 'day', '[]')) {
                                    adjustedPeriodMonths += maternityMonths;
                                }
                            }

                            issuances.push({
                                date: currentIssueDate.format('DD-MM-YYYY'),
                                quantity: rules.quantity,
                                used: 0,
                                period_months: adjustedPeriodMonths
                            });

                            totalQuantity += rules.quantity;
                            currentIssueDate = currentIssueDate.add(adjustedPeriodMonths, 'month');
                        } else {
                            currentIssueDate = currentIssueDate.add(rules.period_months, 'month');
                        }
                        break;
                    }
                }
                
                if (!currentIssueDate.isBefore(currentDate)) break;
            }

            if (issuances.length > 0) {
                result.push({
                    name: item.item_name,
                    issuances,
                    totalQuantity: totalQuantity,
                    cash: item.cash
                });
            }
        }


        // Save result to file with absolute path
        // const resultPath = path.resolve(__dirname, 'result.json');
        // console.log('Saving to:', resultPath);
        // fs.writeFileSync(resultPath, JSON.stringify(result, null, 2), 'utf8');
        console.log('Calculation completed successfully');
        // console.log(result);
        return result;
    } catch (error) {
        console.error('Error in calculation:', error);
        throw error;
    }
}

// Modify the execution part
// if (require.main === module) {
//     try {
//         console.log('Starting calculation...');
//         calculateEquipment('male', "2018-05-05", "2018-05-05");
//         console.log('Calculation completed successfully');
//     } catch (error) {
//         console.error('Error during calculation:', error);
//     }
// }