import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import SakuraIcon from '@/components/SakuraIcon';
import ProjectCard from '@/components/ProjectCard';
import NewProjectDialog from '@/components/NewProjectDialog';
import { Plus, Loader2, LogOut, Settings, Sparkles } from 'lucide-react';
import type { Project } from '@/hooks/useProjects';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { projects, isLoading: projectsLoading, createProject, deleteProject } = useProjects();
  const { toast } = useToast();

  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
      });
    } else {
      navigate('/');
    }
  };

  const handleCreateProject = async (name: string, description: string) => {
    setIsCreating(true);
    try {
      const project = await createProject.mutateAsync({ name, description });
      setNewProjectOpen(false);
      toast({
        title: 'Project created!',
        description: 'Start chatting with Sakura to build your dApp.',
      });
      navigate(`/project/${project.id}`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create project. Please try again.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject.mutateAsync(id);
      toast({
        title: 'Project deleted',
        description: 'The project has been removed.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete project. Please try again.',
      });
    }
  };

  const handleEditProject = (project: Project) => {
    // TODO: Implement edit dialog
    navigate(`/project/${project.id}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <SakuraIcon size="md" />
            <span className="text-xl font-semibold">Sakura</span>
          </Link>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Projects</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your Solana dApps
            </p>
          </div>
          <Button onClick={() => setNewProjectOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Loading State */}
        {projectsLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Projects Grid */}
        {!projectsLoading && projects.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
                onEdit={handleEditProject}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!projectsLoading && projects.length === 0 && (
          <div className="border border-dashed border-border rounded-lg p-16 text-center">
            <SakuraIcon size="lg" className="mb-4 mx-auto block" />
            <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first project and start building Solana dApps with Sakura's help.
            </p>
            <Button onClick={() => setNewProjectOpen(true)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Create Your First Project
            </Button>
          </div>
        )}

        {/* Templates Section (future) */}
        {!projectsLoading && projects.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-semibold mb-4">Quick Start Templates</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <TemplateCard
                title="Token Swap"
                description="DEX interface with Jupiter"
                icon="💱"
              />
              <TemplateCard
                title="NFT Minting"
                description="Mint NFTs with Metaplex"
                icon="🖼️"
              />
              <TemplateCard
                title="Staking Pool"
                description="Token staking rewards"
                icon="🔒"
              />
              <TemplateCard
                title="DAO Voting"
                description="Governance interface"
                icon="🗳️"
              />
            </div>
          </div>
        )}
      </main>

      <NewProjectDialog
        open={newProjectOpen}
        onOpenChange={setNewProjectOpen}
        onSubmit={handleCreateProject}
        isLoading={isCreating}
      />
    </div>
  );
};

const TemplateCard = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) => (
  <button className="p-4 rounded-lg border border-border bg-card/50 text-left hover:border-primary/50 hover:bg-primary/5 transition-all group">
    <span className="text-2xl mb-2 block">{icon}</span>
    <h3 className="font-medium group-hover:text-primary transition-colors">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </button>
);

export default Dashboard;
