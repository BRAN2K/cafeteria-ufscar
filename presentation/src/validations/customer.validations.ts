export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Aceita formato: (XX) XXXXX-XXXX ou XXXXXXXXXX
  const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
  return phone === "" || phoneRegex.test(phone);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};
