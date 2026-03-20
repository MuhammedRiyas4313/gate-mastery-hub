import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';

const QUIZZES_QUERY = gql`
  query GetQuizzes {
    quizzes {
      id
      title
      weekNumber
      quizNumber
      scheduledDate
      status
      score
      totalMarks
      notes
      subjectId
      chapterId
      topicId
      subject {
        id
        name
        icon
        color
      }
    }
  }
`;

const CREATE_QUIZ = gql`
  mutation CreateQuiz($title: String!, $weekNumber: Int, $quizNumber: Int, $scheduledDate: DateTime!, $status: String!, $score: Int, $totalMarks: Int, $subjectId: ID, $chapterId: ID, $topicId: ID, $notes: String) {
    createQuiz(
      title: $title, weekNumber: $weekNumber, quizNumber: $quizNumber, scheduledDate: $scheduledDate, status: $status, score: $score, totalMarks: $totalMarks, subjectId: $subjectId, chapterId: $chapterId, topicId: $topicId, notes: $notes
    ) {
      id
    }
  }
`;

const UPDATE_QUIZ = gql`
  mutation UpdateQuiz($id: ID!, $status: String, $score: Int, $totalMarks: Int, $notes: String) {
    updateQuiz(id: $id, status: $status, score: $score, totalMarks: $totalMarks, notes: $notes) {
      id
      status
    }
  }
`;

const DELETE_QUIZ = gql`
  mutation DeleteQuiz($id: ID!) {
    removeQuiz(id: $id)
  }
`;

export function useQuizzes() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['quizzes'],
    queryFn: async () => {
      const data: any = await graphqlClient.request(QUIZZES_QUERY);
      return data.quizzes;
    },
  });

  const addQuiz = useMutation({
    mutationFn: async (vars: any) => graphqlClient.request(CREATE_QUIZ, vars),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['quizzes'] });
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const updateQuiz = useMutation({
    mutationFn: async (vars: any) => graphqlClient.request(UPDATE_QUIZ, vars),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['quizzes'] });
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const deleteQuiz = useMutation({
    mutationFn: async (id: string) => graphqlClient.request(DELETE_QUIZ, { id }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['quizzes'] });
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  return {
    ...query,
    addQuiz,
    updateQuiz,
    deleteQuiz,
  };
}
