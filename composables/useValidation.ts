import { reactive } from "vue";

export const useValidation = () => {
  const errors = reactive({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const cleanErrors = () => {
    errors.email = "";
    errors.password = "";
    errors.confirmPassword = "";
  };

  /* Validasi email */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    errors.email = isValid ? "" : "Email tidak valid";
    return isValid;
  };

  /* Validasi password */
  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    const isValid = passwordRegex.test(password);

    errors.password = isValid
      ? ""
      : "Password harus minimal 8 karakter, mengandung huruf dan angka";
    return isValid;
  };

  /* Validasi konfirmasi passoword apakah sama */
  const validatePasswordMatch = (
    password: string,
    confirmPassword: string
  ): boolean => {
    const isValid = password === confirmPassword;

    errors.confirmPassword = isValid ? "" : "Password tidak sama";
    return isValid;
  };

  /* Validasi form registrasi */
  const validateRegistrationForm = (
    email: string,
    password: string,
    confirmPassword: string
  ): boolean => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isPasswordMatchValid = validatePasswordMatch(
      password,
      confirmPassword
    );

    return isEmailValid && isPasswordValid && isPasswordMatchValid;
  };

  /* Validasi form login */
  const validateLoginForm = (email: string, password: string): boolean => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    return isEmailValid && isPasswordValid;
  };

  return {
    errors,
    cleanErrors,
    validateRegistrationForm,
    validateLoginForm,
  };
};
