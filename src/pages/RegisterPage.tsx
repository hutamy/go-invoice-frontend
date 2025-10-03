import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.tsx";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    address: z.string().min(1, "Address is required"),
    phone: z.string().min(1, "Phone number is required"),
    bank_name: z.string().min(1, "Bank name is required"),
    bank_account_name: z.string().min(1, "Bank account name is required"),
    bank_account_number: z.string().min(1, "Bank account number is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch {
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/50 to-sky-50/40 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-10 border border-primary-200/50">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 border border-sky-200/50">
              <UserPlus className="h-8 w-8 text-sky-600" />
            </div>
            <h2 className="mt-8 text-3xl font-bold text-primary-900 tracking-tight">
              Create Your Account
            </h2>
            <p className="mt-3 text-lg text-primary-600 font-light">
              Join thousands of professionals creating beautiful invoices
            </p>
            <p className="mt-6 text-sm text-primary-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-accent-600 hover:text-accent-700 transition-colors duration-300"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-primary-700 mb-3"
                >
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  {...register("name")}
                  type="text"
                  autoComplete="name"
                  className="w-full px-4 py-4 bg-primary-50/50 border border-primary-200/60 rounded-full focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all duration-300 placeholder-primary-400 text-primary-900"
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-3 text-sm text-red-500 flex items-center font-light">
                    {errors.name?.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-primary-700 mb-3"
                >
                  Email Address <span className="text-red-400">*</span>
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
                    {errors.email?.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-primary-700 mb-3"
                >
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="w-full px-4 py-4 pr-12 bg-primary-50/50 border border-primary-200/60 rounded-full focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all duration-300 placeholder-primary-400 text-primary-900"
                    placeholder="Create a secure password"
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
                    {errors.password?.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-primary-700 mb-3"
                >
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="w-full px-4 py-4 pr-12 bg-primary-50/50 border border-primary-200/60 rounded-full focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all duration-300 placeholder-primary-400 text-primary-900"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-primary-400 hover:text-primary-600 transition-colors duration-300"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-3 text-sm text-red-500 flex items-center font-light">
                    {errors.confirmPassword?.message}
                  </p>
                )}
              </div>

              {/* Additional Profile Information */}
              <div className="pt-6 border-t border-primary-200/50">
                <h3 className="text-lg font-semibold text-primary-700 mb-6">
                  Business Information
                </h3>

                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-semibold text-primary-700 mb-3"
                    >
                      Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register("address")}
                      type="text"
                      className="w-full px-4 py-4 bg-primary-50/50 border border-primary-200/60 rounded-full focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all duration-300 placeholder-primary-400 text-primary-900"
                      placeholder="Enter your business address"
                    />
                    {errors.address && (
                      <p className="mt-3 text-sm text-red-500 flex items-center font-light">
                        {errors.address?.message}
                      </p>
                    )}
                  </div>{" "}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-primary-700 mb-3"
                    >
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register("phone")}
                      type="tel"
                      className="w-full px-4 py-4 bg-primary-50/50 border border-primary-200/60 rounded-full focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all duration-300 placeholder-primary-400 text-primary-900"
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && (
                      <p className="mt-3 text-sm text-red-500 flex items-center font-light">
                        {errors.phone?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="bank_name"
                      className="block text-sm font-semibold text-primary-700 mb-3"
                    >
                      Bank Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register("bank_name")}
                      type="text"
                      className="w-full px-4 py-4 bg-primary-50/50 border border-primary-200/60 rounded-full focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all duration-300 placeholder-primary-400 text-primary-900"
                      placeholder="Enter your bank name"
                    />
                    {errors.bank_name && (
                      <p className="mt-3 text-sm text-red-500 flex items-center font-light">
                        {errors.bank_name?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="bank_account_name"
                      className="block text-sm font-semibold text-primary-700 mb-3"
                    >
                      Bank Account Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register("bank_account_name")}
                      type="text"
                      className="w-full px-4 py-4 bg-primary-50/50 border border-primary-200/60 rounded-full focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all duration-300 placeholder-primary-400 text-primary-900"
                      placeholder="Enter account holder name"
                    />
                    {errors.bank_account_name && (
                      <p className="mt-3 text-sm text-red-500 flex items-center font-light">
                        {errors.bank_account_name?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="bank_account_number"
                      className="block text-sm font-semibold text-primary-700 mb-3"
                    >
                      Bank Account Number{" "}
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register("bank_account_number")}
                      type="text"
                      className="w-full px-4 py-4 bg-primary-50/50 border border-primary-200/60 rounded-full focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all duration-300 placeholder-primary-400 text-primary-900"
                      placeholder="Enter your account number"
                    />
                    {errors.bank_account_number && (
                      <p className="mt-3 text-sm text-red-500 flex items-center font-light">
                        {errors.bank_account_number?.message}
                      </p>
                    )}
                  </div>
                </div>
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
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-3" />
                    Create Account
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

export default RegisterPage;
