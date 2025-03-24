import {Employee} from '../employee/models/employee.model';
import {processEquipment} from './calculate_staff';

export function compareAndUpdateEmployeeVersions(existingEmployee: Employee) {
    // Create new version with recalculated staff data
    const newStaffData = processEquipment(
        existingEmployee.startDate,
        existingEmployee.officerDate,
        existingEmployee.gender,
        existingEmployee.maternityLeaveStart,
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
