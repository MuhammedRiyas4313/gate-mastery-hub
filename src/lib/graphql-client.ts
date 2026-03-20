import { GraphQLClient } from 'graphql-request';

const endpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

export const graphqlClient = new GraphQLClient(endpoint);

export const setAuthToken = (token?: string) => {
  if (token) {
    graphqlClient.setHeader('Authorization', `Bearer ${token}`);
  } else {
    graphqlClient.setHeader('Authorization', '');
  }
};

// Auto-init token from localStorage
const savedToken = localStorage.getItem('gate_token');
if (savedToken) {
  setAuthToken(savedToken);
}
