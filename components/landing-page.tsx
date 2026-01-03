import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ShoppingBag, Newspaper, Calendar, Users, ArrowRight } from "lucide-react";

export function LandingPage() {
  const features = [
    {
      title: "Discover Hidden Gems",
      description: "Explore historical landmarks like the Portuguese Church and Dadar Station with rich descriptions.",
      icon: MapPin,
    },
    {
      title: "Shop & Dine",
      description: "Browse top-rated local shops and hotels. Find the best places to eat and shop in Dadar.",
      icon: ShoppingBag,
    },
    {
      title: "Stay Updated",
      description: "Read the latest local news and blogs relevant to the community. Stay in the loop.",
      icon: Newspaper,
    },
    {
      title: "Plan Events",
      description: "Easily organize sports, weddings, or corporate events by connecting with local planners.",
      icon: Calendar,
    },
    {
      title: "Community Engagement",
      description: "Participate in local activities like the Dadar Walkathon and connect with the community.",
      icon: Users,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center space-y-10 px-4 py-24 text-center md:py-32 bg-gradient-to-b from-background to-muted/50">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-primary">
            Dadar Explorer
          </h1>
          <p className="text-xl text-muted-foreground mx-auto max-w-[600px]">
            Your ultimate digital companion for exploring the vibrant heart of Mumbai—Dadar.
            Designed for both locals and tourists.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="lg" className="gap-2">
              Explore Admin Panel <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="flex flex-col border-none shadow-md hover:shadow-lg transition-shadow bg-card/50">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Dadar Explorer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
