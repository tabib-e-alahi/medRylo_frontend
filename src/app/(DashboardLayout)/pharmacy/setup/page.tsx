"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Store, MapPin, Phone, Globe, Calendar, Users, Clock, ArrowRight, Save, ImageIcon } from "lucide-react";
import { LogoUpload } from "@/features/pharmacies/components/LogoUpload";
import { useCreatePharmacy } from "@/features/pharmacies/hooks";
import styles from "./setup.module.css";

const setupSchema = z.object({
  name: z.string().min(2, "Pharmacy name is required"),
  licenseNumber: z.string().min(5, "Valid license number is required"),
  binVat: z.string().min(1, "BIN/VAT is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(10, "Full address is required"),
  pharmacyType: z.enum(["RETAIL", "WHOLESALE", "HOSPITAL", "CLINIC"]),
  establishedYear: z.string().optional(),
  staffCount: z.string().optional(),
  openingHours: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
});

type SetupFormData = z.infer<typeof setupSchema>;

export default function PharmacySetupPage() {
  const router = useRouter();
  const createPharmacy = useCreatePharmacy();
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      pharmacyType: "RETAIL",
    }
  });

  const onSubmit = async (data: SetupFormData) => {
    if (!logoFile) {
      toast.error("Please upload your pharmacy logo");
      return;
    }

    const formData = new FormData();
    // Append all fields
    Object.entries(data).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    // Append file
    formData.append("logo", logoFile);
    try {
      await createPharmacy.mutateAsync(formData);
      toast.success("Profile created successfully!");
      router.replace("/pharmacy/pending");
    } catch (error: any) {
      toast.error(error.message || "Failed to create profile");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Complete Your Pharmacy Profile</h1>
        <p className={styles.subtitle}>Provide your business details to start the approval process.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Store className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Business Information</h2>
          </div>
          
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Pharmacy Name</label>
              <input 
                {...register("name")}
                placeholder="e.g. MedRylo Central"
                className={styles.input}
              />
              {errors.name && <span className={styles.error}>{errors.name.message}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>License Number</label>
              <input 
                {...register("licenseNumber")}
                placeholder="LIC-12345678"
                className={styles.input}
              />
              {errors.licenseNumber && <span className={styles.error}>{errors.licenseNumber.message}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>BIN/VAT Number</label>
              <input 
                {...register("binVat")}
                placeholder="123456789-0101"
                className={styles.input}
              />
              {errors.binVat && <span className={styles.error}>{errors.binVat.message}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Pharmacy Type</label>
              <select {...register("pharmacyType")} className={styles.input}>
                <option value="RETAIL">Retail</option>
                <option value="WHOLESALE">Wholesale</option>
                <option value="HOSPITAL">Hospital</option>
                <option value="CLINIC">Clinic</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Phone className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Contact & Location</h2>
          </div>
          
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Contact Phone</label>
              <input 
                {...register("phone")}
                placeholder="+880..."
                className={styles.input}
              />
              {errors.phone && <span className={styles.error}>{errors.phone.message}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Website (Optional)</label>
              <input 
                {...register("website")}
                placeholder="https://www.medrylo.com"
                className={styles.input}
              />
              {errors.website && <span className={styles.error}>{errors.website.message}</span>}
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.fieldLabel}>Full Address</label>
              <textarea 
                {...register("address")}
                placeholder="123 Street, Area, City"
                rows={3}
                className={styles.textarea}
              />
              {errors.address && <span className={styles.error}>{errors.address.message}</span>}
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Clock className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Operational Details</h2>
          </div>
          
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Established Year</label>
              <div className={styles.inputWithIcon}>
                <Calendar size={16} className={styles.innerIcon} />
                <input 
                  type="number"
                  {...register("establishedYear")}
                  placeholder="2020"
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Staff Count</label>
              <div className={styles.inputWithIcon}>
                <Users size={16} className={styles.innerIcon} />
                <input 
                  type="number"
                  {...register("staffCount")}
                  placeholder="5"
                  className={styles.input}
                />
              </div>
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.fieldLabel}>Opening Hours</label>
              <input 
                {...register("openingHours")}
                placeholder="9:00 AM - 10:00 PM (Daily)"
                className={styles.input}
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <ImageIcon className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Branding</h2>
          </div>
          <LogoUpload onFileSelect={setLogoFile} />
        </div>

        <div className={styles.footer}>
          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className={styles.spinner} />
            ) : (
              <>
                <Save size={18} />
                Submit for Approval
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
