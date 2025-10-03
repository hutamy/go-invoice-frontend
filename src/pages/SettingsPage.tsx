import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User as UserIcon,
  Building,
  CreditCard,
  Eye,
  EyeOff,
  Lock,
  AlertTriangle,
  UserX,
  Shield,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.tsx";
import Navbar from "../components/Navbar.tsx";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
});

const bankingSchema = z.object({
  bank_name: z.string().min(1, "Bank name is required"),
  bank_account_name: z.string().min(1, "Account name is required"),
  bank_account_number: z.string().min(1, "Account number is required"),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirm_password: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type BankingFormData = z.infer<typeof bankingSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const SettingsPage: React.FC = () => {
  const {
    user,
    updateUserProfile,
    updateUserBanking,
    changeUserPassword,
    deactivateAccount,
  } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "profile" | "banking" | "password" | "account"
  >("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      address: user?.address || "",
      phone: user?.phone || "",
    },
  });

  const bankingForm = useForm<BankingFormData>({
    resolver: zodResolver(bankingSchema),
    defaultValues: {
      bank_name: user?.bank_name || "",
      bank_account_name: user?.bank_account_name || "",
      bank_account_number: user?.bank_account_number || "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        email: user.email,
        address: user.address,
        phone: user.phone,
      });
      bankingForm.reset({
        bank_name: user.bank_name,
        bank_account_name: user.bank_account_name,
        bank_account_number: user.bank_account_number,
      });
    }
  }, [user, profileForm, bankingForm]);

  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      await updateUserProfile(data);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const onSubmitBanking = async (data: BankingFormData) => {
    try {
      await updateUserBanking(data);
      toast.success("Banking information updated successfully");
    } catch {
      toast.error("Failed to update banking information");
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    try {
      await changeUserPassword({
        old_password: data.current_password,
        new_password: data.new_password,
      });
      toast.success("Password changed successfully");
      passwordForm.reset();
    } catch {
      toast.error("Failed to change password");
    }
  };

  const handleDeactivateAccount = async () => {
    try {
      await deactivateAccount();
      toast.success(
        "Account deactivated successfully. You have been logged out."
      );
      navigate("/");
    } catch {
      toast.error("Failed to deactivate account");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/50 to-sky-50/40">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/50 to-sky-50/40">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-primary-900 mb-4 tracking-tight">
            Settings
          </h1>
          <p className="text-xl text-primary-600 font-light">
            Manage your account and preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-primary-200/50 mb-10">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-3 px-1 border-b-2 font-semibold text-sm transition-all duration-300 ${
                activeTab === "profile"
                  ? "border-accent-500 text-accent-600"
                  : "border-transparent text-primary-500 hover:text-primary-700 hover:border-primary-300"
              }`}
            >
              <UserIcon className="h-5 w-5 inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("banking")}
              className={`py-3 px-1 border-b-2 font-semibold text-sm transition-all duration-300 ${
                activeTab === "banking"
                  ? "border-accent-500 text-accent-600"
                  : "border-transparent text-primary-500 hover:text-primary-700 hover:border-primary-300"
              }`}
            >
              <CreditCard className="h-5 w-5 inline mr-2" />
              Banking
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`py-3 px-1 border-b-2 font-semibold text-sm transition-all duration-300 ${
                activeTab === "password"
                  ? "border-accent-500 text-accent-600"
                  : "border-transparent text-primary-500 hover:text-primary-700 hover:border-primary-300"
              }`}
            >
              <Lock className="h-5 w-5 inline mr-2" />
              Password
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`py-3 px-1 border-b-2 font-semibold text-sm transition-all duration-300 ${
                activeTab === "account"
                  ? "border-accent-500 text-accent-600"
                  : "border-transparent text-primary-500 hover:text-primary-700 hover:border-primary-300"
              }`}
            >
              <Shield className="h-5 w-5 inline mr-2" />
              Account
            </button>
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-xl border border-white/20">
            <div className="px-8 py-6 border-b border-primary-200/30">
              <h3 className="text-xl font-bold text-primary-900">
                Profile Information
              </h3>
              <p className="text-sm text-primary-600 mt-2">
                Update your personal information and contact details.
              </p>
            </div>
            <form
              onSubmit={profileForm.handleSubmit(onSubmitProfile)}
              className="p-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-primary-700 mb-3"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    {...profileForm.register("name")}
                    className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm"
                    placeholder="Your full name"
                  />
                  {profileForm.formState.errors.name && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {profileForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-primary-700 mb-3"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...profileForm.register("email")}
                    className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm"
                    placeholder="your@email.com"
                  />
                  {profileForm.formState.errors.email && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {profileForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-primary-700 mb-3"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    {...profileForm.register("phone")}
                    className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm"
                    placeholder="+1 (555) 123-4567"
                  />
                  {profileForm.formState.errors.phone && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {profileForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-semibold text-primary-700 mb-3"
                  >
                    Address
                  </label>
                  <textarea
                    {...profileForm.register("address")}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-2xl focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm resize-none"
                    placeholder="123 Business Street, City, State 12345"
                  />
                  {profileForm.formState.errors.address && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {profileForm.formState.errors.address.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  type="submit"
                  disabled={profileForm.formState.isSubmitting}
                  className="inline-flex items-center px-8 py-3 text-sm font-semibold rounded-full shadow-lg text-white bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                >
                  {profileForm.formState.isSubmitting
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Banking Tab */}
        {activeTab === "banking" && (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-xl border border-white/20">
            <div className="px-8 py-6 border-b border-primary-200/30">
              <h3 className="text-xl font-bold text-primary-900">
                Banking Information
              </h3>
              <p className="text-sm text-primary-600 mt-2">
                Update your banking details for invoice payments.
              </p>
            </div>
            <form
              onSubmit={bankingForm.handleSubmit(onSubmitBanking)}
              className="p-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label
                    htmlFor="bank_name"
                    className="block text-sm font-semibold text-primary-700 mb-3"
                  >
                    Bank Name
                  </label>
                  <input
                    type="text"
                    {...bankingForm.register("bank_name")}
                    className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm"
                    placeholder="Your Bank Name"
                  />
                  {bankingForm.formState.errors.bank_name && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {bankingForm.formState.errors.bank_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="bank_account_name"
                    className="block text-sm font-semibold text-primary-700 mb-3"
                  >
                    Account Name
                  </label>
                  <input
                    type="text"
                    {...bankingForm.register("bank_account_name")}
                    className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm"
                    placeholder="Account holder name"
                  />
                  {bankingForm.formState.errors.bank_account_name && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {bankingForm.formState.errors.bank_account_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="bank_account_number"
                    className="block text-sm font-semibold text-primary-700 mb-3"
                  >
                    Account Number
                  </label>
                  <input
                    type="text"
                    {...bankingForm.register("bank_account_number")}
                    className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm"
                    placeholder="Account number"
                  />
                  {bankingForm.formState.errors.bank_account_number && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {bankingForm.formState.errors.bank_account_number.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-accent-50/60 border border-accent-200/60 rounded-2xl p-6 mt-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Building className="h-6 w-6 text-accent-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-bold text-accent-800">
                      Banking Information Security
                    </h3>
                    <div className="mt-2 text-sm text-accent-700">
                      <p>
                        Your banking information is encrypted and securely
                        stored. This information will appear on your invoices to
                        facilitate payments from clients.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  type="submit"
                  disabled={bankingForm.formState.isSubmitting}
                  className="inline-flex items-center px-8 py-3 text-sm font-semibold rounded-full shadow-lg text-white bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                >
                  {bankingForm.formState.isSubmitting
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-xl border border-white/20">
            <div className="px-8 py-6 border-b border-primary-200/30">
              <h3 className="text-xl font-bold text-primary-900">
                Change Password
              </h3>
              <p className="text-sm text-primary-600 mt-2">
                Update your password to keep your account secure.
              </p>
            </div>
            <form
              onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
              className="p-8"
            >
              <div className="space-y-8">
                <div>
                  <label
                    htmlFor="current_password"
                    className="block text-sm font-semibold text-primary-700 mb-3"
                  >
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      {...passwordForm.register("current_password")}
                      className="w-full px-4 py-3 pr-12 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5 text-primary-400 hover:text-primary-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-primary-400 hover:text-primary-600" />
                      )}
                    </button>
                  </div>
                  {passwordForm.formState.errors.current_password && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {passwordForm.formState.errors.current_password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="new_password"
                    className="block text-sm font-semibold text-primary-700 mb-3"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      {...passwordForm.register("new_password")}
                      className="w-full px-4 py-3 pr-12 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-primary-400 hover:text-primary-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-primary-400 hover:text-primary-600" />
                      )}
                    </button>
                  </div>
                  {passwordForm.formState.errors.new_password && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {passwordForm.formState.errors.new_password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirm_password"
                    className="block text-sm font-semibold text-primary-700 mb-3"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      {...passwordForm.register("confirm_password")}
                      className="w-full px-4 py-3 pr-12 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-primary-400 hover:text-primary-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-primary-400 hover:text-primary-600" />
                      )}
                    </button>
                  </div>
                  {passwordForm.formState.errors.confirm_password && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {passwordForm.formState.errors.confirm_password.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-6 mt-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Lock className="h-6 w-6 text-amber-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-bold text-amber-800">
                      Password Security
                    </h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <p>
                        Choose a strong password with at least 6 characters.
                        Include a mix of letters, numbers, and symbols for
                        better security.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  type="submit"
                  disabled={passwordForm.formState.isSubmitting}
                  className="inline-flex items-center px-8 py-3 text-sm font-semibold rounded-full shadow-lg text-white bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                >
                  {passwordForm.formState.isSubmitting
                    ? "Changing..."
                    : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-xl border border-white/20">
            <div className="px-8 py-6 border-b border-primary-200/30">
              <h3 className="text-xl font-bold text-primary-900">
                Account Management
              </h3>
              <p className="text-sm text-primary-600 mt-2">
                Manage your account settings and data.
              </p>
            </div>
            <div className="p-8">
              <div className="space-y-8">
                {/* Account Deactivation Section */}
                <div className="bg-red-50/80 border border-red-200/80 rounded-2xl p-8">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-7 w-7 text-red-500" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-bold text-red-800">
                        Deactivate Account
                      </h3>
                      <div className="mt-3 text-sm text-red-700 leading-relaxed">
                        <p>
                          Deactivating your account will temporarily disable
                          your access to the platform. Your data (invoices,
                          clients, etc.) will be preserved and can be restored
                          by registering again with the same email address.
                        </p>
                        <p className="mt-3 font-semibold">
                          To restore your account later: Simply go to the
                          registration page and sign up again using the same
                          email address.
                        </p>
                      </div>
                      <div className="mt-6">
                        <div className="flex space-x-4">
                          {!showDeactivateConfirm ? (
                            <button
                              type="button"
                              onClick={() => setShowDeactivateConfirm(true)}
                              className="inline-flex items-center px-6 py-3 border border-red-300 text-sm font-semibold rounded-full text-red-700 bg-red-50/80 hover:bg-red-100/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                            >
                              <UserX className="h-5 w-5 mr-2" />
                              Deactivate Account
                            </button>
                          ) : (
                            <div className="space-y-4">
                              <p className="text-sm font-bold text-red-800">
                                Are you sure you want to deactivate your
                                account?
                              </p>
                              <div className="flex space-x-4">
                                <button
                                  type="button"
                                  onClick={handleDeactivateAccount}
                                  className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-full text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                                >
                                  Yes, Deactivate
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowDeactivateConfirm(false)
                                  }
                                  className="inline-flex items-center px-6 py-3 border border-primary-300 text-sm font-semibold rounded-full text-primary-700 bg-white/80 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
