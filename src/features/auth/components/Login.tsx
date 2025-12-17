"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/features/auth/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { toast } from "sonner";
import { FormattedSignUpData } from "../types";

const loginSchema = z.object({
  email_prefix: z
    .string()
    .min(1, "Email prefix is required")
    .regex(/^[a-zA-Z0-9._-]+$/, "Invalid email format"),
  email_suffix_id: z.string().min(1, "Please select an email domain"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginProps {
  formOptions: FormattedSignUpData;
}

export default function Login({ formOptions }: LoginProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email_prefix: "",
      email_suffix_id: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError("");
      await login(data.email_prefix, parseInt(data.email_suffix_id), data.password);
      router.push("/");
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "An error occurred during login. Please try again.";
      toast.error(errorMsg);
      setError(errorMsg);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-gradient-subtle">
      <Card className="w-full max-w-md border-none shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to HUx
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your Habib University account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email_prefix">University Email</Label>
              <div className="flex gap-2">
                <Input
                  id="email_prefix"
                  type="text"
                  placeholder="username"
                  {...register("email_prefix")}
                  disabled={isSubmitting}
                  className="flex-1"
                />
                <Select
                  value={watch("email_suffix_id")}
                  onValueChange={(value) => setValue("email_suffix_id", value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(formOptions.options).map(([id, option]) => (
                      <SelectItem key={id} value={id}>
                        {option.email_suffix}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.email_prefix && (
                <p className="text-sm text-destructive">
                  {errors.email_prefix.message}
                </p>
              )}
              {errors.email_suffix_id && (
                <p className="text-sm text-destructive">
                  {errors.email_suffix_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Don&apos;t have an account?{" "}
              </span>
              <Link
                href="/signup"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
