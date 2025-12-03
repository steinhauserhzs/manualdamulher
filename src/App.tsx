import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TutorialProvider } from "./contexts/TutorialContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import AuthenticatedLayout from "./components/layout/AuthenticatedLayout";
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
import Comunidade from "./pages/Comunidade";
import ComunidadePost from "./pages/ComunidadePost";
import PerfilPublico from "./pages/PerfilPublico";
import Biblioteca from "./pages/Biblioteca";
import VidaPratica from "./pages/VidaPratica";
import Ajuda from "./pages/Ajuda";
import Configuracoes from "./pages/Configuracoes";
import Ebook from "./pages/Ebook";
import EbookReader from "./pages/EbookReader";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Marketplace from "./pages/Marketplace";
import MarketplaceBrecho from "./pages/MarketplaceBrecho";
import MarketplaceServicos from "./pages/MarketplaceServicos";
import MarketplaceParceiros from "./pages/MarketplaceParceiros";
import MarketplaceCupons from "./pages/MarketplaceCupons";
import MeusAnuncios from "./pages/MeusAnuncios";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TutorialProvider>
        <OnboardingProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Authenticated Routes */}
              <Route element={<AuthenticatedLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/casa" element={<Casa />} />
                <Route path="/saude" element={<Saude />} />
                <Route path="/bem-estar" element={<BemEstar />} />
                <Route path="/financas" element={<Financas />} />
                <Route path="/notas" element={<Notas />} />
                <Route path="/comunidade" element={<Comunidade />} />
                <Route path="/comunidade/:id" element={<ComunidadePost />} />
                <Route path="/perfil/:userId" element={<PerfilPublico />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/marketplace/brecho" element={<MarketplaceBrecho />} />
                <Route path="/marketplace/servicos" element={<MarketplaceServicos />} />
                <Route path="/marketplace/parceiros" element={<MarketplaceParceiros />} />
                <Route path="/marketplace/cupons" element={<MarketplaceCupons />} />
                <Route path="/marketplace/meus-anuncios" element={<MeusAnuncios />} />
                <Route path="/vida-pratica" element={<VidaPratica />} />
                <Route path="/biblioteca" element={<Biblioteca />} />
                <Route path="/ebook" element={<Ebook />} />
                <Route path="/ebook/:capitulo" element={<EbookReader />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="/ajuda" element={<Ajuda />} />
                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </OnboardingProvider>
      </TutorialProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
