import { TitanCotDashboard } from "./components/titan/TitanCotDashboard";
import { TitanI18nProvider } from "./i18n";

export default function App() {
  return (
    <TitanI18nProvider>
      <TitanCotDashboard />
    </TitanI18nProvider>
  );
}
