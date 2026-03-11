// This file re-exports the main Supabase client instance from lib/supabase
// to maintain backward compatibility with existing imports
import { supabase } from '../lib/supabase';

export { supabase };
export default supabase;
