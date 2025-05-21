import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/vendor-dashboard.module.scss";

export default function VendorDashboard() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Simple auth check for demo; replace with real auth logic
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("vendor_token") : null;
    if (!token) {
      router.replace("/auth/vendor");
    }
  }, [router]);

  useEffect(() => {
    // Fetch vendor products & sales (replace with real endpoints)
    const token = localStorage.getItem("vendor_token");
    if (!token) return;
    setLoading(true);
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/products`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/sales`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
    ])
      .then(([prod, sal]) => {
        setProducts(prod.products || []);
        setSales(sal.sales || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load dashboard data.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className={styles.loading}>Loading dashboard...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.dashboardTitle}>Vendor Dashboard</h1>
      <section className={styles.section}>
        <h2>Products</h2>
        <button className={styles.addBtn}>+ Add Product</button>
        <ul className={styles.productList}>
          {products.map((p: any) => (
            <li key={p.id} className={styles.productItem}>
              <span>{p.name}</span> <span>${p.price}</span>
              {/* Edit/Delete actions can go here */}
            </li>
          ))}
        </ul>
      </section>
      <section className={styles.section}>
        <h2>Sales</h2>
        <ul className={styles.salesList}>
          {sales.map((s: any) => (
            <li key={s.id} className={styles.salesItem}>
              <span>Order #{s.id}</span> <span>${s.total}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
