import {Employee} from '../employee/models/employee.model';
import {calculateEquipment} from './calculate';
import { formatDateToDDMMYYYY } from './formatDate';

export function compareAndUpdateEmployeeVersions(existingEmployee: Employee) {
    const startDate = formatDateToDDMMYYYY(existingEmployee.startDate);
    const officerDate = formatDateToDDMMYYYY(existingEmployee.officerDate);
    const maternityLeaveStart = existingEmployee.maternityLeaveStart ? formatDateToDDMMYYYY(existingEmployee.maternityLeaveStart) : null;

    // Create new version with recalculated staff data
    const newStaffData = calculateEquipment(
        existingEmployee.gender,
        startDate,
        officerDate,        
        maternityLeaveStart,
        existingEmployee.maternityLeaveDuration || 0
    );

    // Compare and merge staff data
    const updatedStaff = existingEmployee.staff.map((existingItem, index) => {
        const newItem = newStaffData[index];
        if (newItem.issuances.length > existingItem.issuances.length) {
            // Add new issuances while preserving existing ones
            const newIssuances = newItem.issuances.slice(existingItem.issuances.length);
            return {
                ...existingItem,
                issuances: [...existingItem.issuances, ...newIssuances],
                totalQuantity: newItem.totalQuantity,
            };
        }
        return existingItem;
    });

    return updatedStaff;
}
