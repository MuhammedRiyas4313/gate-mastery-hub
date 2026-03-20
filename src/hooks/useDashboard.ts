import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';

const DASHBOARD_QUERY = gql`
  query GetDashboard {
    dashboard {
      today
      studyStreak
      gateCountdownDays
      todayTopics {
        id
        name
        dateTaught
        chapter {
          id
          name
        }
        lecture {
          id
          status
        }
        subject {
          id
          name
          icon
          color
        }
        subjectId
        chapterId
      }
      todayDPP {
        id
        date
        status
        tags {
          topicId
          subject {
            id
            name
            icon
            color
          }
        }
      }
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
          chapterId
          subjectId
        }
      }
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
    }
  }
`;

const UPDATE_LECTURE_STATUS = gql`
  mutation UpdateLectureStatus($topicId: ID!, $status: String!) {
    updateLectureStatus(topicId: $topicId, status: $status) {
      id
      status
    }
  }
`;

const UPDATE_DPP_MUTATION = gql`
  mutation UpdateDPP($date: DateTime!, $status: String) {
    updateDPP(date: $date, status: $status) {
      id
      status
    }
  }
`;

const MARK_REVISION_DONE = gql`
  mutation MarkRevisionDone($id: ID!) {
    markRevisionDone(id: $id) {
      id
      status
    }
  }
`;

export function useDashboard() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const data: any = await graphqlClient.request(DASHBOARD_QUERY);
      return data.dashboard;
    },
  });

  const toggleLecture = useMutation({
    mutationFn: async ({ topicId, status }: { topicId: string; status: string }) => {
      return graphqlClient.request(UPDATE_LECTURE_STATUS, { topicId, status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
  });

  const updateDPPStatus = useMutation({
    mutationFn: async ({ date, status }: { date: string; status: string }) => {
      return graphqlClient.request(UPDATE_DPP_MUTATION, { date, status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
  });

  const updateRevision = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
       if (status === 'DONE') {
          return graphqlClient.request(MARK_REVISION_DONE, { id });
       }
       // Other statuses can use snooze/skip but MarkRevisionDone is simplest for check
       return null;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
  });

  return {
    ...query,
    toggleLecture,
    updateDPP: updateDPPStatus,
    updateRevision,
  };
}
