import { useEffect, useState } from 'react';
import { listComponents } from './index';
import type { Component } from '../../types';

export function useComponents(orgId: string | undefined, projectId: string | undefined) {
  const [components, setComponents] = useState<Component[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orgId || !projectId) {
      setComponents([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    listComponents(orgId, { projectName: projectId })
      .then((result) => {
        if (!cancelled) {
          setComponents(result.items);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load components'));
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [orgId, projectId]);

  return { components, isLoading, error };
}
