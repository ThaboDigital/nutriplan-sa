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

export const authService = {
  async getCurrentUser(): Promise<AuthUser | null> {
    if (!isSupabaseConfigured) {
      const guest = localStorage.getItem('nutriplan_auth_user');
      return guest ? JSON.parse(guest) : null;
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

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

    return {
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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: 'Registration failed. Try again.' };

    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || name,
        isGuest: false,
        role: 'user',
        subscriptionTier: 'free',
        subscriptionStatus: 'inactive',
      },
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

    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
        isGuest: false,
        role,
        subscriptionTier,
        subscriptionPeriod,
        subscriptionStatus,
        cellNumber,
      },
      error: null,
    };
  },

  async signInWithGoogle(): Promise<{ error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
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
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
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