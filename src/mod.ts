import { SupabaseClient } from './deps.deno.ts';

interface Session {
  id: string;
  session: string;
}

export function SupabaseAdapter<T>({ supabase, table }: { supabase: SupabaseClient; table: string }) {
  return {
    read: async (id: string) => {
      const { data, error } = await supabase.from<Session>(table).select('session').eq('id', id).single();
      if (error || !data) {
        return undefined;
      }
      return JSON.parse(data.session) as T;
    },
    write: async (id: string, value: T) => {
      const input = { id, session: JSON.stringify(value) };

      await supabase.from<Session>(table).upsert(input, { returning: 'minimal' });
    },
    delete: async (id: string) => {
      await supabase.from<Session>(table).delete({ returning: 'minimal' }).match({ id });
    },
  };
}
