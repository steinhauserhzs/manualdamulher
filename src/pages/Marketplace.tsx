import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Briefcase, Store, Ticket, Search, Heart, ArrowRight, MessageSquare, Repeat } from "lucide-react";
import { ChatMarketplace } from "@/components/marketplace/ChatMarketplace";
import { TrocasCard } from "@/components/marketplace/TrocasCard";
import { VerificacaoVendedora } from "@/components/marketplace/VerificacaoVendedora";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    anuncios: 0,
    servicos: 0,
    parceiros: 0,
    cupons: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [anunciosRes, servicosRes, parceirosRes, cuponsRes] = await Promise.all([
          supabase.from("marketplace_anuncios").select("id", { count: "exact", head: true }).eq("status", "ativo"),
          supabase.from("marketplace_servicos").select("id", { count: "exact", head: true }).eq("status", "ativo"),
          supabase.from("marketplace_parceiros").select("id", { count: "exact", head: true }).eq("status", "ativo"),
          supabase.from("marketplace_cupons").select("id", { count: "exact", head: true }).eq("status", "ativo")
        ]);

        setStats({
          anuncios: anunciosRes.count || 0,
          servicos: servicosRes.count || 0,
          parceiros: parceirosRes.count || 0,
          cupons: cuponsRes.count || 0
        });
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const sections = [
    {
      title: "Brechó",
      description: "Compre e venda roupas, acessórios e itens seminovos",
      icon: ShoppingBag,
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600",
      link: "/marketplace/brecho",
      count: stats.anuncios,
      label: "anúncios"
    },
    {
      title: "Serviços",
      description: "Encontre profissionais ou ofereça seus serviços",
      icon: Briefcase,
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      link: "/marketplace/servicos",
      count: stats.servicos,
      label: "serviços"
    },
    {
      title: "Parceiros",
      description: "Estabelecimentos e negócios da comunidade",
      icon: Store,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      link: "/marketplace/parceiros",
      count: stats.parceiros,
      label: "parceiros"
    },
    {
      title: "Cupons",
      description: "Descontos exclusivos para a comunidade",
      icon: Ticket,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      link: "/marketplace/cupons",
      count: stats.cupons,
      label: "cupons"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 pb-24 md:pb-8">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <ShoppingBag className="h-7 w-7 text-primary" />
            Marketplace
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Compre, venda e conecte-se com a comunidade. Brechó, serviços, parceiros e cupons exclusivos!
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar no marketplace..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/marketplace/meus-anuncios">
              <Heart className="h-4 w-4 mr-1" />
              Meus Anúncios
            </Link>
          </Button>
          <ChatMarketplace />
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.map((section) => (
            <Link key={section.title} to={section.link}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                <div className={`h-2 bg-gradient-to-r ${section.color}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${section.bgColor}`}>
                      <section.icon className={`h-6 w-6 ${section.iconColor}`} />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {section.count} {section.label}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-3 group-hover:text-primary transition-colors">
                    {section.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-primary font-medium">
                    Ver todos
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Info Banner */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Dica:</strong> Você pode criar seus próprios anúncios, oferecer serviços ou cadastrar seu negócio como parceiro!
            </p>
          </CardContent>
        </Card>

        {/* Sistema de Trocas e Verificação */}
        <div className="grid gap-4 md:grid-cols-2">
          <TrocasCard />
          <VerificacaoVendedora />
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
