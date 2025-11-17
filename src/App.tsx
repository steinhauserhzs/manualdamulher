import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TutorialProvider } from "./contexts/TutorialContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import { Sidebar } from "./components/layout/Sidebar";
import { BottomNav } from "./components/layout/BottomNav";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Casa from "./pages/Casa";
import Saude from "./pages/Saude";
import BemEstar from "./pages/BemEstar";
import Financas from "./pages/Financas";
import BlogList from "./pages/BlogList";
import BlogPost from "./pages/BlogPost";
import Notas from "./pages/Notas";
import Biblioteca from "./pages/Biblioteca";
import VidaPratica from "./pages/VidaPratica";
import Ajuda from "./pages/Ajuda";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TutorialProvider>
        <OnboardingProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex">
              <Sidebar />
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/casa" element={<Casa />} />
                  <Route path="/saude" element={<Saude />} />
                  <Route path="/bem-estar" element={<BemEstar />} />
                  <Route path="/financas" element={<Financas />} />
                  <Route path="/notas" element={<Notas />} />
                  <Route path="/blog" element={<BlogList />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/biblioteca" element={<Biblioteca />} />
                  <Route path="/vida-pratica" element={<VidaPratica />} />
                  <Route path="/ajuda" element={<Ajuda />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <BottomNav />
            </div>
          </BrowserRouter>
        </OnboardingProvider>
      </TutorialProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
