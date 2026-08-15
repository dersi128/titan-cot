import { TitanAuthGate } from "./auth/TitanAuthGate";
import { TitanCotDashboard } from "./components/titan/TitanCotDashboard";
import { TitanAppErrorBoundary } from "./components/titan/TitanAppErrorBoundary";
import { TitanI18nProvider } from "./i18n";

export default function App() {
  return (
    <TitanAppErrorBoundary>
      <TitanI18nProvider>
        <TitanAuthGate>
          <TitanCotDashboard />
        </TitanAuthGate>
      </TitanI18nProvider>
    </TitanAppErrorBoundary>
  );
}
