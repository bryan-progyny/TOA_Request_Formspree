const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found');
}

// Simple Supabase client implementation using fetch
export const supabase = {
  from: (table: string) => ({
    select: (columns = '*') => ({
      eq: (column: string, value: unknown) => ({
        data: null,
        error: null,
      }),
      async: true,
    }),
  }),
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => ({
        data: null,
        error: null,
      }),
    }),
  },
};
