import { useEffect, useState } from 'react';
import { listProjects } from './index';
import type { Project } from '../../types';

export function useProjects(orgId: string | undefined) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orgId) {
      setProjects([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    listProjects(orgId)
      .then((result) => {
        if (!cancelled) {
          setProjects(result.items);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load projects'));
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [orgId]);

  return { projects, isLoading, error };
}
