import styles from "./App.module.css";
import { Drawer } from "./components/Drawer";
import { ErrorState } from "./components/ErrorState";
import { LoadingState } from "./components/LoadingState";
import { Topbar } from "./components/Topbar";
import { Router } from "./pages/Router";
import { useApp } from "./store/AppProvider";

export function App() {
  const { loading, error, slow, reload } = useApp();

  return (
    <div className={styles.shell}>
      <Drawer />
      <div className={styles.column}>
        <Topbar />
        <main className={styles.main}>
          {loading ? (
            <LoadingState slow={slow} />
          ) : error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : (
            <Router />
          )}
        </main>
      </div>
    </div>
  );
}
