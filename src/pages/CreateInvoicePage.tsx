import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "react-toastify";
import InvoiceForm from "../components/InvoiceForm.tsx";
import InvoicePreview from "../components/InvoicePreview.tsx";
import { apiService } from "../utils/api.ts";
import type { InvoiceFormData, Invoice } from "../types/index.ts";
import Navbar from "../components/Navbar.tsx";

const CreateInvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(isEditMode);
  const [invoiceData, setInvoiceData] = useState<InvoiceFormData>({
    invoice_number: `INV-${Date.now()}`,
    issue_date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    client_id: undefined,
    client_name: "",
    client_email: "",
    client_address: "",
    client_phone: "",
    items: [
      {
        description: "",
        quantity: 1,
        unit_price: 0,
        total: 0,
      },
    ],
    tax_rate: 0,
    delivery_fee: 0,
    notes: "",
    status: "DRAFT",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load invoice data for editing
  const loadInvoiceForEdit = useCallback(
    async (invoiceId: number) => {
      try {
        setLoading(true);
        const invoice: Invoice = await apiService.getInvoice(invoiceId);

        // Convert Invoice to InvoiceFormData
        setInvoiceData({
          client_id: invoice.client_id,
          client_name: invoice.client_name,
          client_email: invoice.client_email || "",
          client_address: invoice.client_address || "",
          client_phone: invoice.client_phone || "",
          invoice_number: invoice.invoice_number,
          issue_date: invoice.issue_date
            ? new Date(invoice.issue_date).toISOString().split("T")[0]
            : "",
          due_date: invoice.due_date
            ? new Date(invoice.due_date).toISOString().split("T")[0]
            : "",
          tax_rate: invoice.tax_rate,
          delivery_fee: invoice.delivery_fee,
          notes: invoice.notes || "",
          status: invoice.status,
          items: invoice.items.map((item) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total,
          })),
        });
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
    if (isEditMode && id) {
      loadInvoiceForEdit(parseInt(id));
    }
  }, [isEditMode, id, loadInvoiceForEdit]);

  const handleFormChange = (data: InvoiceFormData) => {
    setInvoiceData(data);
  };

  const isFormValid = () => {
    const basicValidation =
      invoiceData.invoice_number &&
      invoiceData.issue_date &&
      invoiceData.due_date &&
      invoiceData.items.length > 0 &&
      invoiceData.items.every(
        (item) => item.description && item.quantity > 0 && item.unit_price >= 0
      );

    // If client_id is present, user selected from list - only client_id is required
    if (invoiceData.client_id) {
      return basicValidation;
    }

    // If no client_id, user is entering manually - require manual fields
    const manualClientValidation =
      invoiceData.client_name &&
      invoiceData.client_email &&
      invoiceData.client_address &&
      invoiceData.client_phone;

    return basicValidation && manualClientValidation;
  };

  const handleSaveAsDraft = async () => {
    if (!isFormValid()) {
      if (invoiceData.client_id) {
        toast.error(
          "Please fill in all required fields (invoice number, dates, and items)"
        );
      } else {
        toast.error(
          "Please fill in all required fields (invoice number, dates, client details, and items)"
        );
      }
      return;
    }

    try {
      setIsSaving(true);

      if (isEditMode && id) {
        // Update existing invoice
        await apiService.updateInvoice(parseInt(id), {
          ...invoiceData,
          status: "DRAFT",
        });
        toast.success("Invoice updated successfully!");
      } else {
        // Create new invoice
        await apiService.createInvoice({
          ...invoiceData,
          status: "DRAFT",
        });
        toast.success("Invoice created successfully!");
      }

      navigate("/invoices");
    } catch {
      toast.error("Failed to save invoice");
    } finally {
      setIsSaving(false);
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/invoices"
                className="inline-flex items-center text-sm text-primary-500 hover:text-accent-600 font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Invoices
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveAsDraft}
                disabled={isSaving || !isFormValid()}
                className="inline-flex items-center px-8 py-3 text-sm font-semibold rounded-full shadow-lg text-white bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              >
                <Save className="h-5 w-5 mr-2" />
                {isSaving
                  ? "Saving..."
                  : isEditMode
                  ? "Update Invoice"
                  : "Save Invoice"}
              </button>
            </div>
          </div>
          <div className="mt-6">
            <h1 className="text-3xl font-bold text-primary-900 mb-2 tracking-tight">
              {isEditMode ? "Edit Invoice" : "Create Invoice"}
            </h1>
            <p className="text-sm text-primary-600 font-light">
              Fill in the details below and see the live preview on the right
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Form Section */}
          <div>
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-primary-200/50 overflow-hidden">
              <div className="bg-gray-50 px-10 py-6 border-b border-primary-200">
                <h2 className="text-2xl font-bold text-primary-800 flex items-center">
                  Invoice Details
                </h2>
              </div>
              <div className="p-10">
                <InvoiceForm
                  data={invoiceData}
                  onChange={handleFormChange}
                  showClientSelection={true}
                />
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div>
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-primary-200/50 overflow-hidden">
              <div className="bg-gray-50 border-b border-primary-200 px-10 py-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-primary-800 flex items-center">
                    Preview
                  </h2>
                </div>
              </div>
              <div className="p-10">
                <div className="bg-gradient-to-br from-primary-50/80 to-sky-50/60 rounded-2xl p-8 border border-primary-200/40">
                  <div
                    className="transform scale-75 origin-top-left overflow-hidden"
                    style={{ width: "133%" }}
                  >
                    <InvoicePreview data={invoiceData} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoicePage;
