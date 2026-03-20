import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';

const DPPS_QUERY = gql`
  query GetDPPs($month: Int, $year: Int) {
    dpps(month: $month, year: $year) {
      id
      date
      status
      score
      totalMarks
      notes
      completedAt
      tags {
        id
        topicId
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

const UPDATE_DPP = gql`
  mutation UpdateDPP($date: DateTime!, $status: String, $score: Float, $totalMarks: Float, $notes: String) {
    updateDPP(date: $date, status: $status, score: $score, totalMarks: $totalMarks, notes: $notes) {
      id
      status
    }
  }
`;

export function useDPPs(month?: number, year?: number) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['dpps', month, year],
    queryFn: async () => {
      const data: any = await graphqlClient.request(DPPS_QUERY, { month, year });
      return data.dpps;
    },
  });

  const updateDPP = useMutation({
    mutationFn: async (vars: any) => graphqlClient.request(UPDATE_DPP, vars),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['dpps'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  return {
    ...query,
    updateDPP,
  };
}
