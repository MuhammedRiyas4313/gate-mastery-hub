import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';

const PYQS_QUERY = gql`
  query GetPYQs {
    pyqs {
      id
      title
      year
      source
      difficulty
      status
      subjectId
      chapterId
      topicId
      notes
      addedDate
      completedAt
      subject {
        id
        name
        icon
        color
      }
    }
  }
`;

const CREATE_PYQ = gql`
  mutation CreatePYQ($title: String!, $year: String, $source: String, $difficulty: String!, $status: String!, $subjectId: ID, $chapterId: ID, $topicId: ID, $notes: String) {
    createPYQ(
      title: $title, year: $year, source: $source, difficulty: $difficulty, status: $status, subjectId: $subjectId, chapterId: $chapterId, topicId: $topicId, notes: $notes
    ) {
      id
    }
  }
`;

const UPDATE_PYQ = gql`
  mutation UpdatePYQ($id: ID!, $status: String, $notes: String, $completedAt: DateTime) {
    updatePYQ(id: $id, status: $status, notes: $notes, completedAt: $completedAt) {
      id
      status
    }
  }
`;

const DELETE_PYQ = gql`
  mutation DeletePYQ($id: ID!) {
    removePYQ(id: $id)
  }
`;

export function usePYQs() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['pyqs'],
    queryFn: async () => {
      const data: any = await graphqlClient.request(PYQS_QUERY);
      return data.pyqs;
    },
  });

  const addPYQ = useMutation({
    mutationFn: async (vars: any) => graphqlClient.request(CREATE_PYQ, vars),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['pyqs'] });
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const updatePYQ = useMutation({
    mutationFn: async (vars: any) => graphqlClient.request(UPDATE_PYQ, vars),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['pyqs'] });
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const deletePYQ = useMutation({
    mutationFn: async (id: string) => graphqlClient.request(DELETE_PYQ, { id }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['pyqs'] });
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  return {
    ...query,
    addPYQ,
    updatePYQ,
    deletePYQ,
  };
}
