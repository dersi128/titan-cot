import { LanguageSwitcher } from "../../../i18n";
import { TitanDisplaySettings } from "./TitanDisplaySettings";

export function TitanHeaderTools() {
  return (
    <div className="titan-header-tools">
      <LanguageSwitcher />
      <TitanDisplaySettings />
    </div>
  );
}
