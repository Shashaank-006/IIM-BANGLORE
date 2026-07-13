import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <span className={styles.version}>GovWatch MIS · v2.4.1</span>
        <span className={styles.sep}>·</span>
        <span className={styles.updated}>Last updated: 10 Jul 2026, 17:25 IST</span>
      </div>
      <div className={styles.right}>
        <span className={styles.disclaimer}>
          ⚠ Prototype — Contains simulated data for demonstration purposes only
        </span>
      </div>
    </footer>
  );
}
