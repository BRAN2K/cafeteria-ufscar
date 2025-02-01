import { EmployeeRole } from "../services/employee.service";

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const isValidRole = (role: string): role is EmployeeRole => {
  return ["admin", "manager", "attendant"].includes(role);
};
