import React, { useState, useEffect, useCallback, Fragment } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { Listbox, Transition } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../context/AuthContext.tsx";
import { apiService } from "../utils/api.ts";
import type { InvoiceFormData, InvoiceItem, Client } from "../types/index.ts";

interface InvoiceFormProps {
  data: InvoiceFormData;
  onChange: (data: InvoiceFormData) => void;
  showClientSelection?: boolean;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  data,
  onChange,
  showClientSelection = true,
}) => {
  const { isAuthenticated, user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(
    data.client_id || null
  );

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    invoiceDetails: true,
    senderDetails: true,
    clientSelection: true,
    recipientDetails: true,
    invoiceItems: true,
    taxAndNotes: true,
    summary: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const loadClients = useCallback(async () => {
    if (isAuthenticated && showClientSelection) {
      const clientsData = await apiService.getClients({ page: 1, page_size: 25 });
      setClients(clientsData.data);
    }
  }, [isAuthenticated, showClientSelection]);

  useEffect(() => {
    if (isAuthenticated && showClientSelection) {
      loadClients();
    }
  }, [isAuthenticated, showClientSelection, loadClients]);

  const handleClientSelect = (clientId: string | null) => {
    if (!clientId) {
      setSelectedClientId(null);
      onChange({
        ...data,
        client_id: undefined,
        client_name: "",
        client_email: "",
        client_address: "",
        client_phone: "",
      });
      return;
    }

    const client = clients.find((c) => c.id === parseInt(clientId));
    if (client) {
      setSelectedClientId(client.id);
      onChange({
        ...data,
        client_id: client.id,
        client_name: client.name,
        client_email: client.email || "",
        client_address: client.address || "",
        client_phone: client.phone || "",
      });
    }
  };

  const handleInputChange = (
    field: keyof InvoiceFormData,
    value: string | number
  ) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = [...data.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // Calculate total for this item
    if (field === "quantity" || field === "unit_price") {
      newItems[index].total =
        newItems[index].quantity * newItems[index].unit_price;
    }

    onChange({
      ...data,
      items: newItems,
    });
  };

  const addItem = () => {
    onChange({
      ...data,
      items: [
        ...data.items,
        {
          description: "",
          quantity: 1,
          unit_price: 0,
          total: 0,
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    if (data.items.length > 1) {
      const newItems = data.items.filter((_, i) => i !== index);
      onChange({
        ...data,
        items: newItems,
      });
    }
  };

  const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * data.tax_rate) / 100;
  const total = subtotal + taxAmount + data.delivery_fee;

  return (
    <form className="space-y-8">
      {/* Invoice Details */}
      <div className="bg-gray-50/50 p-8 rounded-2xl border border-gray-200/50">
        <h3
          className={`text-lg font-medium flex items-center justify-between cursor-pointer text-accent-600 transition-colors select-none ${expandedSections.invoiceDetails ? "mb-8" : ""
            }`}
          onClick={() => toggleSection("invoiceDetails")}
        >
          <div className="flex items-center">Invoice Details</div>
          {expandedSections.invoiceDetails ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </h3>

        {expandedSections.invoiceDetails && (
          <div className="grid grid-cols-1 gap-6 mb-6 transition-all duration-300 ease-in-out">
            <div>
              <label className="block text-sm font-semibold text-primary-700 mb-3">
                Invoice Number <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={data.invoice_number}
                onChange={(e) =>
                  handleInputChange("invoice_number", e.target.value)
                }
                className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm"
                placeholder="INV-2025-001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-primary-700 mb-3">
                Issue Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <DatePicker
                  selected={data.issue_date ? new Date(data.issue_date) : null}
                  onChange={(date) => {
                    const formattedDate = date
                      ? date.toISOString().split("T")[0]
                      : "";
                    handleInputChange("issue_date", formattedDate);
                  }}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select issue date"
                  className="w-full px-4 py-3 pl-12 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 text-primary-900 shadow-sm"
                  wrapperClassName="w-full"
                  calendarClassName="shadow-xl border-0 rounded-2xl"
                  required
                />
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-400 pointer-events-none z-10" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-primary-700 mb-3">
                Due Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <DatePicker
                  selected={data.due_date ? new Date(data.due_date) : null}
                  onChange={(date) => {
                    const formattedDate = date
                      ? date.toISOString().split("T")[0]
                      : "";
                    handleInputChange("due_date", formattedDate);
                  }}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select due date"
                  className="w-full px-4 py-3 pl-12 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 text-primary-900 shadow-sm"
                  wrapperClassName="w-full"
                  calendarClassName="shadow-xl border-0 rounded-2xl"
                  required
                />
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-400 pointer-events-none z-10" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sender Details (Business Information) */}
      <div className="bg-blue-600/3 p-8 rounded-2xl border border-blue-200/30">
        <h3
          className={`text-lg font-medium flex items-center justify-between cursor-pointer text-accent-600 transition-colors select-none ${expandedSections.senderDetails ? "mb-6" : ""
            }`}
          onClick={() => toggleSection("senderDetails")}
        >
          <div className="flex items-center">Sender Details</div>
          {expandedSections.senderDetails ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </h3>

        {expandedSections.senderDetails && (
          <>
            {isAuthenticated && user ? (
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="bg-white/60 rounded-xl p-4">
                  <strong className="text-gray-700">Name:</strong>
                  <span className="ml-2 text-gray-900">{user.name}</span>
                </div>
                <div className="bg-white/60 rounded-xl p-4">
                  <strong className="text-gray-700">Email:</strong>
                  <span className="ml-2 text-gray-900">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="bg-white/60 rounded-xl p-4">
                    <strong className="text-gray-700">Phone:</strong>
                    <span className="ml-2 text-gray-900">{user.phone}</span>
                  </div>
                )}
                {user.address && (
                  <div className="bg-white/60 rounded-xl p-4">
                    <strong className="text-gray-700">Address:</strong>
                    <span className="ml-2 text-gray-900">{user.address}</span>
                  </div>
                )}
                {user.bank_name && (
                  <div className="bg-white/60 rounded-xl p-4">
                    <strong className="text-gray-700">Bank Details:</strong>
                    <span className="ml-2 text-gray-900">
                      {user.bank_name}
                      {user.bank_account_name && ` - ${user.bank_account_name}`}
                      {user.bank_account_number &&
                        ` (${user.bank_account_number})`}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-primary-700 mb-3">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.sender_name || ""}
                    onChange={(e) =>
                      handleInputChange("sender_name", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm"
                    placeholder="Your Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-700 mb-3">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={data.sender_email || ""}
                    onChange={(e) =>
                      handleInputChange("sender_email", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm"
                    placeholder="contact@yourcompany.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-700 mb-3">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={data.sender_phone || ""}
                    onChange={(e) =>
                      handleInputChange("sender_phone", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm"
                    placeholder="+1 234 567 890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-700 mb-3">
                    Address
                  </label>
                  <textarea
                    value={data.sender_address || ""}
                    onChange={(e) =>
                      handleInputChange("sender_address", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-2xl focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm resize-none"
                    rows={3}
                    placeholder="123 Your Street, Your City, Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-700 mb-3">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={data.sender_bank_name || ""}
                    onChange={(e) =>
                      handleInputChange("sender_bank_name", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm"
                    placeholder="National Bank"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-700 mb-3">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={data.sender_bank_account_name || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "sender_bank_account_name",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm"
                    placeholder="Your Company Ltd"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-700 mb-3">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={data.sender_bank_account_number || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "sender_bank_account_number",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm"
                    placeholder="1234567890"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Client Selection (if authenticated) */}
      {isAuthenticated && showClientSelection && (
        <div className="bg-gray-50/50 p-8 rounded-2xl border border-gray-200/50">
          <h3
            className={`text-lg font-medium flex items-center justify-between cursor-pointer text-accent-600 transition-colors select-none ${expandedSections.clientSelection ? "mb-4" : ""
              }`}
            onClick={() => toggleSection("clientSelection")}
          >
            <span>Select Existing Client (optional)</span>
            {expandedSections.clientSelection ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </h3>
          {expandedSections.clientSelection && (
            <div className="relative">
              <Listbox
                value={selectedClientId?.toString() || ""}
                onChange={(value) => handleClientSelect(value || null)}
              >
                <div className="relative">
                  <Listbox.Button className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 text-primary-900 shadow-sm text-left flex items-center justify-between">
                    <span
                      className={
                        selectedClientId
                          ? "text-primary-900"
                          : "text-primary-400"
                      }
                    >
                      {selectedClientId
                        ? clients.find((c) => c.id === selectedClientId)
                          ?.name || "Enter client details manually"
                        : "Enter client details manually"}
                    </span>
                    <ChevronDown className="h-5 w-5 text-primary-400 transition-transform duration-200 ui-open:rotate-180" />
                  </Listbox.Button>

                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-sm border border-primary-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                      <Listbox.Option
                        value=""
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-3 px-4 transition-colors first:rounded-t-2xl border-b border-primary-100/50 ${active
                            ? "bg-sky-50/80 text-sky-900"
                            : "text-primary-600"
                          }`
                        }
                      >
                        Enter client details manually
                      </Listbox.Option>
                      {clients.map((client) => (
                        <Listbox.Option
                          key={client.id}
                          value={client.id.toString()}
                          className={({ active, selected }) =>
                            `relative cursor-pointer select-none py-3 px-4 transition-colors border-b border-primary-100/50 last:border-b-0 last:rounded-b-2xl ${active ? "bg-sky-50/80" : ""
                            } ${selected
                              ? "bg-sky-100/60 text-sky-800 font-medium"
                              : "text-primary-700"
                            }`
                          }
                        >
                          <div>
                            {client.name}
                            {client.email && (
                              <div className="text-sm text-primary-500 mt-1">
                                {client.email}
                              </div>
                            )}
                          </div>
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
          )}
        </div>
      )}

      {/* Recipient Details */}
      <div className="bg-gray-50/50 p-8 rounded-2xl border border-gray-200/50">
        <h3
          className={
            "text-lg font-medium flex items-center justify-between cursor-pointer text-accent-600 transition-colors select-none " +
            (expandedSections.recipientDetails ? "mb-8" : "")
          }
          onClick={() => toggleSection("recipientDetails")}
        >
          <div className="flex items-center">Recipient Details</div>
          {expandedSections.recipientDetails ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </h3>
        {expandedSections.recipientDetails && (
          <div className="grid grid-cols-1 gap-6">
            {selectedClientId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Client selected:</strong> Fields are read-only. To
                  edit manually, select "Enter client details manually" above.
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-primary-700 mb-3">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={data.client_name}
                onChange={(e) =>
                  handleInputChange("client_name", e.target.value)
                }
                disabled={selectedClientId !== null}
                className={`w-full px-4 py-3 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm ${selectedClientId !== null
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "bg-white/80"
                  }`}
                placeholder="Client Name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-primary-700 mb-3">
                Email
              </label>
              <input
                type="email"
                value={data.client_email || ""}
                onChange={(e) =>
                  handleInputChange("client_email", e.target.value)
                }
                disabled={selectedClientId !== null}
                className={`w-full px-4 py-3 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm ${selectedClientId !== null
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "bg-white/80"
                  }`}
                placeholder="client@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-primary-700 mb-3">
                Phone
              </label>
              <input
                type="tel"
                value={data.client_phone || ""}
                onChange={(e) =>
                  handleInputChange("client_phone", e.target.value)
                }
                disabled={selectedClientId !== null}
                className={`w-full px-4 py-3 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm ${selectedClientId !== null
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "bg-white/80"
                  }`}
                placeholder="+1 234 567 890"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-primary-700 mb-3">
                Address
              </label>
              <textarea
                value={data.client_address || ""}
                onChange={(e) =>
                  handleInputChange("client_address", e.target.value)
                }
                disabled={selectedClientId !== null}
                className={`w-full px-4 py-3 border border-primary-200 rounded-2xl focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm resize-none ${selectedClientId !== null
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "bg-white/80"
                  }`}
                rows={3}
                placeholder="123 Client Street, Client City, Country"
              />
            </div>
          </div>
        )}
      </div>

      {/* Invoice Items */}
      <div className="bg-gray-50/50 p-8 rounded-2xl border border-gray-200/50">
        <h3
          className={
            "text-lg font-medium flex items-center justify-between cursor-pointer text-accent-600 transition-colors select-none " +
            (expandedSections.invoiceItems ? "mb-8" : "")
          }
          onClick={() => toggleSection("invoiceItems")}
        >
          <span>Invoice Items</span>
          {expandedSections.invoiceItems ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </h3>
        {expandedSections.invoiceItems && (
          <>
            <div className="space-y-6">
              {data.items.map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-8 border border-gray-200/60 rounded-2xl"
                >
                  <div className="grid grid-cols-1 gap-6 items-end">
                    <div>
                      <label className="block text-sm font-semibold text-primary-700 mb-3">
                        Description <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                        className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm"
                        placeholder="Item description"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-700 mb-3">
                        Quantity <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 text-primary-900 shadow-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-700 mb-3">
                        Unit Price <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "unit_price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 text-primary-900 shadow-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-700 mb-3">
                        Total
                      </label>
                      <input
                        type="text"
                        value={`IDR ${item.total.toFixed(2)}`}
                        readOnly
                        className="w-full px-4 py-3 bg-gray-100/60 border border-primary-200 rounded-full text-primary-700 font-medium shadow-sm"
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={data.items.length === 1}
                        className="w-full h-14 flex items-center justify-center text-red-500 hover:text-red-700 rounded-2xl transition-all duration-300 disabled:text-gray-300 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={addItem}
                className="mt-8 text-sm bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 inline-flex items-center shadow-xl shadow-sky-500/25 hover:shadow-2xl hover:shadow-sky-500/30 hover:-translate-y-0.5"
              >
                <Plus className="h-5 w-5 mr-3" />
                Add Item
              </button>
            </div>
          </>
        )}
      </div>

      {/* Tax and Notes */}
      <div className="bg-gray-50/50 p-8 rounded-2xl border border-gray-200/50">
        <h3
          className={
            "text-lg font-medium flex items-center justify-between cursor-pointer text-accent-600 transition-colors select-none " +
            (expandedSections.taxAndNotes ? "mb-8" : "")
          }
          onClick={() => toggleSection("taxAndNotes")}
        >
          <span>Tax & Notes</span>
          {expandedSections.taxAndNotes ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </h3>
        {expandedSections.taxAndNotes && (
          <div className="grid grid-cols-1 gap-8">
            <div>
              <label className="block text-sm font-semibold text-primary-700 mb-3">
                Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={data.tax_rate}
                onChange={(e) =>
                  handleInputChange("tax_rate", parseFloat(e.target.value) || 0)
                }
                className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-primary-700 mb-3">
                Delivery Fee
              </label>
              <input
                type="number"
                min="0"
                value={data.delivery_fee}
                onChange={(e) =>
                  handleInputChange("delivery_fee", parseFloat(e.target.value) || 0)
                }
                className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-primary-700 mb-3">
                Additional Notes
              </label>
              <textarea
                value={data.notes || ""}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-2xl focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm resize-none"
                rows={3}
                placeholder="Payment terms, thank you note, etc..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Totals Summary */}
      <div className="bg-blue-600/3 p-8 rounded-2xl border border-blue-200/30">
        <h3
          className={
            "text-lg font-medium flex items-center justify-between cursor-pointer text-accent-600 transition-colors select-none" +
            (expandedSections.summary ? " mb-6" : "")
          }
          onClick={() => toggleSection("summary")}
        >
          <span>Invoice Summary</span>
          {expandedSections.summary ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </h3>
        {expandedSections.summary && (
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-blue-200/50">
              <span className="text-gray-600 font-medium">Subtotal:</span>
              <span className="text-lg font-medium text-gray-900">
                IDR {subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-blue-200/50">
              <span className="text-gray-600 font-medium">
                Tax ({data.tax_rate}%):
              </span>
              <span className="text-lg font-medium text-gray-900">
                IDR {taxAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-blue-200/50">
              <span className="text-gray-600 font-medium">
                Delivery Fee:
              </span>
              <span className="text-lg font-medium text-gray-900">
                IDR {data.delivery_fee.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center py-4 bg-white rounded-2xl px-6">
              <span className="text-xl font-medium text-gray-900">Total:</span>
              <span className="text-2xl font-medium text-accent-600">
                IDR {total.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default InvoiceForm;
