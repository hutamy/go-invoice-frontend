import React, { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Users,
  Plus,
  Eye,
  Download,
  ChevronDown,
} from "lucide-react";
import { Listbox, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { apiService } from "../utils/api.ts";
import type { Invoice, Client, InvoiceSummary } from "../types/index.ts";
import { formatDate } from "../utils/helper.ts";
import Navbar from "../components/Navbar.tsx";

const DashboardPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<{ data: Client[]; pagination: { page: number; page_size: number; total_items: number; total_pages: number } }>({
    data: [],
    pagination: {
      page: 1,
      page_size: 10,
      total_items: 0,
      total_pages: 0,
    },
  });
  const [invoiceSummary, setInvoiceSummary] = useState<InvoiceSummary>({
    paid: 0,
    total_revenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatusIds, setUpdatingStatusIds] = useState<Set<number>>(
    new Set()
  );
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [invoicesResponse, clientsData, summaryData] = await Promise.all([
        apiService.getInvoices({ page: 1, page_size: 10 }), // Get only 10 invoices for dashboard
        apiService.getClients(), // Get all clients for dashboard stats
        apiService.getInvoiceSummary(),
      ]);
      setInvoices(invoicesResponse.data);
      setClients({
        data: clientsData.data,
        pagination: clientsData.pagination,
      });
      setInvoiceSummary(summaryData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (invoice: Invoice, newStatus: string) => {
    if (newStatus === invoice.status) return; // No change needed

    try {
      setUpdatingStatusIds((prev) => new Set(prev).add(invoice.id));
      await apiService.updateInvoiceStatus(invoice.id, newStatus);
      toast.success(`Invoice status updated to ${newStatus}`);
      // Reload dashboard data to reflect the change
      await loadDashboardData();
    } catch {
      toast.error("Failed to update invoice status");
    } finally {
      setUpdatingStatusIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(invoice.id);
        return newSet;
      });
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      setDownloadingIds((prev) => new Set(prev).add(invoice.id));
      const blob = await apiService.downloadInvoice(invoice.id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoice.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded successfully");
    } catch {
      toast.error("Failed to download invoice");
    } finally {
      setDownloadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(invoice.id);
        return newSet;
      });
    }
  };

  const stats = {
    totalInvoices: invoices.length,
    totalAmount: invoiceSummary.total_revenue,
    paidInvoices: invoices.filter((invoice) => invoice.status === "PAID")
      .length,
    paidAmount: invoiceSummary.paid,
    pendingAmount: invoiceSummary.total_revenue - invoiceSummary.paid,
    totalClients: clients.pagination.total_items,
  };

  // Show the 10 invoices we loaded (sorted by most recent)
  const recentInvoices = invoices.sort(
    (a, b) =>
      new Date(b.created_at || b.issue_date || "").getTime() -
      new Date(a.created_at || a.issue_date || "").getTime()
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-primary-50/50 to-sky-50/40">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/50 to-sky-50/40">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12">
        {/* Stats Grid */}

        <div className="grid grid-cols-1 bg-white sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="border border-gray-200/50 px-4 py-6 sm:px-6 lg:px-8 lg:rounded-l-2xl sm:rounded-t-2xl lg:rounded-tr-none hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 hover:border-sky-300/50">
            <p className="text-sm/6 font-medium text-gray-500">Total Invoice</p>
            <p className="mt-2 flex items-baseline gap-x-2">
              <span className="text-2xl font-bold tracking-tight text-gray-900">
                {stats.totalInvoices}
              </span>
            </p>
          </div>

          <div className="border border-gray-200/50 px-4 py-6 sm:px-6 lg:px-8 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 hover:border-sky-300/50">
            <p className="text-sm/6 font-medium text-gray-500">Total Revenue</p>
            <p className="mt-2 flex items-baseline gap-x-2">
              <span className="text-2xl font-bold tracking-tight text-gray-900">
                IDR {stats.totalAmount.toLocaleString()}
              </span>
            </p>
          </div>

          <div className="border border-gray-200/50 px-4 py-6 sm:px-6 lg:px-8 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 hover:border-sky-300/50">
            <p className="text-sm/6 font-medium text-gray-500">Paid Amount</p>
            <p className="mt-2 flex items-baseline gap-x-2">
              <span className="text-2xl font-bold tracking-tight text-gray-900">
                IDR {stats.paidAmount.toLocaleString()}
              </span>
            </p>
          </div>

          <div className="border border-gray-200/50 px-4 py-6 sm:px-6 lg:px-8 lg:rounded-r-2xl sm:rounded-b-2xl lg:rounded-bl-none hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 hover:border-sky-300/50">
            <p className="text-sm/6 font-medium text-gray-500">Total Clients</p>
            <p className="mt-2 flex items-baseline gap-x-2">
              <span className="text-2xl font-bold tracking-tight text-gray-900">
                {stats.totalClients}
              </span>
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary-900 mb-8 tracking-tight">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link
              to="/invoices/create"
              className="inline-flex items-center gap-x-4 group bg-white/70 backdrop-blur-sm border border-primary-200/50 rounded-2xl p-6 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 hover:border-sky-300/50"
            >
              <div className="bg-gradient-to-br from-sky-100 to-blue-100 rounded-2xl p-2 w-12 h-12 group-hover:from-sky-200 group-hover:to-blue-200 transition-colors border border-sky-200/50">
                <Plus className="h-7 w-7 text-accent-600" />
              </div>
              <div>
                <h3 className="font-bold text-primary-900 text-base">
                  Create Invoice
                </h3>
                <p className="text-primary-600 font-light leading-relaxed text-sm">
                  Generate a new invoice for your clients
                </p>
              </div>
            </Link>

            <Link
              to="/clients"
              className="inline-flex items-center gap-x-4 group bg-white/70 backdrop-blur-sm border border-primary-200/50 rounded-2xl p-6 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:border-purple-300/50"
            >
              <div className="bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl p-2 w-12 h-12 group-hover:from-purple-200 group-hover:to-violet-200 transition-colors border border-purple-200/50">
                <Users className="h-7 w-7 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-primary-900 text-base">
                  Manage Clients
                </h3>
                <p className="text-primary-600 font-light leading-relaxed text-sm">
                  Add or edit client information
                </p>
              </div>
            </Link>

            <Link
              to="/invoices"
              className="inline-flex items-center gap-x-4 group bg-white/70 backdrop-blur-sm border border-primary-200/50 rounded-2xl p-6 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:border-emerald-300/50"
            >
              <div className="bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl p-2 w-12 h-12 group-hover:from-emerald-200 group-hover:to-green-200 transition-colors border border-emerald-200/50">
                <FileText className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-primary-900 text-base">
                  View Invoices
                </h3>
                <p className="text-primary-600 font-light leading-relaxed text-sm">
                  Browse and manage all invoices
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Invoices */}
        {recentInvoices.length > 0 && (
          <div className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-primary-900 tracking-tight">
                  Recent Invoices
                </h2>
                <p className="text-sm text-primary-600 mt-1">
                  Showing latest 10 invoices
                </p>
              </div>
              <Link
                to="/invoices"
                className="inline-flex items-center px-6 py-3 text-sm bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold rounded-full transition-all duration-300 shadow-xl shadow-sky-500/25 hover:shadow-2xl hover:shadow-sky-500/30"
              >
                View all invoices
              </Link>
            </div>
            <div
              className="bg-white/70 backdrop-blur-sm border border-primary-200/50 rounded-3xl shadow-xl"
              style={{ overflow: "visible" }}
            >
              <div className="overflow-x-auto" style={{ overflow: "visible" }}>
                <table className="min-w-full divide-y divide-primary-200/50">
                  <thead className="bg-gradient-to-r from-primary-50 to-sky-50/30">
                    <tr>
                      <th className="px-8 py-5 text-left text-xs font-bold text-primary-700 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-primary-700 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-primary-700 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-primary-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-primary-700 uppercase tracking-wider">
                        Issue Date
                      </th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-primary-700 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-8 py-5 text-center text-xs font-bold text-primary-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-primary-200/30">
                    {recentInvoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="hover:bg-sky-50/50 transition-colors duration-200"
                      >
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-semibold text-primary-900">
                                {invoice.invoice_number}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-primary-800 font-medium">
                              {invoice.client_name}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-bold text-primary-900">
                              IDR {(invoice.total || 0).toLocaleString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="relative">
                            <Listbox
                              value={invoice.status}
                              onChange={(value) =>
                                handleUpdateStatus(invoice, value)
                              }
                              disabled={updatingStatusIds.has(invoice.id)}
                            >
                              <div className="relative">
                                <Listbox.Button
                                  className={`inline-flex items-center px-3 py-2 text-xs font-bold rounded-full border cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-20 justify-between ${
                                    invoice.status === "PAID"
                                      ? "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200"
                                      : invoice.status === "SENT"
                                      ? "bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-200"
                                      : "bg-primary-100 text-primary-800 border-primary-200 hover:bg-primary-200"
                                  }`}
                                  disabled={updatingStatusIds.has(invoice.id)}
                                >
                                  <span>
                                    {invoice.status.charAt(0).toUpperCase() +
                                      invoice.status.slice(1)}
                                  </span>
                                  <ChevronDown className="h-3 w-3 text-current transition-transform duration-200 ui-open:rotate-180" />
                                </Listbox.Button>

                                <Transition
                                  as={Fragment}
                                  leave="transition ease-in duration-100"
                                  leaveFrom="opacity-100"
                                  leaveTo="opacity-0"
                                >
                                  <Listbox.Options className="absolute z-[9999] w-24 mt-1 bg-white/95 backdrop-blur-sm border border-primary-200 rounded-xl shadow-2xl overflow-hidden right-0">
                                    <Listbox.Option
                                      value="DRAFT"
                                      className={({ active, selected }) =>
                                        `relative cursor-pointer select-none py-2 px-3 transition-colors text-xs font-bold first:rounded-t-xl ${
                                          active ? "bg-primary-50/80" : ""
                                        } ${
                                          selected
                                            ? "bg-primary-100/60 text-primary-800"
                                            : "text-primary-700"
                                        }`
                                      }
                                    >
                                      Draft
                                    </Listbox.Option>
                                    <Listbox.Option
                                      value="SENT"
                                      className={({ active, selected }) =>
                                        `relative cursor-pointer select-none py-2 px-3 transition-colors text-xs font-bold ${
                                          active ? "bg-sky-50/80" : ""
                                        } ${
                                          selected
                                            ? "bg-sky-100/60 text-sky-800"
                                            : "text-sky-700"
                                        }`
                                      }
                                    >
                                      Sent
                                    </Listbox.Option>
                                    <Listbox.Option
                                      value="PAID"
                                      className={({ active, selected }) =>
                                        `relative cursor-pointer select-none py-2 px-3 transition-colors text-xs font-bold last:rounded-b-xl ${
                                          active ? "bg-emerald-50/80" : ""
                                        } ${
                                          selected
                                            ? "bg-emerald-100/60 text-emerald-800"
                                            : "text-emerald-700"
                                        }`
                                      }
                                    >
                                      Paid
                                    </Listbox.Option>
                                  </Listbox.Options>
                                </Transition>
                              </div>
                            </Listbox>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-primary-700 font-medium">
                              {formatDate(invoice.issue_date ?? "")}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-primary-700 font-medium">
                              {formatDate(invoice.due_date ?? "")}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-3">
                            <Link
                              to={`/invoices/${invoice.id}`}
                              className="text-sky-600 hover:text-sky-800 p-2 rounded-full hover:bg-sky-50 transition-colors duration-200"
                              title="View Invoice"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDownloadInvoice(invoice)}
                              disabled={downloadingIds.has(invoice.id)}
                              className="text-emerald-600 hover:text-emerald-800 p-2 rounded-full hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                              title={
                                downloadingIds.has(invoice.id)
                                  ? "Downloading..."
                                  : "Download PDF"
                              }
                            >
                              <Download
                                className={`h-4 w-4 ${
                                  downloadingIds.has(invoice.id)
                                    ? "animate-spin"
                                    : ""
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {recentInvoices.length === 0 && (
          <div className="text-center py-20 bg-white/70 backdrop-blur-sm rounded-3xl border border-primary-200/50">
            <h3 className="text-xl font-bold text-primary-900 mb-3">
              No invoices yet
            </h3>
            <p className="text-sm text-primary-600 font-light mb-8">
              Get started by creating your first invoice.
            </p>
            <div>
              <Link
                to="/invoices/create"
                className="inline-flex items-center text-sm px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold rounded-full transition-all duration-300 shadow-xl shadow-sky-500/25 hover:shadow-2xl hover:shadow-sky-500/30"
              >
                <Plus className="-ml-1 mr-3 h-5 w-5" />
                Create Invoice
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
