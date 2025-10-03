import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.tsx";
import { useState } from "react";

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white/90 backdrop-blur-lg border-b border-primary-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <span className="ml-4 text-2xl font-bold text-primary-900 tracking-tight">
                GoInvoice
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-2.5 text-sm font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-100 rounded-full transition-all"
                >
                  Dashboard
                </Link>
                <Link
                  to="/invoices"
                  className="px-4 py-2.5 text-sm font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-100 rounded-full transition-all"
                >
                  Invoices
                </Link>
                <Link
                  to="/clients"
                  className="px-4 py-2.5 text-sm font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-100 rounded-full transition-all"
                >
                  Clients
                </Link>
                <Link
                  to="/settings"
                  className="px-4 py-2.5 text-sm font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-100 rounded-full transition-all"
                >
                  Settings
                </Link>
                <div className="flex items-center space-x-4 ml-8 pl-8 border-l border-primary-200">
                  <div className="text-sm text-primary-600">
                    <span className="font-semibold text-accent-600">
                      {user?.name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2.5 text-primary-600 hover:text-primary-900 hover:bg-primary-100 rounded-full transition-all"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-sm font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-100 rounded-full transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="ml-4 px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-full hover:from-sky-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl hover:shadow-sky-500/25"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-primary-700 hover:text-primary-900 hover:bg-primary-100 rounded-full transition-all"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden animate-slide-up">
            <div className="px-2 pt-2 pb-4 space-y-1 bg-white/95 backdrop-blur-sm border-t border-primary-200/50">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 text-sm font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-100 rounded-full transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/invoices"
                    className="block px-3 py-2 text-sm font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-100 rounded-full transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Invoices
                  </Link>
                  <Link
                    to="/clients"
                    className="block px-3 py-2 text-sm font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-100 rounded-full transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Clients
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-3 py-2 text-sm font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-100 rounded-full transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <div className="border-t border-primary-200 pt-3 mt-3">
                    <div className="px-3 py-2 text-sm text-primary-600">
                      <span className="font-medium text-accent-600">
                        {user?.name}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-sm font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-100 rounded-full transition-all"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-sm font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-100 rounded-full transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block mx-3 mt-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-2 rounded-full hover:from-sky-600 hover:to-blue-700 transition-all text-center font-medium text-sm"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
