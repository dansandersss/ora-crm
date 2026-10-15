"use client";

import Link from "next/link";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { signInStaff } from "@/lib/auth/client";
import { loginSchema, type LoginValues } from "@/lib/validators/auth";
import { AuthButton } from "./AuthButton";
import { AuthInput } from "./AuthInput";

type LoginFormProps = {
  notice?: string;
};

export function LoginForm({ notice }: LoginFormProps) {
  const router = useRouter();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      await signInStaff(values);
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setError("root", { message: error instanceof Error ? error.message : "Autentificarea nu a putut fi efectuată." });
    }
  };

  return (
      <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex w-[480px] max-w-full flex-col gap-[20px]"
      >
          <div className="flex flex-col gap-[20px]">
              <AuthInput
                  id="email"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                  icon={
                      <Image
                          unoptimized
                          src="/assets/mail-icon.svg"
                          alt=""
                          width={30}
                          height={30}
                      />
                  }
                  error={errors.email?.message}
                  variant="login"
                  {...register("email")}
              />

              <AuthInput
                  id="password"
                  label="Parolă"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Parolă"
                  icon={
                      <Image
                          unoptimized
                          src="/assets/password-icon.svg"
                          alt=""
                          width={30}
                          height={30}
                      />
                  }
                  error={errors.password?.message}
                  variant="login"
                  {...register("password")}
              />
          </div>

          <label
              suppressHydrationWarning
              data-auth-field
              className="-mt-[2px] flex w-fit cursor-pointer items-center gap-[9px] text-[14px] text-white/60 transition-colors hover:text-white/80"
          >
              <input
                  type="checkbox"
                  className="size-[17px] cursor-pointer accent-[#dfa434]"
                  {...register("rememberMe")}
              />
              <span>Ține-mă minte</span>
          </label>

          {errors.root?.message ? (
              <div
                  className="text-center text-[12px] text-[#ff9a86]"
                  role="alert"
              >
                  {errors.root.message}
              </div>
          ) : null}

          {notice && !errors.root?.message ? (
              <div className="text-center text-[13px] leading-5 text-[#e5b55d]" role="status">
                  {notice}
              </div>
          ) : null}

          <AuthButton
              type="submit"
              loading={isSubmitting}
              variant="login"
          >
              Conectează-te
          </AuthButton>

          <div
              suppressHydrationWarning
              data-auth-footer
              className="flex flex-col items-center gap-[8px] text-[15px] text-white/55 sm:text-[16px]"
          >
              <Link
                  href="/forgot-password"
                  className="transition-colors hover:text-[#e6af4f] focus-visible:outline-none focus-visible:text-[#e6af4f]"
              >
                  Ai uitat parola?
              </Link>

              <span>
      Nu ai cont?{" "}
                  <Link
                      href="/register"
                      className="font-medium text-[#d9a441] transition-colors hover:text-[#ffc45c] focus-visible:outline-none focus-visible:text-[#ffc45c]"
                  >
        Înregistrează-te
      </Link>
    </span>
          </div>
      </form>
  );
}
