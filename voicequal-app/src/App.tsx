import { Route, Switch } from "wouter";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/DashboardLayout";
import Leads from "./pages/Leads";
import Calls from "./pages/Calls";
import Analytics from "./pages/Analytics";
import Pipeline from "./pages/Pipeline";
import SettingsPage from "./pages/SettingsPage";

function WithLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

export default function App() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/leads">
        <WithLayout><Leads /></WithLayout>
      </Route>
      <Route path="/calls">
        <WithLayout><Calls /></WithLayout>
      </Route>
      <Route path="/analytics">
        <WithLayout><Analytics /></WithLayout>
      </Route>
      <Route path="/pipeline">
        <WithLayout><Pipeline /></WithLayout>
      </Route>
      <Route path="/settings">
        <WithLayout><SettingsPage /></WithLayout>
      </Route>
      <Route>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl font-black text-zinc-200 mb-4">404</div>
            <a href="/" className="text-emerald-600 font-bold hover:underline">Go home</a>
          </div>
        </div>
      </Route>
    </Switch>
  );
}
