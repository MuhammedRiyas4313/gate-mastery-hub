import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';

const SUBJECTS_QUERY = gql`
  query GetSubjects {
    subjects {
      id
      name
      icon
      color
      startDate
      isActive
      chapters {
        id
        name
        orderIndex
        status
        topics {
          id
          name
          orderIndex
          dateTaught
          lecture {
            id
            status
          }
          revisions {
            id
            revisionNumber
            status
          }
        }
      }
    }
  }
`;

const CREATE_SUBJECT = gql`
  mutation CreateSubject($name: String!, $icon: String, $color: String, $startDate: DateTime) {
    createSubject(name: $name, icon: $icon, color: $color, startDate: $startDate) {
      id
    }
  }
`;

const CREATE_CHAPTER = gql`
  mutation CreateChapter($subjectId: ID!, $name: String!, $orderIndex: Int) {
    createChapter(subjectId: $subjectId, name: $name, orderIndex: $orderIndex) {
      id
    }
  }
`;

const CREATE_TOPIC = gql`
  mutation CreateTopic($chapterId: ID!, $name: String!, $orderIndex: Int, $dateTaught: DateTime) {
    createTopic(chapterId: $chapterId, name: $name, orderIndex: $orderIndex, dateTaught: $dateTaught) {
      id
    }
  }
`;

const DELETE_CHAPTER = gql`
  mutation DeleteChapter($id: ID!) {
    deleteChapter(id: $id)
  }
`;

const DELETE_TOPIC = gql`
  mutation DeleteTopic($id: ID!) {
    deleteTopic(id: $id)
  }
`;

export function useSubjects() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const data: any = await graphqlClient.request(SUBJECTS_QUERY);
      return data.subjects;
    },
  });

  const addSubject = useMutation({
    mutationFn: async (vars: any) => graphqlClient.request(CREATE_SUBJECT, vars),
    onSuccess: () => {
      console.log('Subject added, invalidating subjects');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const addChapter = useMutation({
    mutationFn: async (vars: any) => graphqlClient.request(CREATE_CHAPTER, vars),
    onSuccess: () => {
      console.log('Chapter added, invalidating subjects');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const addTopic = useMutation({
    mutationFn: async (vars: any) => graphqlClient.request(CREATE_TOPIC, vars),
    onSuccess: () => {
        console.log('Topic added successfully');
        queryClient.invalidateQueries({ queryKey: ['subjects'] });
        queryClient.refetchQueries({ queryKey: ['subjects'] });
    },
  });

  const removeChapter = useMutation({
    mutationFn: async (id: string) => graphqlClient.request(DELETE_CHAPTER, { id }),
    onSuccess: () => {
      console.log('Chapter removed, invalidating subjects');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const removeTopic = useMutation({
    mutationFn: async (id: string) => graphqlClient.request(DELETE_TOPIC, { id }),
    onSuccess: () => {
      console.log('Topic removed, invalidating subjects');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    ...query,
    addSubject,
    addChapter,
    addTopic,
    deleteChapter: removeChapter,
    deleteTopic: removeTopic,
  };
}
