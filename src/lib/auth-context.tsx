import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile, Company, AppUser } from '@/types/database';

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  session: Session | null;
  profile: Profile | null;
  company: Company | null;
  isLoading: boolean;
  isInitialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{
    error: AuthError | null;
    data: { user: User | null; session: Session | null } | null;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return { profile: null, company: null };
      }

      const typedProfile = profileData as Profile | null;

      if (typedProfile?.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', typedProfile.company_id)
          .maybeSingle();

        if (companyError) {
          console.error('Error fetching company:', companyError);
          return { profile: typedProfile, company: null };
        }

        return { profile: typedProfile, company: companyData as Company | null };
      }

      return { profile: typedProfile, company: null };
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      return { profile: null, company: null };
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const { profile: newProfile, company: newCompany } = await fetchUserData(user.id);
    setProfile(newProfile);
    setCompany(newCompany);
  }, [user, fetchUserData]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          const { profile: profileData, company: companyData } = await fetchUserData(
            initialSession.user.id
          );
          if (mounted) {
            setProfile(profileData);
            setCompany(companyData);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === 'SIGNED_IN' && newSession?.user) {
        (async () => {
          const { profile: profileData, company: companyData } = await fetchUserData(
            newSession.user.id
          );
          if (mounted) {
            setProfile(profileData);
            setCompany(companyData);
            setIsLoading(false);
          }
        })();
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setCompany(null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserData]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setIsLoading(false);
    }
    return { error };
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
    if (error) {
      setIsLoading(false);
    }
    return { error, data };
  };

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setCompany(null);
    setIsLoading(false);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  };

  const appUser: AppUser | null = user
    ? {
        id: user.id,
        email: user.email ?? '',
        profile,
        company,
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        appUser,
        session,
        profile,
        company,
        isLoading,
        isInitialized,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
