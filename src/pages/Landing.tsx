import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Shield, Code2 } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌸</span>
            <span className="text-xl font-semibold">Sakura</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">AI-Powered Solana Development</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Build Any Solana dApp with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
              Plain English
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Meet Sakura, your intelligent blockchain assistant. Describe what you want to build, 
            and watch as she creates production-ready Solana applications.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 py-6 text-lg">
                Start Building Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-border hover:bg-muted/20">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="relative rounded-lg border border-border bg-card p-2 shadow-xl">
            <div className="aspect-video rounded bg-muted/20 flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl mb-4 block">🌸</span>
                <p className="text-muted-foreground">Interactive Demo Coming Soon</p>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-lg blur-xl -z-10" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Everything You Need to Build on Solana
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Sakura handles the complexity so you can focus on your vision.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="Natural Language"
              description="Describe your dApp in plain English. Sakura understands your intent and builds accordingly."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Instant Preview"
              description="See your dApp come to life in real-time. Test with wallet connection built in."
            />
            <FeatureCard
              icon={<Code2 className="w-6 h-6" />}
              title="Production Code"
              description="Get clean, auditable code ready for deployment. No black boxes."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Secure by Default"
              description="Best practices baked in. Sakura follows security standards automatically."
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="Token & NFT Support"
              description="Create tokens, mint NFTs, build marketplaces, and launch collections."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="DeFi Ready"
              description="Staking, swaps, liquidity pools, and DAO governance out of the box."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-border">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Build Your First dApp?
          </h2>
          <p className="text-muted-foreground mb-10">
            Join thousands of developers using Sakura to bring their Solana ideas to life.
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="bg-primary hover:bg-primary/90 px-10 py-6 text-lg">
              Get Started for Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <span className="font-semibold">Sakura</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Sakura. Build Solana dApps with AI.
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) => (
  <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

export default Landing;
