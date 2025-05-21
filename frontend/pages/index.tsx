import Link from "next/link";
import styles from "../styles/landing.module.scss";
import { GetServerSideProps } from "next";

type LandingProps = {
  serverTime: string;
};

const IndexPage = ({ serverTime }: LandingProps) => (
  <div className={styles["landing-container"]}>
    <div className={styles["landing-card"]}>
      <div className={styles["landing-icon"]}>
        {/* Simple SVG marketplace icon */}
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="20" fill="#fff0"/><path d="M10 16h20l-2 14H12l-2-14zm4-4a6 6 0 1 1 12 0" stroke="#2563eb" strokeWidth="2" fill="#fbbf24"/></svg>
      </div>
      <h1 className={styles["landing-title"]}>Welcome to Markets</h1>
      <div className={styles["landing-buttons"]}>
        <Link href="/shop" legacyBehavior>
          <button className={styles["landing-btn"]} style={{ background: '#22c55e', color: '#fff', fontWeight: 800, fontSize: '1.15rem' }}>🛒 Go to Shop</button>
        </Link>
      </div>
      <p className={styles["landing-desc"]}>Your one-stop platform to buy and sell products. Please choose your role to continue.</p>
      <div className={styles["landing-buttons"]}>
        <Link href="/login/buyer" legacyBehavior>
          <button className={styles["landing-btn"]}>Login as Buyer</button>
        </Link>
        <Link href="/auth/vendor" legacyBehavior>
          <button className={styles["landing-btn"]}>Login as Seller</button>
        </Link>
      </div>
      <div className={styles["landing-buttons"]}>
        <Link href="/auth/buyer/register" legacyBehavior>
          <button className={styles["landing-btn"]} style={{ background: '#fbbf24', color: '#111827' }}>Register as Buyer</button>
        </Link>
        <Link href="/auth/vendor/register" legacyBehavior>
          <button className={styles["landing-btn"]} style={{ background: '#fbbf24', color: '#111827' }}>Register as Seller</button>
        </Link>
      </div>
      <div className={styles["landing-footer"]}>
        <span>Server time: {serverTime}</span>
      </div>
    </div>
  </div>
);

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      serverTime: new Date().toLocaleString(),
    },
  };
};

export default IndexPage;
