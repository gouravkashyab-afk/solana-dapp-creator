import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, ExternalLink, Trash2, Edit2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Project } from '@/hooks/useProjects';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
  onEdit: (project: Project) => void;
}

const ProjectCard = ({ project, onDelete, onEdit }: ProjectCardProps) => {
  const getStatusBadge = () => {
    // For now, all projects are drafts - can be extended later
    return (
      <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
        Draft
      </Badge>
    );
  };

  return (
    <Card className="group hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex-1 min-w-0">
          <Link to={`/project/${project.id}`} className="hover:text-primary transition-colors">
            <h3 className="font-semibold text-lg truncate">{project.name}</h3>
          </Link>
          {getStatusBadge()}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(project)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(project.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {project.description || 'No description'}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Updated {new Date(project.updated_at).toLocaleDateString()}
          </span>
          <Link to={`/project/${project.id}`}>
            <Button size="sm" variant="ghost" className="h-8 gap-1">
              Open
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
