import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.tsx";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      navigate("/dashboard");
      toast.success("Login successful!");
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'ACCOUNT_DEACTIVATED') {
        toast.error(
          "Your account has been deactivated. You can restore it by registering again with the same email.",
          {
            autoClose: 8000, // Show longer to allow reading
          }
        );
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "Invalid credentials";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/50 to-sky-50/40 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-10 border border-primary-200/50">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 border border-sky-200/50">
              <LogIn className="h-8 w-8 text-sky-600" />
            </div>
            <h2 className="mt-8 text-3xl font-bold text-primary-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-3 text-lg text-primary-600 font-light">
              Sign in to continue to your dashboard
            </p>
            <p className="mt-6 text-sm text-primary-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-accent-600 hover:text-accent-700 transition-colors duration-300"
              >
                Create one here
              </Link>
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-primary-700 mb-3"
                >
                  Email Address
                </label>
                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  className="w-full px-4 py-4 bg-primary-50/50 border border-primary-200/60 rounded-full focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all duration-300 placeholder-primary-400 text-primary-900"
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="mt-3 text-sm text-red-500 flex items-center font-light">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-primary-700 mb-3"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="w-full px-4 py-4 pr-12 bg-primary-50/50 border border-primary-200/60 rounded-full focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all duration-300 placeholder-primary-400 text-primary-900"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-primary-400 hover:text-primary-600 transition-colors duration-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-3 text-sm text-red-500 flex items-center font-light">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r text-sm from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold py-4 px-6 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-sky-500/25 hover:shadow-2xl hover:shadow-sky-500/30 flex justify-center items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-3"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-3" />
                    Sign In
                  </>
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/"
                  className="text-sm text-primary-500 hover:text-accent-600 transition-colors duration-300 font-medium"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
