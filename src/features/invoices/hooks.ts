import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as invoiceApi from "./api";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export const useInvoices = (params: invoiceApi.InvoiceParams) => {
  return useQuery({
    queryKey: ["pharmacy-invoices", params],
    queryFn: () => invoiceApi.getInvoices(params),
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ["pharmacy-invoice", id],
    queryFn: () => invoiceApi.getInvoiceById(id),
    enabled: Boolean(id),
  });
};

export const useInvoicePayments = (id: string) => {
  return useQuery({
    queryKey: ["pharmacy-invoice-payments", id],
    queryFn: () => invoiceApi.getInvoicePayments(id),
    enabled: Boolean(id),
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invoiceApi.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["pharmacy-inventory"] });
      toast.success("Invoice created successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to create invoice");
    },
  });
};

export const useCreateInvoicePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invoiceApi.createInvoicePayment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["pharmacy-invoice", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["pharmacy-invoice-payments", variables.id] });
      toast.success("Payment recorded");
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to record payment");
    },
  });
};

export const useCancelInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invoiceApi.cancelInvoice,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["pharmacy-invoice", id] });
      queryClient.invalidateQueries({ queryKey: ["pharmacy-inventory"] });
      toast.success("Invoice cancelled");
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to cancel invoice");
    },
  });
};
