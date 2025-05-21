import { useState } from "react";
import styles from "../../../styles/vendor-auth.module.scss";
import Head from "next/head";
import Link from "next/link";

export default function VendorRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: businessName, role: "vendor" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setSuccess("Registration successful! You can now log in.");
      // Optionally redirect to login
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Vendor Registration | Markets</title>
      </Head>
      <div className={styles["auth-container"]}>
        <form className={styles["auth-form"]} onSubmit={handleSubmit}>
          <h2 className={styles["auth-title"]}>Vendor Registration</h2>
          <input
            type="text"
            placeholder="Business Name"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            required
            className={styles["auth-input"]}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className={styles["auth-input"]}
          />
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className={styles["auth-input"]}
              style={{ paddingRight: '2.5rem' }}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v: boolean) => !v)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                color: '#64748b',
                fontSize: '1.15rem',
              }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          <button type="submit" className={styles["auth-btn"]} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
          {error && <div className={styles["auth-error"]}>{error}</div>}
          {success && <div className={styles["auth-success"]}>{success}</div>}
          <div className={styles["auth-footer"]}>
            <span>Already have an account? </span>
            <Link href="/auth/vendor">Login</Link>
          </div>
          <div style={{ width: '100%', marginTop: '1.2rem' }}>
            <Link href="/" legacyBehavior>
              <button type="button" className={styles["auth-btn"]} style={{ background: '#e5e7eb', color: '#111827' }}>
                Back to Home
              </button>
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
