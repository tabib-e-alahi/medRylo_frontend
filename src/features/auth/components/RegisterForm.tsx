"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, Store } from "lucide-react";
import { toast } from "sonner";
import { signUp } from "@/lib/auth-client";
import { registerSchema, type RegisterFormData } from "../schemas/register.schema";
import styles from "../auth.module.css";

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register: reg,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof registerSchema>, unknown, RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", role: "USER" },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: RegisterFormData) {
    setServerError(null);

    const result = await signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
    }, {
      headers: {
        "x-intended-role": data.role,
      },
    });

    if (result.error) {
      setServerError(result.error.message || "Registration failed. Please try again.");
      return;
    }

    toast.success("Account created!", { description: `Welcome to MedRylo as a ${data.role.toLowerCase()}.` });
    
    // Redirect based on role (Guards will handle deeper redirection like /setup)
    let redirectPath = "/user/dashboard";
    if (data.role === "PHARMACY") redirectPath = "/pharmacy/dashboard";
    if (data.role === "STAFF") redirectPath = "/staff/dashboard";
    
    router.replace(redirectPath);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && (
        <div className={`${styles.alert} ${styles.alertError}`}>
          <AlertCircle size={16} />
          {serverError}
        </div>
      )}

      {/* Role Selection */}
      <div className={styles.roleSelector}>
        <button
          type="button"
          className={`${styles.roleTab} ${selectedRole === "USER" ? styles.roleTabActive : ""}`}
          onClick={() => setValue("role", "USER")}
        >
          <User size={16} />
          <span>Individual</span>
        </button>
        <button
          type="button"
          className={`${styles.roleTab} ${selectedRole === "PHARMACY" ? styles.roleTabActive : ""}`}
          onClick={() => setValue("role", "PHARMACY")}
        >
          <Store size={16} />
          <span>Pharmacy</span>
        </button>
        <button
          type="button"
          className={`${styles.roleTab} ${selectedRole === "STAFF" ? styles.roleTabActive : ""}`}
          onClick={() => setValue("role", "STAFF")}
        >
          <UserPlus size={16} />
          <span>Staff</span>
        </button>
      </div>
      
      {/* Hidden input to register role field */}
      <input type="hidden" {...reg("role")} />


      <div className={styles.fieldGroup}>
        {/* Name */}
        <div className={styles.field}>
          <label htmlFor="register-name" className={styles.fieldLabel}>
            Full name
          </label>
          <input
            id="register-name"
            type="text"
            className={styles.fieldInput}
            placeholder="John Doe"
            autoComplete="name"
            {...reg("name")}
          />
          {errors.name && (
            <span className={styles.fieldError}>{String(errors.name.message)}</span>
          )}
        </div>

        {/* Email */}
        <div className={styles.field}>
          <label htmlFor="register-email" className={styles.fieldLabel}>
            Email address
          </label>
          <input
            id="register-email"
            type="email"
            className={styles.fieldInput}
            placeholder="you@example.com"
            autoComplete="email"
            {...reg("email")}
          />
          {errors.email && (
            <span className={styles.fieldError}>{String(errors.email.message)}</span>
          )}
        </div>

        {/* Password */}
        <div className={styles.field}>
          <label htmlFor="register-password" className={styles.fieldLabel}>
            Password
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              className={styles.fieldInput}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              style={{ paddingRight: "2.5rem" }}
              {...reg("password")}
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
            <span className={styles.fieldError}>{String(errors.password.message)}</span>
          )}
        </div>

        {/* Confirm Password */}
        <div className={styles.field}>
          <label htmlFor="register-confirm" className={styles.fieldLabel}>
            Confirm password
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="register-confirm"
              type={showConfirm ? "text" : "password"}
              className={styles.fieldInput}
              placeholder="Repeat your password"
              autoComplete="new-password"
              style={{ paddingRight: "2.5rem" }}
              {...reg("confirmPassword")}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowConfirm(!showConfirm)}
              tabIndex={-1}
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className={styles.fieldError}>{String(errors.confirmPassword.message)}</span>
          )}
        </div>
      </div>

      <button
        id="register-submit"
        type="submit"
        className={styles.submitBtn}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className={styles.spinner} />
        ) : (
          <>
            <UserPlus size={16} />
            Create account
          </>
        )}
      </button>
    </form>
  );
}
