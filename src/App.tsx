import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AddItemPage from "./features/pantry/AddItemPage";
import ConfirmItemPage from "./features/pantry/ConfirmItemPage";
import RecipesPage from "./pages/RecipesPage";
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<><Index /><BottomNav /></>} />
            <Route path="/recipes" element={<><RecipesPage /><BottomNav /></>} />
            <Route path="/auth" element={<Auth />} />
            {/* New Routes for Scanning Feature */}
            <Route path="/add" element={<AddItemPage />} />
            <Route path="/add/confirm" element={<ConfirmItemPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
