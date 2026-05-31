import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface AuthStore {
  /** false bis die erste Session-Prüfung abgeschlossen ist (verhindert Login-Flackern). */
  ready: boolean;
  session: Session | null;
  user: User | null;
  /** Initialisiert Session-Abfrage + Live-Subscription. Idempotent. */
  init: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

let subscribed = false;

export const useAuth = create<AuthStore>((set) => ({
  ready: false,
  session: null,
  user: null,

  init: () => {
    if (subscribed) return;
    subscribed = true;
    supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session, user: data.session?.user ?? null, ready: true });
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, ready: true });
    });
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));
