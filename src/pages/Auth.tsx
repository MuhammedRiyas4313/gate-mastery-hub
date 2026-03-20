import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      user {
        id
        email
        name
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!, $name: String!) {
    register(email: $email, password: $password, name: $name) {
      accessToken
      user {
        id
        email
        name
      }
    }
  }
`;

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const loginMutation = useMutation({
    mutationFn: async () => {
      const data: any = await graphqlClient.request(LOGIN_MUTATION, { email, password });
      return data.login;
    },
    onSuccess: (data) => {
      authLogin(data.accessToken, data.user);
      toast.success('Logged in successfully!');
      navigate('/');
    },
    onError: (error: any) => {
      toast.error(error?.response?.errors?.[0]?.message || 'Login failed');
    },
  });

  const signupMutation = useMutation({
    mutationFn: async () => {
      const data: any = await graphqlClient.request(REGISTER_MUTATION, { email, password, name });
      return data.register;
    },
    onSuccess: (data) => {
      authLogin(data.accessToken, data.user);
      toast.success('Signed up successfully!');
      navigate('/');
    },
    onError: (error: any) => {
      toast.error(error?.response?.errors?.[0]?.message || 'Signup failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginMutation.mutate();
    } else {
      signupMutation.mutate();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-100px)] px-4 bg-background">
      <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="font-heading text-2xl font-bold tracking-tight text-primary">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isLogin ? 'Log in to track your GATE progress' : 'Create an account to start your GATE study tracker'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background/50 border-primary/10 focus-visible:ring-primary"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-primary/10 focus-visible:ring-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50 border-primary/10 focus-visible:ring-primary"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full font-bold shadow-lg shadow-primary/20 h-11"
              disabled={loginMutation.isPending || signupMutation.isPending}
            >
              {isLogin ? 'Login' : 'Sign Up'}
            </Button>
            <p className="text-sm text-center text-muted-foreground font-medium">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline font-bold"
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
