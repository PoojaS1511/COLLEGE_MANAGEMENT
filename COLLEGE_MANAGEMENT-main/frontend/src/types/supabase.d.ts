// Type definitions for @supabase/auth-helpers-react
// This is a workaround for the missing tsconfig/react-library.json

declare module '@supabase/auth-helpers-react' {
  export * from '@supabase/auth-helpers-shared';
  export { useUser, useSession, useSessionContext, useSupabaseClient } from '@supabase/auth-helpers-react/dist/index';
}

// This tells TypeScript to ignore the missing tsconfig/react-library.json file
// @ts-ignore
declare module 'tsconfig/react-library.json' {
  const config: any;
  export default config;
}
