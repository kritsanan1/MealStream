import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import CustomerDashboard from "@/pages/customer-dashboard";
import VendorDashboard from "@/pages/vendor-dashboard";
import DriverDashboard from "@/pages/driver-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import RestaurantDetail from "@/pages/restaurant-detail";
import OrderTracking from "@/pages/order-tracking";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-2">🍜 FoodFlow</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/customer" component={CustomerDashboard} />
          <Route path="/vendor" component={VendorDashboard} />
          <Route path="/driver" component={DriverDashboard} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/restaurant/:id" component={RestaurantDetail} />
          <Route path="/order/:id" component={OrderTracking} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
