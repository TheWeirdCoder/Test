import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Commands from "@/pages/Commands";
import ApiCommands from "@/pages/ApiCommands";
import ApiDocs from "@/pages/ApiDocs";
import Settings from "@/pages/Settings";
import Integrations from "@/pages/Integrations";
import Analytics from "@/pages/Analytics";
import Logs from "@/pages/Logs";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={Home} />
      <ProtectedRoute path="/commands" component={Commands} />
      <ProtectedRoute path="/api-commands" component={ApiCommands} />
      <ProtectedRoute path="/api-docs" component={ApiDocs} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/integrations" component={Integrations} />
      <ProtectedRoute path="/analytics" component={Analytics} />
      <ProtectedRoute path="/logs" component={Logs} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
