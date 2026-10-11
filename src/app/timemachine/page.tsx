import { AppShell } from "../../components/layout/AppShell";
import { TimeMachineView } from "../../features/timemachine/TimeMachineView";

export const metadata = {
  title: "Time Machine · Broke But Functional",
  description: "Scrub your 30-day timeline and test counterfactual financial decisions.",
};

export default function TimeMachinePage() {
  return (
    <AppShell>
      <TimeMachineView />
    </AppShell>
  );
}
