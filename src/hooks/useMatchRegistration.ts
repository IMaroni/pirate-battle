import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MatchResult } from '../types/game';
import { registerMatch } from '../api/matchApi';
import { getPendingMatches, queueMatch, removePendingMatch } from '../storage/pendingMatches';

export type RegistrationStatus = 'idle' | 'pending' | 'saved' | 'error';

export function useMatchRegistration() {
  const queryClient = useQueryClient();
  // Cada partida possui sua própria situação de envio.
  const [statuses, setStatuses] = useState<
    Record<string, RegistrationStatus>
  >({});

  const { mutate } = useMutation({
    mutationFn: registerMatch,
    onMutate: (result) => {
      setStatuses((previous) => ({
        ...previous,
        [result.id]: 'pending',
      }));
    },

    onSuccess: (result) => {
      let status: RegistrationStatus = 'saved';

      try {
        removePendingMatch(result.id);
      } catch {
        // O servidor confirmou, mas a limpeza local precisa ser repetida.
        status = 'error';
      }

      setStatuses((previous) => ({
        ...previous,
        [result.id]: status,
      }));

      void queryClient.invalidateQueries({
        queryKey: ['ranking'],
      });

      void queryClient.invalidateQueries({
        queryKey: ['history'],
      });
    },

    onError: (_error, result) => {
      // A partida permanece na fila.
      setStatuses((previous) => ({
        ...previous,
        [result.id]: 'error',
      }));
    }
  });

  const submitMatch = useCallback((result: MatchResult): void => {
    try {
      // Persiste antes de iniciar a chamada.
      queueMatch(result);
    } catch {
      setStatuses((previous) => ({
        ...previous,
        [result.id]: 'error',
      }));
      return;
    }
    mutate(result);
  }, [mutate]);

  useEffect(() => {
    // Recupera todos os envios pendentes ao abrir a aplicação.
    for (const result of getPendingMatches()) {
      mutate(result);
    }
  }, [mutate]);

  return {
    statuses,
    submitMatch,
  };
}