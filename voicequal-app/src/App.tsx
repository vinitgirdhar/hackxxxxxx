import { Route, Switch } from "wouter";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LeadDetail from "./pages/LeadDetail";
import Calls from "./pages/Calls";
import Analytics from "./pages/Analytics";
import Pipeline from "./pages/Pipeline";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/leads" component={Leads} />
      <Route path="/leads/:id" component={LeadDetail} />
      <Route path="/calls" component={Calls} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/pipeline" component={Pipeline} />
      <Route path="/settings" component={SettingsPage} />
      <Route>
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#f6faf9" }}>
          <div className="text-center">
            <div className="text-6xl font-black mb-4" style={{ color: "#D4AF37", fontFamily: "'Outfit', sans-serif" }}>404</div>
            <div className="text-lg font-bold mb-4" style={{ color: "#71717a" }}>Page not found</div>
            <a href="/" className="text-emerald-600 font-black hover:underline uppercase tracking-widest text-sm">← Go home</a>
          </div>
        </div>
      </Route>
    </Switch>
  );
}
