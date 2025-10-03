import React from "react";
import { useAuth } from "../context/AuthContext.tsx";
import type { InvoiceFormData } from "../types/index.ts";
import { formatDate } from "../utils/helper.ts";

interface InvoicePreviewProps {
  data: InvoiceFormData;
  className?: string;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ data, className }) => {
  const { user } = useAuth();

  const total = data.items.reduce(
    (sum: number, item) => sum + item.quantity * item.unit_price,
    0
  );
  const subtotal = total;
  const taxAmount = total * (data.tax_rate / 100);
  const finalTotal = subtotal + taxAmount + data.delivery_fee;

  return (
    <div className={`bg-white p-8 ${className || ""}`}>
      {/* Header */}
      <div className="mb-12">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">INVOICE</h1>
            {data.invoice_number && (
              <div className="text-sm text-gray-500">{data.invoice_number}</div>
            )}
          </div>
          <div className="text-right text-sm text-gray-600">
            <div className="mb-1">
              Issue Date:{" "}
              {data.issue_date
                ? formatDate(data.issue_date)
                : ""}
            </div>
            <div className="mb-3">
              Due Date:{" "}
              {data.due_date
                ? formatDate(data.due_date)
                : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Company and Client Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-12">
        {/* From Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
            FROM
          </h3>
          <div className="text-sm text-gray-800 space-y-1">
            {user ? (
              <>
                <div className="font-medium">{user.name}</div>
                {user.address && <div>{user.address}</div>}
                {user.email && <div>{user.email}</div>}
                {user.phone && <div>{user.phone}</div>}
              </>
            ) : (
              <>
                <div className="font-medium">
                  {data.sender_name || "Your Name"}
                </div>
                <div>
                  {data.sender_address || "123 Your Street, Your City, Country"}
                </div>
                <div>{data.sender_email || "contact@yourcompany.com"}</div>
                <div>{data.sender_phone || "+1 234 567 890"}</div>
              </>
            )}
          </div>
        </div>

        {/* To Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
            TO
          </h3>
          <div className="text-sm text-gray-800 space-y-1">
            <div className="font-medium">
              {data.client_name || "Client Name"}
            </div>
            {(data.client_address || !data.client_name) && (
              <div>
                {data.client_address || "123 Main Street, City, State, ZIP"}
              </div>
            )}
             {(data.client_email || !data.client_name) && (
              <div>{data.client_email || "client@example.com"}</div>
            )}
            {(data.client_phone || !data.client_name) && (
              <div>{data.client_phone || "+1 (555) 123-4567"}</div>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr>
              <th className="py-3 px-2 text-left bg-gray-50 font-semibold text-sm border-b-2 border-gray-200">
                Description
              </th>
              <th className="py-3 px-2 text-left bg-gray-50 font-semibold text-sm border-b-2 border-gray-200">
                Quantity
              </th>
              <th className="py-3 px-2 text-left bg-gray-50 font-semibold text-sm border-b-2 border-gray-200">
                Unit Price
              </th>
              <th className="py-3 px-2 text-left bg-gray-50 font-semibold text-sm border-b-2 border-gray-200">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index: number) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-4 text-sm text-gray-800">
                  {item.description}
                </td>
                <td className="py-4 text-sm text-gray-800">
                  {item.quantity}
                </td>
                <td className="py-4 text-sm text-gray-800">
                  IDR {item.unit_price.toLocaleString()}
                </td>
                <td className="py-4 text-sm text-gray-800">
                  IDR {(item.quantity * item.unit_price).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-80 space-y-3">
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-600">Subtotal:</span>
            <span className="text-sm text-gray-800">
              IDR {subtotal.toLocaleString()}
            </span>
          </div>
          {data.tax_rate > 0 && (
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">
                Tax ({data.tax_rate}%):
              </span>
              <span className="text-sm text-gray-800">
                IDR {taxAmount.toLocaleString()}
              </span>
            </div>
          )}
          {data.delivery_fee > 0 && (
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">
                Delivery Fee:
              </span>
              <span className="text-sm text-gray-800">
                IDR {data.delivery_fee.toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex justify-between py-3 border-t border-gray-300">
            <span className="text-base font-semibold text-gray-900">
              Total:
            </span>
            <span className="text-base font-bold text-gray-900">
              IDR {finalTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Terms and Notes */}
      <div className="mb-8 space-y-4">
        {data.notes && (
          <div>
            <span className="text-sm font-medium text-gray-700">Terms: </span>
            <span className="text-sm text-gray-700">{data.notes}</span>
          </div>
        )}
        <div className="text-sm text-gray-700">
          <span className="font-medium">Thank you</span> for your business!
        </div>
      </div>

      {/* Bank Account Details */}
      {(user?.bank_name || data.sender_bank_name) && (
        <div className="bg-gray-100 p-6 rounded">
          <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
            BANK ACCOUNT DETAILS
          </h3>
          <div className="text-sm text-gray-700 space-y-2">
            {(user?.bank_name || data.sender_bank_name) && (
              <div>
                <span className="font-medium">Bank Name:</span>
                <span className="ml-8">
                  {user?.bank_name || data.sender_bank_name}
                </span>
              </div>
            )}
            {(user?.bank_account_name || data.sender_bank_account_name) && (
              <div>
                <span className="font-medium">Account Name:</span>
                <span className="ml-4">
                  {user?.bank_account_name || data.sender_bank_account_name}
                </span>
              </div>
            )}
            {(user?.bank_account_number || data.sender_bank_account_number) && (
              <div>
                <span className="font-medium">Account Number:</span>
                <span className="ml-2">
                  {user?.bank_account_number || data.sender_bank_account_number}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicePreview;
