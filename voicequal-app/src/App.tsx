import { Route, Switch } from "wouter";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/dashboard" component={Dashboard} />
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
