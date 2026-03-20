import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';

const REVISIONS_TODAY = gql`
  query GetRevisionsToday {
    revisionsToday {
      id
      revisionNumber
      status
      scheduledDate
      topic {
        id
        name
        chapter {
          id
          name
        }
        subject {
          id
          icon
          color
        }
      }
    }
  }
`;

const MARK_DONE = gql`
  mutation MarkDone($id: ID!) {
     markRevisionDone(id: $id) {
       id
       status
     }
  }
`;

const SNOOZE = gql`
  mutation Snooze($id: ID!, $days: Int) {
     snoozeRevision(id: $id, days: $days) {
       id
       status
     }
  }
`;

const SKIP = gql`
  mutation Skip($id: ID!) {
     skipRevision(id: $id) {
       id
       status
     }
  }
`;

export function useRevisions() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['revisions'],
    queryFn: async () => {
      const data: any = await graphqlClient.request(REVISIONS_TODAY);
      return data.revisionsToday;
    },
  });

  const markDone = useMutation({
    mutationFn: async (id: string) => graphqlClient.request(MARK_DONE, { id }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['revisions'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const snooze = useMutation({
    mutationFn: async ({ id, days }: { id: string; days?: number }) => graphqlClient.request(SNOOZE, { id, days }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['revisions'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const skip = useMutation({
    mutationFn: async (id: string) => graphqlClient.request(SKIP, { id }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['revisions'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    ...query,
    markDone,
    snooze,
    skip,
  };
}
