import { AppShell } from "../../components/layout/AppShell";
import { ForecastView } from "../../features/forecast/ForecastView";

export default function ForecastPage() {
  return (
    <AppShell>
      <ForecastView />
    </AppShell>
  );
}
