import { TitanAuthGate } from "./auth/TitanAuthGate";
import { TitanCotDashboard } from "./components/titan/TitanCotDashboard";
import { TitanAppErrorBoundary } from "./components/titan/TitanAppErrorBoundary";
import { TitanI18nProvider } from "./i18n";
import { TitanTypeScaleProvider } from "./components/titan/TitanTypeScaleProvider";

export default function App() {
  return (
    <TitanAppErrorBoundary>
      <TitanI18nProvider>
        <TitanTypeScaleProvider>
          <TitanAuthGate>
            <TitanCotDashboard />
          </TitanAuthGate>
        </TitanTypeScaleProvider>
      </TitanI18nProvider>
    </TitanAppErrorBoundary>
  );
}
