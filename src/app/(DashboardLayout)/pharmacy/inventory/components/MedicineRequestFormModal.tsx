"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitMedicineRequest } from "@/features/medicine-requests/hooks";

const schema = z.object({
  requestedName: z.string().min(1, "Medicine name is required"),
  genericName: z.string().optional(),
  categorySuggestion: z.string().optional(),
  typeSuggestion: z.string().optional(),
  unitSuggestion: z.string().optional(),
  strength: z.string().optional(),
  companyName: z.string().optional(),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
};

export function MedicineRequestFormModal({ open, onClose }: Props) {
  const submitRequest = useSubmitMedicineRequest();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      requestedName: "",
      genericName: "",
      categorySuggestion: "",
      typeSuggestion: "",
      unitSuggestion: "",
      strength: "",
      companyName: "",
      note: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    await submitRequest.mutateAsync(values);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--color-text)/50 p-4 backdrop-blur-sm">
  <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface) text-(--color-text) shadow-xl">
    <div className="flex items-center justify-between border-b border-(--color-border) bg-(--color-bg-secondary) px-6 py-4">
      <div>
        <h2 className="text-lg font-semibold text-(--color-text)">
          Request Missing Medicine
        </h2>
        <p className="text-sm text-(--color-text-muted)">
          Admins review requests before adding global medicines.
        </p>
      </div>
      <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
        <X className="size-4" />
      </Button>
    </div>

    <form onSubmit={handleSubmit(onSubmit)} className="p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="requestedName">Medicine Name</Label>
          <Input id="requestedName" {...register("requestedName")} className="mt-2" />
          {errors.requestedName && (
            <p className="mt-1 text-xs text-(--color-danger)">
              {errors.requestedName.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="genericName">Generic Name</Label>
          <Input id="genericName" {...register("genericName")} className="mt-2" />
        </div>

        <div>
          <Label htmlFor="strength">Strength</Label>
          <Input id="strength" {...register("strength")} className="mt-2" placeholder="e.g. 500mg" />
        </div>

        <div>
          <Label htmlFor="companyName">Company Name</Label>
          <Input id="companyName" {...register("companyName")} className="mt-2" />
        </div>

        <div>
          <Label htmlFor="categorySuggestion">Category Suggestion</Label>
          <Input id="categorySuggestion" {...register("categorySuggestion")} className="mt-2" />
        </div>

        <div>
          <Label htmlFor="typeSuggestion">Type Suggestion</Label>
          <Input id="typeSuggestion" {...register("typeSuggestion")} className="mt-2" />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="unitSuggestion">Unit Suggestion</Label>
          <Input
            id="unitSuggestion"
            {...register("unitSuggestion")}
            className="mt-2"
            placeholder="e.g. tablet, bottle, strip"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="note">Note</Label>
          <Textarea
            id="note"
            {...register("note")}
            className="mt-2"
            placeholder="Add any package, supplier, or availability details."
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3 border-t border-(--color-border) pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || submitRequest.isPending}>
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </Button>
      </div>
    </form>
  </div>
</div>
  );
}
