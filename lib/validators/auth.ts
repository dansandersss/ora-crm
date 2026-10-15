import { z } from "zod";

const password = z.string().min(1, "Introdu parola.").min(8, "Parola trebuie să conțină minimum 8 caractere.");

export const loginSchema = z.object({
  email: z.string().min(1, "Introdu adresa de email.").email("Introdu o adresă de email validă."),
  password,
  rememberMe: z.boolean(),
});

export const registerSchema = z.object({
  firstName: z.string().trim().min(2, "Introdu cel puțin 2 caractere."),
  lastName: z.string().trim().min(2, "Introdu cel puțin 2 caractere."),
  phone: z.string().trim().min(1, "Introdu numărul de telefon.").regex(/^\+?[0-9\s().-]{8,20}$/, "Introdu un număr de telefon valid."),
  email: z.string().min(1, "Introdu adresa de email.").email("Introdu o adresă de email validă."),
  password,
  confirmPassword: z.string().min(1, "Confirmă parola."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Parolele nu coincid.",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Introdu adresa de email.").email("Introdu o adresă de email validă."),
});

export const resetPasswordSchema = z.object({
  password,
  confirmPassword: z.string().min(1, "Confirmă parola."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Parolele nu coincid.",
  path: ["confirmPassword"],
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
