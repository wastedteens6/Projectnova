"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth.validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordInput>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordInput) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to send reset email");
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
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
                                <Mail className="h-8 w-8 text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold">Check Your Email!</h2>
                            <p className="text-muted-foreground">
                                If an account exists with that email, we've sent password reset
                                instructions. Please check your inbox.
                            </p>
                            <div className="pt-4 space-y-2">
                                <Link href="/auth/login">
                                    <Button variant="gradient" className="w-full">
                                        Back to Login
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
                        <CardTitle className="text-2xl">Forgot Password?</CardTitle>
                        <CardDescription>
                            Enter your email and we'll send you a reset link
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

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Email Input */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email Address
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
                                        Sending...
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>
                        </form>

                        {/* Back to Login */}
                        <div className="text-center">
                            <Link
                                href="/auth/login"
                                className="text-sm text-primary hover:underline"
                            >
                                ← Back to login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
