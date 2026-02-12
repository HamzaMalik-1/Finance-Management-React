import { t } from "i18next";
import { z } from "zod";

export const authSchema = (isLogin) => z.object({
  email: z.string().trim().email(t("validation.invalid_email")),
  password: z.string().min(8, t("validation.password_min")),
  // Username only required if signing up
  username: !isLogin 
    ? z.string().trim().min(3, t("validation.username_min")) 
    : z.string().optional(),
});