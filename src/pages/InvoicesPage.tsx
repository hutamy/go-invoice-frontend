import React, { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  ChevronDown,
} from "lucide-react";
import { Listbox, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { apiService } from "../utils/api.ts";
import type { Invoice } from "../types/index.ts";
import { formatDate } from "../utils/helper.ts";
import Navbar from "../components/Navbar.tsx";
import Pagination from "../components/Pagination.tsx";

const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());
  const [updatingStatusIds, setUpdatingStatusIds] = useState<Set<number>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "DRAFT" | "SENT" | "PAID" 
  >("ALL");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    invoice: Invoice | null;
  }>({
    show: false,
    invoice: null,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const loadInvoices = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        page_size: pageSize,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "ALL" && { status: statusFilter }),
      };

      const result = await apiService.getInvoices(params);
      setInvoices(result.data);
      setTotalPages(result.pagination.total_pages);
      setTotalItems(result.pagination.total_items);
      setPageSize(result.pagination.page_size);
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, statusFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadInvoices();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [loadInvoices]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status as "ALL" | "DRAFT" | "SENT" | "PAID" );
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    try {
      await apiService.deleteInvoice(invoice.id);
      setDeleteConfirm({ show: false, invoice: null });
      toast.success("Invoice deleted successfully");
      // Reload current page
      await loadInvoices();
    } catch {
      toast.error("Failed to delete invoice");
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

  const handleUpdateStatus = async (invoice: Invoice, newStatus: string) => {
    if (newStatus === invoice.status) return; // No change needed

    try {
      setUpdatingStatusIds((prev) => new Set(prev).add(invoice.id));
      await apiService.updateInvoiceStatus(invoice.id, newStatus);
      toast.success(`Invoice status updated to ${newStatus}`);
      // Reload invoices to reflect the change
      await loadInvoices();
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

  if (loading) {
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary-900 mb-2 tracking-tight">
                Invoices
              </h1>
              <p className="text-sm text-primary-600 font-light">
                Manage and track your invoices
              </p>
            </div>
            <Link
              to="/invoices/create"
              className="inline-flex text-sm items-center px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold rounded-full transition-all duration-300 shadow-xl shadow-sky-500/25 hover:shadow-2xl hover:shadow-sky-500/30"
            >
              <Plus className="h-4 w-4 mr-3" />
              Create Invoice
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-10 flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-primary-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-8 text-sm pr-4 py-4 bg-white/70 backdrop-blur-sm border border-primary-200/60 rounded-full focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all duration-300 placeholder-primary-400 text-primary-900"
                placeholder="Search invoices"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>
          <div className="sm:w-56">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-primary-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="block w-full pl-12 pr-4 text-sm py-4 bg-white/70 backdrop-blur-sm border border-primary-200/60 rounded-full focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all duration-300 text-primary-900 appearance-none"
              >
                <option value="ALL">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="PAID">Paid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invoices Grid */}
        {invoices.length === 0 ? (
          <div className="text-center py-20 bg-white/70 backdrop-blur-sm rounded-3xl border border-primary-200/50">
            <h3 className="text-xl font-bold text-primary-900 mb-3">
              No invoices
            </h3>
            <p className="text-sm text-primary-600 font-light mb-8">
              {searchTerm || statusFilter !== "ALL"
                ? "No invoices match your search criteria."
                : "Get started by creating your first invoice."}
            </p>
            {!searchTerm && statusFilter === "ALL" && (
              <div>
                <Link
                  to="/invoices/create"
                  className="inline-flex text-sm items-center px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold rounded-full transition-all duration-300 shadow-xl shadow-sky-500/25 hover:shadow-2xl hover:shadow-sky-500/30"
                >
                  <Plus className="h-4 w-4 mr-3" />
                  Create Invoice
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-sm border border-primary-200/50 rounded-3xl shadow-xl">
            <div className="overflow-x-auto overflow-y-visible max-w-full">
              <table className="w-full min-w-full divide-y divide-primary-200/50">
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
                  {invoices.map((invoice) => (
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
                                <Listbox.Options className="absolute z-50 w-24 mt-1 bg-white/95 backdrop-blur-sm border border-primary-200 rounded-xl shadow-xl overflow-hidden right-0">
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
                          <Link
                            to={`/invoices/edit/${invoice.id}`}
                            className="text-primary-600 hover:text-primary-800 p-2 rounded-full hover:bg-primary-50 transition-colors duration-200"
                            title="Edit Invoice"
                          >
                            <Edit className="h-4 w-4" />
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
                          <button
                            onClick={() =>
                              setDeleteConfirm({ show: true, invoice })
                            }
                            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                            title="Delete Invoice"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              loading={loading}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && deleteConfirm.invoice && (
        <div className="fixed inset-0 bg-primary-600/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border-0 w-96 shadow-2xl rounded-3xl bg-white/95 backdrop-blur-sm">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 border border-red-200/50">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-primary-900 mt-6 mb-4">
                Delete Invoice
              </h3>
              <div className="mt-2 px-4 py-3">
                <p className="text-primary-600 font-light leading-relaxed">
                  Are you sure you want to delete invoice{" "}
                  <strong className="font-semibold text-primary-900">
                    {deleteConfirm.invoice.invoice_number}
                  </strong>
                  ? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-4 px-4 py-6 mt-6">
                <button
                  onClick={() =>
                    setDeleteConfirm({ show: false, invoice: null })
                  }
                  className="flex-1 px-6 py-3 bg-white/70 backdrop-blur-sm text-primary-700 font-semibold rounded-full hover:bg-primary-50 transition-all duration-300 border border-primary-200/50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteInvoice(deleteConfirm.invoice!)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-full transition-all duration-300 shadow-xl shadow-red-500/25"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
