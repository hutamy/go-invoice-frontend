import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { apiService } from "../utils/api.ts";
import type { Client } from "../types/index.ts";
import Navbar from "../components/Navbar.tsx";
import Pagination from "../components/Pagination.tsx";

const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Client | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  const loadClients = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        page_size: pageSize,
        ...(searchTerm && { search: searchTerm }),
      };

      const result = await apiService.getClients(params);
      setClients(result.data);
      setTotalPages(result.pagination.total_pages);
      setTotalItems(result.pagination.total_items);
      setPageSize(result.pagination.page_size);
    } catch {
      toast.error("Failed to load clients");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchTerm]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadClients();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [loadClients]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // No need for client-side filtering since we're filtering on backend
  const filteredClients = clients;

  const openCreateModal = () => {
    setEditingClient(null);
    reset({ name: "", email: "", phone: "", address: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    reset({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    reset();
  };

  const onSubmit = async (data: ClientFormData) => {
    try {
      const clientData = {
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
      };

      if (editingClient) {
        await apiService.updateClient(editingClient.id, clientData);
        toast.success("Client updated successfully");
      } else {
        await apiService.createClient(clientData);
        toast.success("Client created successfully");
      }

      await loadClients();
      closeModal();
    } catch {
      toast.error("Failed to save client");
    }
  };

  const handleDelete = async (client: Client) => {
    try {
      await apiService.deleteClient(client.id);
      toast.success("Client deleted successfully");
      setDeleteConfirm(null);
      // Reload current page
      await loadClients();
    } catch {
      toast.error("Failed to delete client");
    }
  };

  if (isLoading) {
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary-900 mb-2 tracking-tight">
                Clients
              </h1>
              <p className="text-sm text-primary-600 font-light">
                Manage your client relationships
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center text-sm px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold rounded-full transition-all duration-300 shadow-xl shadow-sky-500/25 hover:shadow-2xl hover:shadow-sky-500/30"
            >
              <Plus className="h-4 w-4 mr-3" />
              Create Client
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-primary-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-8 text-sm pr-4 py-4 bg-white/70 backdrop-blur-sm border border-primary-200/60 rounded-full focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all duration-300 placeholder-primary-400 text-primary-900"
              placeholder="Search clients"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Clients Grid */}
        {filteredClients.length === 0 ? (
          <div className="text-center py-20 bg-white/70 backdrop-blur-sm rounded-3xl border border-primary-200/50">
            <h3 className="text-xl font-bold text-primary-900 mb-3">
              {searchTerm ? "No clients found" : "No clients"}
            </h3>
            <p className="text-sm text-primary-600 font-light mb-8">
              {searchTerm
                ? "Try adjusting your search criteria."
                : "Get started by adding your first client."}
            </p>
            {!searchTerm && (
              <div>
                <button
                  onClick={openCreateModal}
                  className="inline-flex text-sm items-center px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold rounded-full transition-all duration-300 shadow-xl shadow-sky-500/25 hover:shadow-2xl hover:shadow-sky-500/30"
                >
                  <Plus className="h-4 w-4 mr-3" />
                  Create Client
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {client.name}
                    </h3>

                    {client.email && (
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {client.email}
                      </div>
                    )}

                    {client.phone && (
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {client.phone}
                      </div>
                    )}

                    {client.address && (
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {client.address}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(client)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit client"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(client)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete client"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredClients.length > 0 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              loading={isLoading}
            />
          </div>
        )}
      </div>

      {/* Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full border border-white/20">
            <div className="flex items-center justify-between p-8 border-b border-primary-200/30">
              <h3 className="text-xl font-bold text-primary-900">
                {editingClient ? "Edit Client" : "Create New Client"}
              </h3>
              <button
                onClick={closeModal}
                className="text-primary-400 hover:text-primary-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8">
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-primary-700 mb-3"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm"
                    placeholder="Client name"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-primary-700 mb-3"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm"
                    placeholder="client@example.com"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-primary-700 mb-3"
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    {...register("phone")}
                    className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-full focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-semibold text-primary-700 mb-3"
                  >
                    Address
                  </label>
                  <textarea
                    {...register("address")}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/80 border border-primary-200 rounded-2xl focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all duration-200 placeholder-primary-400 text-primary-900 shadow-sm resize-none"
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 text-sm font-semibold text-primary-700 bg-white/80 border border-primary-300 rounded-full hover:bg-primary-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingClient
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full border border-white/20">
            <div className="p-8">
              <h3 className="text-xl font-bold text-primary-900 mb-4">
                Delete Client
              </h3>
              <p className="text-primary-600 mb-8 leading-relaxed">
                Are you sure you want to delete{" "}
                <strong className="text-primary-900">
                  {deleteConfirm.name}
                </strong>
                ? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-6 py-3 text-sm font-semibold text-primary-700 bg-white/80 border border-primary-300 rounded-full hover:bg-primary-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-6 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-full transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
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

export default ClientsPage;
