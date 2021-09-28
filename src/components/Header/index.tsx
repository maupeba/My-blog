import styles from './header.module.scss';

export default function Header() {
  // TODO
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <img src="/logo.svg" alt="logo" />
      </div>
    </header>
  );
}
