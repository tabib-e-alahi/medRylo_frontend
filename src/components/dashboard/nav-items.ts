import {
  LayoutDashboard,
  Pill,
  Tag,
  Building2,
  Truck,
  ShoppingCart,
  FileText,
  Users,
  BarChart3,
  Settings,
  Package,
  ClipboardList,
  User,
  Store,
  Bookmark,
  Layers,
  Scale,
  BoxSelect,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const adminNav: NavGroup[] = [
  {
    items: [
      { label: "Overview",   href: "/admin/dashboard",   icon: LayoutDashboard },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { label: "Medicines",      href: "/admin/medicines",      icon: Pill },
      { label: "Medicine Requests", href: "/admin/medicine-requests", icon: ClipboardList },
      { label: "Categories",     href: "/admin/categories",     icon: Tag },
      { label: "Medicine Types", href: "/admin/medicine-types", icon: Layers },
      { label: "Units",          href: "/admin/units",          icon: Scale },
      { label: "Leaf Settings",  href: "/admin/leaf-settings",  icon: BoxSelect },
    ],
  },
  {
    label: "Network",
    items: [
      { label: "Pharmacies", href: "/admin/pharmacies",  icon: Building2 },
      { label: "Suppliers",  href: "/admin/suppliers",   icon: Truck },
      { label: "Customers",  href: "/admin/customers",   icon: Users },
    ],
  },
  {
    label: "Transactions",
    items: [
      { label: "Purchases",  href: "/admin/purchases",   icon: ShoppingCart },
      { label: "Invoices",   href: "/admin/invoices",    icon: FileText },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Reports",    href: "/admin/reports",     icon: BarChart3 },
      { label: "Settings",   href: "/admin/settings",    icon: Settings },
    ],
  },
];

export const pharmacyNav: NavGroup[] = [
  {
    items: [
      { label: "Overview",         href: "/pharmacy/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Pharmacy Profile", href: "/pharmacy/profile",   icon: Store },
      { label: "Inventory",        href: "/pharmacy/inventory", icon: Package },
      { label: "Customers",        href: "/pharmacy/customers", icon: Users },
      { label: "Staff",            href: "/pharmacy/staff",     icon: Users },
    ],
  },
  {
    label: "Transactions",
    items: [
      { label: "Invoices",         href: "/pharmacy/invoices",  icon: FileText },
      { label: "Purchases",        href: "/pharmacy/purchases", icon: ShoppingCart },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Reports",          href: "/pharmacy/reports",   icon: BarChart3 },
      { label: "Settings",         href: "/pharmacy/settings",  icon: Settings },
    ],
  },
];

export const staffNav: NavGroup[] = [
  {
    items: [
      { label: "Overview",   href: "/staff/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Daily Work",
    items: [
      { label: "Inventory",  href: "/staff/inventory", icon: Package },
      { label: "Invoices",   href: "/staff/invoices",  icon: FileText },
      { label: "Customers",  href: "/staff/customers", icon: Users },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profile",    href: "/staff/profile",   icon: User },
    ],
  },
];

export const userNav: NavGroup[] = [
  {
    items: [
      { label: "Overview",          href: "/user/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Medicines",
    items: [
      { label: "Browse Medicines",  href: "/user/medicines", icon: Pill },
      { label: "Saved Medicines",   href: "/user/saved",     icon: Bookmark },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profile",           href: "/user/profile",   icon: User },
    ],
  },
];

export type UserRole = "ADMIN" | "PHARMACY" | "STAFF" | "USER";

export function getNavForRole(role: UserRole | undefined): NavGroup[] {
  switch (role) {
    case "ADMIN":    return adminNav;
    case "PHARMACY": return pharmacyNav;
    case "STAFF":    return staffNav;
    default:         return userNav;
  }
}

export function getRoleLabel(role: UserRole | undefined): string {
  switch (role) {
    case "ADMIN":    return "Administrator";
    case "PHARMACY": return "Pharmacy Owner";
    case "STAFF":    return "Staff Member";
    default:         return "User";
  }
}
