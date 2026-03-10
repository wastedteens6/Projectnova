"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth.validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    });

    const password = watch("password");

    // Password strength indicator
    const getPasswordStrength = (pass: string) => {
        if (!pass) return { strength: 0, label: "", color: "" };

        let strength = 0;
        if (pass.length >= 8) strength++;
        if (/[A-Z]/.test(pass)) strength++;
        if (/[a-z]/.test(pass)) strength++;
        if (/[0-9]/.test(pass)) strength++;
        if (/[^A-Za-z0-9]/.test(pass)) strength++;

        if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" };
        if (strength <= 3) return { strength, label: "Medium", color: "bg-yellow-500" };
        return { strength, label: "Strong", color: "bg-green-500" };
    };

    const passwordStrength = getPasswordStrength(password);

    const onSubmit = async (data: RegisterInput) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Registration failed");
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        const requireEmailVerification = process.env.NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION === 'true';

        return (
            <div className="min-h-screen flex items-center justify-center p-4 pt-20 relative overflow-hidden">
                <div className="floating-orbs">
                    <div className="orb orb-1"></div>
                    <div className="orb orb-2"></div>
                </div>

                <div className="w-full max-w-md relative z-10">
                    <Card className="glass-card">
                        <CardContent className="pt-6 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto">
                                <CheckCircle className="h-8 w-8 text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold">
                                {requireEmailVerification ? "Check Your Email!" : "Account Created!"}
                            </h2>
                            <p className="text-muted-foreground">
                                {requireEmailVerification
                                    ? "We've sent a verification link to your email address. Please click the link to verify your account and complete registration."
                                    : "Your account has been created successfully! You can now log in to access your dashboard."}
                            </p>
                            <div className="pt-4">
                                <Link href="/auth/login">
                                    <Button variant="gradient" className="w-full">
                                        Go to Login
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 pt-20 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="floating-orbs">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <Card className="glass-card">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center glow-primary mx-auto mb-4">
                            <span className="text-white font-bold text-2xl">PN</span>
                        </div>
                        <CardTitle className="text-2xl">Create Account</CardTitle>
                        <CardDescription>
                            Start your journey with ProjectNova
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        {/* Registration Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Name Input */}
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">
                                    Full Name
                                </label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    {...register("name")}
                                    disabled={isLoading}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Email Input */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    {...register("email")}
                                    disabled={isLoading}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        {...register("password")}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password.message}</p>
                                )}

                                {/* Password Strength */}
                                {password && (
                                    <div className="space-y-1">
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 flex-1 rounded-full ${i < passwordStrength.strength
                                                        ? passwordStrength.color
                                                        : "bg-muted"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Password strength: {passwordStrength.label}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                variant="gradient"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">
                                    Already have an account?
                                </span>
                            </div>
                        </div>

                        {/* Login Link */}
                        <Link href="/auth/login">
                            <Button variant="outline" className="w-full">
                                Sign In
                            </Button>
                        </Link>

                        {/* Back to Home */}
                        <div className="text-center">
                            <Link
                                href="/"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                ← Back to home
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
