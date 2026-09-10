import { supabase, isSupabaseConfigured } from './supabaseClient';
import { UserRole, SubscriptionTier, SubscriptionPeriod, SubscriptionStatus } from '../types';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  isGuest?: boolean;
  role?: UserRole;
  subscriptionTier?: SubscriptionTier;
  subscriptionPeriod?: SubscriptionPeriod;
  subscriptionStatus?: SubscriptionStatus;
  cellNumber?: string;
}

const getAppOrigin = (): string => {
  if (typeof window === 'undefined') return 'https://nutriplan.thabosystems.co.za';
  if (window.location.hostname.includes('localhost') || window.location.hostname === '127.0.0.1') {
    return window.location.origin;
  }
  return 'https://nutriplan.thabosystems.co.za';
};

export const authService = {
  async getCurrentUser(): Promise<AuthUser | null> {
    if (!isSupabaseConfigured) {
      const guest = localStorage.getItem('nutriplan_auth_user');
      return guest ? JSON.parse(guest) : null;
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      const local = localStorage.getItem('nutriplan_auth_user');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (parsed && !parsed.isGuest) return parsed;
        } catch (e) {}
      }
      return null;
    }

    let role: UserRole = 'user';
    let subscriptionTier: SubscriptionTier = 'free';
    let subscriptionPeriod: SubscriptionPeriod = 'monthly';
    let subscriptionStatus: SubscriptionStatus = 'inactive';
    let cellNumber: string | undefined = undefined;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, subscription_tier, subscription_period, subscription_status, cell_number')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        role = (profile.role as UserRole) || 'user';
        subscriptionTier = (profile.subscription_tier as SubscriptionTier) || 'free';
        subscriptionPeriod = (profile.subscription_period as SubscriptionPeriod) || 'monthly';
        subscriptionStatus = (profile.subscription_status as SubscriptionStatus) || 'inactive';
        cellNumber = profile.cell_number || undefined;
      }
    } catch (e) {
      console.warn('Profile fetch notice:', e);
    }

    const authUserObj: AuthUser = {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      isGuest: false,
      role,
      subscriptionTier,
      subscriptionPeriod,
      subscriptionStatus,
      cellNumber,
    };
    localStorage.setItem('nutriplan_auth_user', JSON.stringify(authUserObj));
    return authUserObj;
  },

  async signUp(email: string, password: string, name: string): Promise<{ user: AuthUser | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      const mockUser: AuthUser = {
        id: 'usr_' + Date.now(),
        email,
        name,
        isGuest: false,
        role: 'user',
        subscriptionTier: 'free',
        subscriptionStatus: 'inactive',
      };
      localStorage.setItem('nutriplan_auth_user', JSON.stringify(mockUser));
      return { user: mockUser, error: null };
    }

    const redirectUrl = getAppOrigin();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: 'Registration failed. Try again.' };

    const registeredUser: AuthUser = {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata?.name || name,
      isGuest: false,
      role: 'user',
      subscriptionTier: 'free',
      subscriptionStatus: 'inactive',
    };
    localStorage.setItem('nutriplan_auth_user', JSON.stringify(registeredUser));

    return {
      user: registeredUser,
      error: null,
    };
  },

  async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      const mockUser: AuthUser = {
        id: 'usr_thabo_demo',
        email,
        name: 'Thabo',
        isGuest: false,
        role: 'admin',
        subscriptionTier: 'pro',
        subscriptionStatus: 'active',
      };
      localStorage.setItem('nutriplan_auth_user', JSON.stringify(mockUser));
      return { user: mockUser, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: 'Sign in failed.' };

    let role: UserRole = 'user';
    let subscriptionTier: SubscriptionTier = 'free';
    let subscriptionPeriod: SubscriptionPeriod = 'monthly';
    let subscriptionStatus: SubscriptionStatus = 'inactive';
    let cellNumber: string | undefined = undefined;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, subscription_tier, subscription_period, subscription_status, cell_number')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profile) {
        role = (profile.role as UserRole) || 'user';
        subscriptionTier = (profile.subscription_tier as SubscriptionTier) || 'free';
        subscriptionPeriod = (profile.subscription_period as SubscriptionPeriod) || 'monthly';
        subscriptionStatus = (profile.subscription_status as SubscriptionStatus) || 'inactive';
        cellNumber = profile.cell_number || undefined;
      }
    } catch (e) {
      console.warn('Profile fetch notice on signin:', e);
    }

    const loggedUser: AuthUser = {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
      isGuest: false,
      role,
      subscriptionTier,
      subscriptionPeriod,
      subscriptionStatus,
      cellNumber,
    };
    localStorage.setItem('nutriplan_auth_user', JSON.stringify(loggedUser));

    return {
      user: loggedUser,
      error: null,
    };
  },

  async signInWithGoogle(): Promise<{ error: string | null }> {
    try {
      const redirectUrl = getAppOrigin();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data?.url) {
        window.location.href = data.url;
      }

      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Failed to initialize Google Sign In.' };
    }
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('nutriplan_auth_user');
  },

  async resetPassword(email: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { success: true, error: null };
    }
    const redirectUrl = getAppOrigin();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl + '/reset-password',
    });
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    if (!isSupabaseConfigured) {
      const u = localStorage.getItem('nutriplan_auth_user');
      callback(u ? JSON.parse(u) : null);
      return { unsubscribe: () => {} };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          isGuest: false,
        });
      } else {
        callback(null);
      }
    });

    return { unsubscribe: () => subscription.unsubscribe() };
  },
};