"use client";
import { useState, useEffect } from "react";
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
import { FormattedSignUpData, SignUpFormData } from "../types";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { checkEmailAvailability } from "../server";

// Step 1 validation
const step1Schema = z.object({
  email_prefix: z
    .string()
    .min(1, "Email prefix is required")
    .regex(/^[a-zA-Z0-9._-]+$/, "Invalid email format"),
  email_suffix_id: z.string().min(1, "Please select an email domain"),
});

// Step 2 validation
const step2Schema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    school_id: z.string().optional(),
    program_id: z.string().optional(),
    class_of: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type Step1FormData = z.infer<typeof step1Schema>;
type Step2FormData = z.infer<typeof step2Schema>;

interface SignupProps {
  formOptions: FormattedSignUpData;
}

export default function Signup({ formOptions }: SignupProps) {
  const router = useRouter();
  const { signup } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<number | null>(null);

  const step1Form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      email_prefix: "",
      email_suffix_id: "",
    },
  });

  const step2Form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      first_name: "",
      last_name: "",
      school_id: "",
      program_id: "",
      class_of: "",
      password: "",
      confirm_password: "",
    },
  });

  const watchedSuffixId = step1Form.watch("email_suffix_id");

  // Update selected option when suffix changes
  useEffect(() => {
    if (watchedSuffixId) {
      const suffixId = parseInt(watchedSuffixId);
      setSelectedOption(suffixId);
      const option = formOptions.options[suffixId];

      // Auto-select school if there's only one
      if (option?.schools.length === 1) {
        const schoolId = option.schools[0];
        setSelectedSchool(schoolId);
        step2Form.setValue("school_id", schoolId.toString());
      } else {
        setSelectedSchool(null);
        step2Form.setValue("school_id", "");
      }

      // Reset program when school changes
      step2Form.setValue("program_id", "");
    }
  }, [watchedSuffixId, formOptions.options, step2Form]);

  const watchedSchoolId = step2Form.watch("school_id");

  useEffect(() => {
    if (watchedSchoolId) {
      setSelectedSchool(parseInt(watchedSchoolId));
      step2Form.setValue("program_id", "");
    }
  }, [watchedSchoolId, step2Form]);

  const onStep1Submit = async () => {
    try {
      const avaialable = await checkEmailAvailability(
        step1Form.getValues("email_prefix"),
        parseInt(step1Form.getValues("email_suffix_id"))
      );
      if (avaialable) {
        setError("");
        setStep(2);
      } else {
        const errorMsg = "Email already registered";
        toast.error(errorMsg);
        setError(errorMsg);
        return;
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "An error occurred during signup. Please try again.";
      toast.error(errorMsg);
      setError(errorMsg);
      return;
    }
  };

  const onStep2Submit = async (data: Step2FormData) => {
    try {
      setError("");

      const suffixId = parseInt(step1Form.getValues("email_suffix_id"));
      const option = formOptions.options[suffixId];

      const signupData: SignUpFormData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email_prefix: step1Form.getValues("email_prefix"),
        email_suffix_id: suffixId,
        role_id: option.role.id,
        program_id: data.program_id ? parseInt(data.program_id) : 0,
        class_of: data.class_of ? parseInt(data.class_of) : null,
        password: data.password,
      };

      await signup(signupData);
      toast.success("Signed up successfully");
      router.push("/");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred during signup. Please try again."
      );
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred during signup. Please try again."
      );
    }
  };

  const currentOption = selectedOption
    ? formOptions.options[selectedOption]
    : null;
  const availableSchools = currentOption?.schools || [];
  const showSchools = availableSchools.length > 1;
  const showPrograms =
    selectedSchool && formOptions.schools[selectedSchool]?.programs.length > 0;
  const isStudent = currentOption?.role.name === "student";

  const getRoleLabel = () => {
    if (!currentOption) return null;
    const roleName = currentOption.role.name;
    if (roleName === "student") return "Student";
    if (roleName === "faculty") {
      const schoolName =
        currentOption.schools.length === 1
          ? formOptions.schools[currentOption.schools[0]].name
          : null;
      return schoolName ? `Faculty (${schoolName})` : "Faculty";
    }
    return "Staff";
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-gradient-subtle">
      <Card className="w-full max-w-md border-none shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create Your Account
          </CardTitle>
          <CardDescription className="text-center">
            {step === 1
              ? "Enter your email information"
              : "Complete your profile"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Email Selection */}
          {step === 1 && (
            <form
              onSubmit={step1Form.handleSubmit(onStep1Submit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email_prefix">University Email</Label>
                  {currentOption && (
                    <span className="text-xs text-primary font-medium flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {getRoleLabel()}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="email_prefix"
                    type="text"
                    placeholder="username"
                    {...step1Form.register("email_prefix")}
                    disabled={step1Form.formState.isSubmitting}
                    className="flex-1"
                  />
                  <Select
                    value={step1Form.watch("email_suffix_id")}
                    onValueChange={(value) =>
                      step1Form.setValue("email_suffix_id", value)
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(formOptions.options).map(
                        ([id, option]) => (
                          <SelectItem key={id} value={id}>
                            {option.email_suffix}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {step1Form.formState.errors.email_prefix && (
                  <p className="text-sm text-destructive">
                    {step1Form.formState.errors.email_prefix.message}
                  </p>
                )}
                {step1Form.formState.errors.email_suffix_id && (
                  <p className="text-sm text-destructive">
                    {step1Form.formState.errors.email_suffix_id.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full">
                Continue
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  Already have an account?{" "}
                </span>
                <Link
                  href="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </div>
            </form>
          )}

          {/* Step 2: User Details */}
          {step === 2 && (
            <form
              onSubmit={step2Form.handleSubmit(onStep2Submit)}
              className="space-y-4"
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                className="mb-2 -ml-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    type="text"
                    placeholder="John"
                    {...step2Form.register("first_name")}
                    disabled={step2Form.formState.isSubmitting}
                  />
                  {step2Form.formState.errors.first_name && (
                    <p className="text-sm text-destructive">
                      {step2Form.formState.errors.first_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    type="text"
                    placeholder="Doe"
                    {...step2Form.register("last_name")}
                    disabled={step2Form.formState.isSubmitting}
                  />
                  {step2Form.formState.errors.last_name && (
                    <p className="text-sm text-destructive">
                      {step2Form.formState.errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              {showSchools && (
                <div className="space-y-2">
                  <Label htmlFor="school_id">School</Label>
                  <Select
                    value={step2Form.watch("school_id")}
                    onValueChange={(value) =>
                      step2Form.setValue("school_id", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select school" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSchools.map((schoolId) => (
                        <SelectItem key={schoolId} value={schoolId.toString()}>
                          {formOptions.schools[schoolId]?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {step2Form.formState.errors.school_id && (
                    <p className="text-sm text-destructive">
                      {step2Form.formState.errors.school_id.message}
                    </p>
                  )}
                </div>
              )}

              {showPrograms && (
                <div className="space-y-2">
                  <Label htmlFor="program_id">Program</Label>
                  <Select
                    value={step2Form.watch("program_id")}
                    onValueChange={(value) =>
                      step2Form.setValue("program_id", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      {formOptions.schools[selectedSchool!].programs.map(
                        (programId) => (
                          <SelectItem
                            key={programId}
                            value={programId.toString()}
                          >
                            {formOptions.programs[programId]}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  {step2Form.formState.errors.program_id && (
                    <p className="text-sm text-destructive">
                      {step2Form.formState.errors.program_id.message}
                    </p>
                  )}
                </div>
              )}

              {isStudent && (
                <div className="space-y-2">
                  <Label htmlFor="class_of">Class Of</Label>
                  <Input
                    id="class_of"
                    type="number"
                    placeholder="2027"
                    {...step2Form.register("class_of")}
                    disabled={step2Form.formState.isSubmitting}
                    min="2000"
                    max="2100"
                  />
                  {step2Form.formState.errors.class_of && (
                    <p className="text-sm text-destructive">
                      {step2Form.formState.errors.class_of.message}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...step2Form.register("password")}
                  disabled={step2Form.formState.isSubmitting}
                />
                {step2Form.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {step2Form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="Confirm your password"
                  {...step2Form.register("confirm_password")}
                  disabled={step2Form.formState.isSubmitting}
                />
                {step2Form.formState.errors.confirm_password && (
                  <p className="text-sm text-destructive">
                    {step2Form.formState.errors.confirm_password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={step2Form.formState.isSubmitting}
              >
                {step2Form.formState.isSubmitting
                  ? "Creating account..."
                  : "Create Account"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
