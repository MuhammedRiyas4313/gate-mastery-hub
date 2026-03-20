import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';

const PLANNER_QUERY = gql`
  query GetPlanner($from: DateTime!, $to: DateTime!) {
    dailyLogs(from: $from, to: $to) {
      id
      date
      notes
      entries {
        topic {
          id
          name
          subject {
            id
            name
            icon
            color
          }
        }
      }
    }
  }
`;

// Also need to fetch revisions in that range
const REVISIONS_RANGE_QUERY = gql`
  query GetRevisionsRange($from: DateTime!, $to: DateTime!) {
    revisions(from: $from, to: $to) {
      id
      scheduledDate
      status
      revisionNumber
      topic {
        id
        name
        subject {
           id
           name
           icon
           color
        }
      }
    }
  }
`;

export function usePlanner(month: Date) {
  const from = new Date(month.getFullYear(), month.getMonth(), 1);
  const to = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const logsQuery = useQuery({
    queryKey: ['planner-logs', from.toISOString(), to.toISOString()],
    queryFn: async () => {
      const data: any = await graphqlClient.request(PLANNER_QUERY, { 
        from: from.toISOString(), 
        to: to.toISOString() 
      });
      return data.dailyLogs;
    },
  });

  const revisionsQuery = useQuery({
    queryKey: ['planner-revisions', from.toISOString(), to.toISOString()],
    queryFn: async () => {
      const data: any = await graphqlClient.request(REVISIONS_RANGE_QUERY, { 
        from: from.toISOString(), 
        to: to.toISOString() 
      });
      return data.revisions;
    },
  });

  return {
    logs: logsQuery.data || [],
    revisions: revisionsQuery.data || [],
    isLoading: logsQuery.isLoading || revisionsQuery.isLoading,
  };
}
