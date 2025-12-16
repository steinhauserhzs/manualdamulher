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
import MeuDiario from "./pages/MeuDiario";
import Comunidade from "./pages/Comunidade";
import ComunidadePost from "./pages/ComunidadePost";
import GrupoDetalhe from "./pages/GrupoDetalhe";
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
import Horoscopo from "./pages/Horoscopo";
import HoroscopoSignos from "./pages/HoroscopoSignos";
import HoroscopoSignoDetalhe from "./pages/HoroscopoSignoDetalhe";
import Numerologia from "./pages/Numerologia";
import Compatibilidade from "./pages/Compatibilidade";
import MapaAstral from "./pages/MapaAstral";
import Telemedicina from "./pages/Telemedicina";
import SalaConsulta from "./pages/SalaConsulta";
import Calendario from "./pages/Calendario";
import ListaCompras from "./pages/ListaCompras";
import Lembretes from "./pages/Lembretes";
import Instalar from "./pages/Instalar";

// Admin imports
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminComunidade from "./pages/admin/AdminComunidade";
import AdminMarketplace from "./pages/admin/AdminMarketplace";
import AdminRecursos from "./pages/admin/AdminRecursos";
import AdminEbook from "./pages/admin/AdminEbook";
import AdminAjuda from "./pages/admin/AdminAjuda";

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

              {/* Admin Routes (Hidden) */}
              <Route element={<AdminProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/usuarios" element={<AdminUsuarios />} />
                  <Route path="/admin/blog" element={<AdminBlog />} />
                  <Route path="/admin/comunidade" element={<AdminComunidade />} />
                  <Route path="/admin/marketplace" element={<AdminMarketplace />} />
                  <Route path="/admin/recursos" element={<AdminRecursos />} />
                  <Route path="/admin/ebook" element={<AdminEbook />} />
                  <Route path="/admin/ajuda" element={<AdminAjuda />} />
                </Route>
              </Route>

              {/* Authenticated Routes */}
              <Route element={<AuthenticatedLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/casa" element={<Casa />} />
                <Route path="/saude" element={<Saude />} />
                <Route path="/telemedicina" element={<Telemedicina />} />
                <Route path="/telemedicina/consulta/:id" element={<SalaConsulta />} />
                <Route path="/bem-estar" element={<BemEstar />} />
                <Route path="/financas" element={<Financas />} />
                <Route path="/meu-diario" element={<MeuDiario />} />
                <Route path="/comunidade" element={<Comunidade />} />
                <Route path="/comunidade/:id" element={<ComunidadePost />} />
                <Route path="/comunidade/grupo/:id" element={<GrupoDetalhe />} />
                <Route path="/perfil/:userId" element={<PerfilPublico />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/marketplace/brecho" element={<MarketplaceBrecho />} />
                <Route path="/marketplace/servicos" element={<MarketplaceServicos />} />
                <Route path="/marketplace/parceiros" element={<MarketplaceParceiros />} />
                <Route path="/marketplace/cupons" element={<MarketplaceCupons />} />
                <Route path="/marketplace/meus-anuncios" element={<MeusAnuncios />} />
                <Route path="/horoscopo" element={<Horoscopo />} />
                <Route path="/horoscopo/signos" element={<HoroscopoSignos />} />
                <Route path="/horoscopo/signos/:signo" element={<HoroscopoSignoDetalhe />} />
                <Route path="/horoscopo/numerologia" element={<Numerologia />} />
                <Route path="/horoscopo/compatibilidade" element={<Compatibilidade />} />
                <Route path="/horoscopo/mapa-astral" element={<MapaAstral />} />
                <Route path="/vida-pratica" element={<VidaPratica />} />
                <Route path="/biblioteca" element={<Biblioteca />} />
                <Route path="/ebook" element={<Ebook />} />
                <Route path="/ebook/:capitulo" element={<EbookReader />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="/ajuda" element={<Ajuda />} />
                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/calendario" element={<Calendario />} />
                <Route path="/lista-compras" element={<ListaCompras />} />
                <Route path="/lembretes" element={<Lembretes />} />
                <Route path="/instalar" element={<Instalar />} />
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
