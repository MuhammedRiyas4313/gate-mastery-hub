import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';

const ANALYTICS_QUERY = gql`
  query GetAnalytics {
    analytics {
      readinessScore
      subjectProgress {
        subject {
          id
          name
          icon
          color
        }
        totalTopics
        doneTopics
        progressPercent
      }
      revisionBySlot {
        slot
        done
        pending
        total
      }
      pyqByDifficulty {
        difficulty
        done
        pending
        total
      }
      activityHeatmap {
        date
        count
        level
      }
    }
  }
`;

export function useAnalytics() {
  const query = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const data: any = await graphqlClient.request(ANALYTICS_QUERY);
      return data.analytics;
    },
  });

  return query;
}
