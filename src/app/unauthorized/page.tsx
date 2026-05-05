import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        padding: "2rem",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "400px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "var(--radius-xl)",
            background: "var(--color-danger-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            color: "var(--color-danger)",
          }}
        >
          <ShieldX size={32} />
        </div>

        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--color-text)",
            marginBottom: "0.5rem",
          }}
        >
          Access Denied
        </h1>

        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: "0.9rem",
            lineHeight: 1.6,
            marginBottom: "2rem",
          }}
        >
          You don&apos;t have permission to access this page.
          Please contact your administrator if you believe this is an error.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <Link
            href="/"
            style={{
              padding: "8px 20px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-bg-secondary)",
              color: "var(--color-text)",
              fontSize: "0.875rem",
              fontWeight: 500,
              textDecoration: "none",
              border: "1px solid var(--color-border)",
            }}
          >
            Go home
          </Link>
          <Link
            href="/login"
            style={{
              padding: "8px 20px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-primary)",
              color: "#fff",
              fontSize: "0.875rem",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
