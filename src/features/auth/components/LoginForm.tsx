"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import { loginSchema, type LoginFormData } from "../schemas/login.schema";
import { getRoleRedirectPath } from "../hooks/use-auth";
import styles from "../auth.module.css";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginFormData) {
    setServerError(null);

    const result = await signIn.email({
      email: data.email,
      password: data.password,
    });

    if (result.error) {
      setServerError(result.error.message || "Invalid email or password");
      return;
    }

    toast.success("Welcome back!", { description: "You have signed in successfully." });

    const role = (result.data?.user as any)?.role;
    router.replace(getRoleRedirectPath(role));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && (
        <div className={`${styles.alert} ${styles.alertError}`}>
          <AlertCircle size={16} />
          {serverError}
        </div>
      )}

      <div className={styles.fieldGroup}>
        {/* Email */}
        <div className={styles.field}>
          <label htmlFor="login-email" className={styles.fieldLabel}>
            Email address
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="login-email"
              type="email"
              className={styles.fieldInput}
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <span className={styles.fieldError}>{errors.email.message}</span>
          )}
        </div>

        {/* Password */}
        <div className={styles.field}>
          <label htmlFor="login-password" className={styles.fieldLabel}>
            Password
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              className={styles.fieldInput}
              placeholder="••••••••"
              autoComplete="current-password"
              style={{ paddingRight: "2.5rem" }}
              {...register("password")}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <span className={styles.fieldError}>{errors.password.message}</span>
          )}
        </div>
      </div>

      <button
        id="login-submit"
        type="submit"
        className={styles.submitBtn}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className={styles.spinner} />
        ) : (
          <>
            <LogIn size={16} />
            Sign in
          </>
        )}
      </button>
    </form>
  );
}
