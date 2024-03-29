import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Employee } from '../../model/employee';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.css'
})
export class EmployeeDashboardComponent implements OnInit {

  employees: Employee[] = [];
  @Input() employee: Employee | null = null;
  employeeForm!: FormGroup;

  constructor(private fb: FormBuilder, private apiService: ApiService) { }

  ngOnInit(): void {
    this.employeeForm = this.fb.group({
        employeeCode: ['', Validators.required], 
        employeeName: ['', Validators.required], 
        dateOfBirth: ['', Validators.required], 
        gender: ['', Validators.required],
        department: ['', Validators.required], 
        designation: ['', Validators.required], 
        basicSalary: ['', [Validators.required, Validators.min(0)]]
    });
    this.loadEmployees();
}

  loadEmployees(): void {
    this.apiService.getAllEmployees().subscribe(
      (employees: Employee[]) => {
        this.employees = employees.map(this.calculateEarningsAndDeductions);
        console.log("get_all_emp", employees)
      },
      (error) => {
        console.error('Error loading employees:', error);
      }
    );
  }

  onSave(): void {
    const formData = this.employeeForm.value;
    if (this.employee) {
      // Update existing employee
      console.log("for update", formData);
      formData.gender = formData.gender === 'male' ? true : false;
      this.apiService.updateEmployee(this.employee.employeeCode, formData).subscribe(
        (response: Employee) => {
          console.log('Employee updated:', response);
          this.loadEmployees();
          this.resetForm();
          this.employee = null;
          alert('Employee details updated successfully');
        },
        (error) => {
          console.error('Error updating employee:', error);
        }
      );
    } else {
      // Add new employee
      formData.employeeCode = formData.employeeCode = 0;
      formData.gender = formData.gender === 'male' ? true : false;
      this.apiService.addEmployee(formData).subscribe(
        (response: Employee) => {
          console.log('New employee added:', response);
          this.loadEmployees();
          this.resetForm();
          alert('New employee added successfully');
          
        },
        (error) => {
          console.error('Error adding employee:', error);
        }
      );
    }
  }

  editEmployee(employee: Employee): void {
    this.employee = employee;
    this.employeeForm.patchValue({
      employeeCode: employee.employeeCode,
      employeeName: employee.employeeName,
      dateOfBirth: employee.dateOfBirth,
      gender: employee.gender ? 'male' : 'female',
      department: employee.department,
      designation: employee.designation,
      basicSalary: employee.basicSalary
    });
  }



  deleteEmployee(employee: Employee): void {
    const confirmDelete = window.confirm('Are you sure you want to delete this employee?');
    if (confirmDelete) {
      console.log('Deleting employee:', employee);
      this.apiService.deleteEmployee(employee.employeeCode).subscribe(
        () => {
          console.log('Employee deleted successfully');
          this.loadEmployees();
          this.resetForm();
        },
        (error) => {
          console.error('Error deleting employee:', error);
        }
      );
    } else {
      console.log('Delete operation canceled.');
    }
  }

  resetForm(): void {
    this.employeeForm.reset();
 }

  calculateEarningsAndDeductions(employee: Employee): Employee {
    const dearNessAllowance = employee.basicSalary * 0.4;
    const conveyanceAllowance = Math.min(dearNessAllowance * 0.1, 250);
    const houseRentAllowance = Math.max(employee.basicSalary * 0.25, 1500);

    const grossSalary = employee.basicSalary + dearNessAllowance + conveyanceAllowance + houseRentAllowance;
    const pt = grossSalary <= 3000 ? 100 : (grossSalary <= 6000 ? 150 : 200);

    employee.dearnessAllowance = dearNessAllowance;
    employee.conveyanceAllowance = conveyanceAllowance;
    employee.houseRentAllowance = houseRentAllowance;
    employee.totalSalary = employee.basicSalary + dearNessAllowance + conveyanceAllowance + houseRentAllowance - pt;

    return employee;
  }

}
