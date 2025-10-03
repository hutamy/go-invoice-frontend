import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "react-toastify";
import { apiService } from "../utils/api.ts";
import InvoicePreview from "../components/InvoicePreview.tsx";
import type { Invoice, InvoiceFormData } from "../types/index.ts";
import Navbar from "../components/Navbar.tsx";

const ViewInvoicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const handleBackClick = () => {
    // Go back to the previous page in history
    navigate(-1);
  };

  const loadInvoice = useCallback(
    async (invoiceId: number) => {
      try {
        setLoading(true);
        const data = await apiService.getInvoice(invoiceId);
        setInvoice(data);
      } catch {
        toast.error("Failed to load invoice");
        navigate("/invoices");
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    if (id) {
      loadInvoice(parseInt(id));
    }
  }, [id, loadInvoice]);

  const handleDownload = async () => {
    if (!invoice) return;

    try {
      setDownloading(true);
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
      setDownloading(false);
    }
  };

  // Convert Invoice to InvoiceFormData for the preview component
  const convertToFormData = (invoice: Invoice): InvoiceFormData => {
    return {
      client_id: invoice.client_id,
      client_name: invoice.client_name,
      client_email: invoice.client_email || "",
      client_address: invoice.client_address || "",
      client_phone: invoice.client_phone || "",
      invoice_number: invoice.invoice_number,
      issue_date: invoice.issue_date || "",
      due_date: invoice.due_date,
      tax_rate: invoice.tax_rate,
      notes: invoice.notes || "",
      status: invoice.status,
      delivery_fee: invoice.delivery_fee,
      items: invoice.items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
      })),
    };
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

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/50 to-sky-50/40">
        <Navbar />
        <div className="text-center py-20 bg-white/70 backdrop-blur-sm rounded-3xl border border-primary-200/50">
          <h3 className="text-xl font-bold text-primary-900 mb-3">
            Invoice Not Found
          </h3>
          <p className="text-sm text-primary-600 font-light mb-8">
            The invoice you're looking for doesn't exist.
          </p>

          <div>
            <Link
              to="/invoices"
              className="inline-flex text-sm items-center px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold rounded-full transition-all duration-300 shadow-xl shadow-sky-500/25 hover:shadow-2xl hover:shadow-sky-500/30"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackClick}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Invoices
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex text-sm items-center px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold rounded-full transition-all duration-300 shadow-xl shadow-sky-500/25 hover:shadow-2xl hover:shadow-sky-500/30"
              >
                <Download className="h-4 w-4 mr-2" />
                {downloading ? "Downloading..." : "Download PDF"}
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <InvoicePreview data={convertToFormData(invoice)} />
        </div>
      </div>
    </div>
  );
};

export default ViewInvoicePage;
