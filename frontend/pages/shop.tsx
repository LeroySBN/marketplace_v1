import { useState, useEffect } from "react";
import styles from "../styles/shop.module.scss";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setFiltered(data.products || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load products.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setFiltered(
      products.filter((p: any) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, products]);

  return (
    <div className={styles.shopContainer}>
      <h1 className={styles.shopTitle}>Shop</h1>
      <input
        type="text"
        placeholder="Search products..."
        className={styles.shopSearch}
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {loading ? (
        <div className={styles.loading}>Loading products...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <div className={styles.productGrid}>
          {filtered.map((p: any) => (
            <div key={p.id} className={styles.productCard}>
              <div className={styles.productImg}>
                {/* Replace with real image */}
                <img src={p.image || "/placeholder.png"} alt={p.name} />
              </div>
              <div className={styles.productName}>{p.name}</div>
              <div className={styles.productPrice}>${p.price}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
