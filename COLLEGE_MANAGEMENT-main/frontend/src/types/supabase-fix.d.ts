// This file provides type declarations for @supabase/auth-helpers-react
declare module '@supabase/auth-helpers-react' {
  import { SupabaseClient, Session } from '@supabase/supabase-js';
  import { ReactNode } from 'react';

  interface SessionContextProps {
    supabaseClient: SupabaseClient;
    session: Session | null;
  }

  export const SessionContext: React.Context<SessionContextProps>;
  
  export function useSession(): Session | null;
  export function useSupabaseClient<T = any>(): SupabaseClient<T>;
  export function useUser(): any; // Adjust the return type as needed
  export function SessionContextProvider({
    children,
    initialSession,
    supabaseClient,
  }: {
    children: ReactNode;
    initialSession: Session | null;
    supabaseClient: SupabaseClient;
  }): JSX.Element;
}

// This suppresses the tsconfig/react-library.json error
declare module 'tsconfig/react-library.json' {
  const config: any;
  export default config;
}
