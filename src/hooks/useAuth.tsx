import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type Profile = {
  username: string | null;
  avatar_url: string | null;
};

type AuthCtx = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isRoleLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAdmin: false,
  isRoleLoading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", userId)
      .maybeSingle();
    setProfile(data ? { username: data.username, avatar_url: data.avatar_url } : null);
  };

  // Fetch role + profile when user changes
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setIsRoleLoading(false);
      setProfile(null);
      return;
    }

    setIsRoleLoading(true);
    
    // Fetch role and profile in parallel
    Promise.all([
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle(),
      fetchProfile(user.id),
    ]).then(([roleResult]) => {
      setIsAdmin(!!roleResult.data);
      setIsRoleLoading(false);
    });
  }, [user?.id]);

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading, isAdmin, isRoleLoading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
