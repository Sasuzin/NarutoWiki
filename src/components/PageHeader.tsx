import { SymbolLayer } from "./ImageLayer";
import styles from "./PageHeader.module.css";
import ui from "./ui.module.css";

export function PageHeader({
  title,
  subtitle,
  back,
  symbol,
  initials,
}: {
  title: string;
  subtitle?: string;
  /** Link de volta para a coleccao: `{ href, label }`. */
  back?: { href: string; label: string };
  /** URL do simbolo da vila; sem ela o tile nao aparece. */
  symbol?: string;
  initials?: string;
}) {
  return (
    <>
      {back && (
        <a href={back.href} className={`${ui.backLink} ${styles.back}`}>
          ← {back.label}
        </a>
      )}
      <div className={styles.row}>
        {symbol !== undefined && (
          <span className={styles.tile}>
            <span className={styles.tileInitials} aria-hidden>
              {initials}
            </span>
            <SymbolLayer url={symbol} inset={8} />
          </span>
        )}
        <div className={styles.text}>
          <h1 className={ui.pageTitle}>{title}</h1>
          {subtitle && <p className={ui.pageSub}>{subtitle}</p>}
        </div>
      </div>
    </>
  );
}
