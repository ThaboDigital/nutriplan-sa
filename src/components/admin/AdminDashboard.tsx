import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import { SA_RECIPES } from '../../data/saFoodDatabase';
import { Recipe } from '../../types';
import { formatZAR, formatCalories } from '../../utils/formatters';
import { resendEmailService } from '../../services/resendEmailService';
import {
  Shield,
  Users,
  CreditCard,
  TrendingUp,
  Search,
  CheckCircle2,
  XCircle,
  Database,
  Edit3,
  Save,
  Lock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Smartphone,
  Mail,
  Send,
  Key,
  Check
} from 'lucide-react';

interface SubscriberRow {
  id: string;
  name: string;
  email: string;
  cell_number?: string;
  role: 'user' | 'admin';
  subscription_tier: 'free' | 'pro' | 'vip';
  subscription_period: 'monthly' | 'annual';
  subscription_status: 'active' | 'inactive' | 'cancelled';
  created_at: string;
}

export const AdminDashboard: React.FC = () => {
  const { authUser, showToast, setActiveTab, userProfile, updateUserProfile } = useApp();
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(
    authUser?.role === 'admin' || userProfile?.role === 'admin'
  );

  const [subscribers, setSubscribers] = useState<SubscriberRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState<'subscribers' | 'database' | 'emails'>('subscribers');

  // Food Database Editable State
  // Food Database Editable State
  const [recipesList, setRecipesList] = useState<Recipe[]>(SA_RECIPES);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [foodSearch, setFoodSearch] = useState('');
  const [editFormData, setEditFormData] = useState<Partial<Recipe>>({});

  // Resend Email Center State
  const [resendApiKeyInput, setResendApiKeyInput] = useState(() => resendEmailService.getStoredApiKey());
  const [resendSenderInput, setResendSenderInput] = useState(() => resendEmailService.getStoredSender());
  const [testEmailAddress, setTestEmailAddress] = useState(authUser?.email || 'thabodigitalza@gmail.com');
  const [testTier, setTestTier] = useState<'monthly' | 'annual'>('monthly');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [loadingEmailLogs, setLoadingEmailLogs] = useState(false);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadEmailLogs = async () => {
    setLoadingEmailLogs(true);
    try {
      if (isSupabaseConfigured) {
        const { data } = await supabase
          .from('email_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(25);
        if (data) {
          setEmailLogs(data);
        }
      }
    } catch (e) {
      console.warn('Error loading email logs:', e);
    } finally {
      setLoadingEmailLogs(false);
    }
  };

  const handleSaveResendSettings = () => {
    resendEmailService.setStoredApiKey(resendApiKeyInput);
    resendEmailService.setStoredSender(resendSenderInput);
    showToast('Resend email settings saved!', 'success');
  };

  const handleSendWelcomeEmail = async (sub: SubscriberRow) => {
    showToast(`Sending Pro welcome email to ${sub.email}...`, 'info');
    const res = await resendEmailService.sendSubscriptionWelcomeEmail({
      to: sub.email,
      name: sub.name,
      tier: sub.subscription_period || 'monthly',
      amount: sub.subscription_period === 'annual' ? 399 : 49,
      resendApiKey: resendApiKeyInput || undefined,
      customSender: resendSenderInput || undefined,
    });

    if (res.success) {
      showToast(res.message, 'success');
      loadEmailLogs();
    } else {
      showToast(res.message, 'warning');
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddress) {
      showToast('Please enter an email address for testing.', 'warning');
      return;
    }
    setSendingTestEmail(true);
    const res = await resendEmailService.sendSubscriptionWelcomeEmail({
      to: testEmailAddress,
      name: 'Thabo',
      tier: testTier,
      amount: testTier === 'annual' ? 399 : 49,
      resendApiKey: resendApiKeyInput || undefined,
      customSender: resendSenderInput || undefined,
    });
    setSendingTestEmail(false);

    if (res.success) {
      showToast(res.message, 'success');
      loadEmailLogs();
    } else {
      showToast(res.message, 'warning');
    }
  };

  const loadSubscribers = async () => {
    setLoadingUsers(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, created_at, role, subscription_tier, subscription_period, subscription_status, cell_number')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          const rows: SubscriberRow[] = data.map(d => ({
            id: d.id,
            name: d.name || 'User',
            email: d.email || ('user_' + d.id.slice(0, 5) + '@nutriplans.co.za'),
            cell_number: d.cell_number || '082 123 4567',
            role: d.role || 'user',
            subscription_tier: d.subscription_tier || 'free',
            subscription_period: d.subscription_period || 'monthly',
            subscription_status: d.subscription_status || 'inactive',
            created_at: d.created_at || new Date().toISOString(),
          }));
          setSubscribers(rows);
          setLoadingUsers(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Supabase subscribers fetch fallback:', e);
    }

    // Default Seed / Mock Data for Preview
    const seed: SubscriberRow[] = [
      {
        id: 'usr_thabo_01',
        name: 'Thabo Mokoena',
        email: 'thabo@thabosystems.co.za',
        cell_number: '083 456 7890',
        role: 'admin',
        subscription_tier: 'pro',
        subscription_period: 'annual',
        subscription_status: 'active',
        created_at: '2026-08-20T10:00:00Z',
      },
      {
        id: 'usr_lerato_02',
        name: 'Lerato Dlamini',
        email: 'lerato.d@gmail.com',
        cell_number: '072 987 6543',
        role: 'user',
        subscription_tier: 'pro',
        subscription_period: 'monthly',
        subscription_status: 'active',
        created_at: '2026-08-25T14:30:00Z',
      },
      {
        id: 'usr_sipho_03',
        name: 'Sipho Zulu',
        email: 'sipho.z@outlook.com',
        cell_number: '081 234 5678',
        role: 'user',
        subscription_tier: 'free',
        subscription_period: 'monthly',
        subscription_status: 'inactive',
        created_at: '2026-08-29T09:15:00Z',
      },
      {
        id: 'usr_anika_04',
        name: 'Anika van der Merwe',
        email: 'anika.vdm@iafrica.com',
        cell_number: '084 555 1212',
        role: 'user',
        subscription_tier: 'pro',
        subscription_period: 'monthly',
        subscription_status: 'active',
        created_at: '2026-08-30T16:45:00Z',
      },
    ];
    setSubscribers(seed);
    setLoadingUsers(false);
  };

  const handleTogglePro = async (sub: SubscriberRow) => {
    const newTier = sub.subscription_tier === 'pro' ? 'free' : 'pro';
    const newStatus = newTier === 'pro' ? 'active' : 'inactive';

    setSubscribers(prev =>
      prev.map(s => (s.id === sub.id ? { ...s, subscription_tier: newTier, subscription_status: newStatus } : s))
    );

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({ subscription_tier: newTier, subscription_status: newStatus })
          .eq('id', sub.id);
      } catch (e) {
        console.warn('Database tier update note:', e);
      }
    }

    showToast(`Updated ${sub.name}'s plan to ${newTier.toUpperCase()}`, 'success');
  };

  const handleSaveRecipeEdit = (recipeId: string) => {
    setRecipesList(prev =>
      prev.map(r => (r.id === recipeId ? ({ ...r, ...editFormData } as Recipe) : r))
    );
    setEditingRecipeId(null);
    setEditFormData({});
    showToast('South African Food Database updated!', 'success');
  };

  // Aggregated Metrics Calculations
  const totalUsers = subscribers.length;
  const totalProSubscribers = subscribers.filter(s => s.subscription_tier === 'pro').length;
  const monthlySubscribers = subscribers.filter(s => s.subscription_tier === 'pro' && s.subscription_period === 'monthly').length;
  const annualSubscribers = subscribers.filter(s => s.subscription_tier === 'pro' && s.subscription_period === 'annual').length;
  const totalMRR = (monthlySubscribers * 49) + (annualSubscribers * (399 / 12));
  const conversionRate = totalUsers > 0 ? Math.round((totalProSubscribers / totalUsers) * 100) : 0;

  const filteredSubscribers = subscribers.filter(
    s => s.name.toLowerCase().includes(userSearch.toLowerCase()) || s.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredRecipes = recipesList.filter(
    r => r.title.toLowerCase().includes(foodSearch.toLowerCase()) || r.tags.some(t => t.toLowerCase().includes(foodSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#17211B] text-[#3FAE68] flex items-center justify-center shadow-xs">
              <Shield className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#17211B] tracking-tight">
              Admin & Revenue Console
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-medium text-[#6B756C] mt-0.5">
            NutriPlan SA Subscriber Intelligence & South African Food Database
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-[#E8EDE9] shadow-2xs">
          <button
            onClick={() => setActiveAdminTab('subscribers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeAdminTab === 'subscribers'
                ? 'bg-[#17211B] text-white'
                : 'text-[#6B756C] hover:text-[#17211B]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Subscribers ({totalUsers})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('database')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeAdminTab === 'database'
                ? 'bg-[#17211B] text-white'
                : 'text-[#6B756C] hover:text-[#17211B]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Food Database ({recipesList.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveAdminTab('emails');
              loadEmailLogs();
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeAdminTab === 'emails'
                ? 'bg-[#17211B] text-white'
                : 'text-[#6B756C] hover:text-[#17211B]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Center (Resend)</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8EDE9] shadow-2xs">
          <div className="flex items-center justify-between text-[#6B756C] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-[#17211B]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#17211B]">{totalUsers}</div>
          <span className="text-[10px] text-[#3FAE68] font-bold block mt-1">+100% cloud sync</span>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8EDE9] shadow-2xs">
          <div className="flex items-center justify-between text-[#6B756C] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pro Members</span>
            <Sparkles className="w-4 h-4 text-[#3FAE68]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#2C854E]">{totalProSubscribers}</div>
          <span className="text-[10px] text-[#6B756C] font-semibold block mt-1">
            {monthlySubscribers} Monthly • {annualSubscribers} Annual
          </span>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8EDE9] shadow-2xs">
          <div className="flex items-center justify-between text-[#6B756C] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Monthly Revenue (MRR)</span>
            <CreditCard className="w-4 h-4 text-[#3FAE68]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#17211B]">
            {formatZAR(Math.round(totalMRR))}
          </div>
          <span className="text-[10px] text-[#3FAE68] font-bold block mt-1">PayFast Recurring Pipeline</span>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8EDE9] shadow-2xs">
          <div className="flex items-center justify-between text-[#6B756C] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-[#F2A65A]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#17211B]">{conversionRate}%</div>
          <span className="text-[10px] text-[#6B756C] font-semibold block mt-1">Guest to Pro conversion</span>
        </div>
      </div>

      {/* TAB 1: Subscribers Intelligence Table */}
      {activeAdminTab === 'subscribers' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8EDE9] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-[#17211B]">Subscribers & Profiles</h3>
              <p className="text-xs text-[#6B756C]">Manage customer plans and manual overrides</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#6B756C] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search user or email..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E8EDE9] text-xs font-bold text-[#17211B] outline-none focus:border-[#3FAE68]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8EDE9] text-[#6B756C] font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-3 px-3">Subscriber</th>
                  <th className="pb-3 px-3">Contact</th>
                  <th className="pb-3 px-3">Plan Tier</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F0]">
                {filteredSubscribers.map(sub => (
                  <tr key={sub.id} className="hover:bg-[#F8FBF9] transition">
                    <td className="py-3 px-3">
                      <div className="font-extrabold text-[#17211B]">{sub.name}</div>
                      <div className="text-[11px] text-[#6B756C]">{sub.email}</div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#17211B]">
                      {sub.cell_number || '082 123 4567'}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                          sub.subscription_tier === 'pro'
                            ? 'bg-[#EAF7EF] text-[#2C854E] border border-[#3FAE68]/30'
                            : 'bg-[#F4F6F4] text-[#6B756C]'
                        }`}
                      >
                        {sub.subscription_tier === 'pro' ? 'PRO ' + sub.subscription_period.toUpperCase() : 'FREE'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          sub.subscription_status === 'active' ? 'text-[#2C854E]' : 'text-[#6B756C]'
                        }`}
                      >
                        {sub.subscription_status === 'active' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#3FAE68]" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-[#6B756C]" />
                        )}
                        <span className="capitalize">{sub.subscription_status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleSendWelcomeEmail(sub)}
                        className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#EAF7EF] text-[#2C854E] hover:bg-[#d6f0df] transition inline-flex items-center gap-1 shadow-2xs active:scale-95"
                        title="Send Pro Welcome Email via Resend"
                      >
                        <Mail className="w-3 h-3" />
                        <span>Email</span>
                      </button>

                      <button
                        onClick={() => handleTogglePro(sub)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition active:scale-95 ${
                          sub.subscription_tier === 'pro'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-[#3FAE68] text-white hover:bg-[#349859]'
                        }`}
                      >
                        {sub.subscription_tier === 'pro' ? 'Revoke Pro' : 'Grant Pro'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: South African Food Database Manager */}
      {activeAdminTab === 'database' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8EDE9] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-[#17211B]">South African Food & Recipe Database</h3>
              <p className="text-xs text-[#6B756C]">
                Calibrate nutrition metrics and ZAR estimated pricing benchmarks
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#6B756C] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search recipe or tag..."
                value={foodSearch}
                onChange={e => setFoodSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E8EDE9] text-xs font-bold text-[#17211B] outline-none focus:border-[#3FAE68]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8EDE9] text-[#6B756C] font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-3 px-3">Recipe / Meal</th>
                  <th className="pb-3 px-3">Calories</th>
                  <th className="pb-3 px-3">Protein (g)</th>
                  <th className="pb-3 px-3">Carbs (g)</th>
                  <th className="pb-3 px-3">Fat (g)</th>
                  <th className="pb-3 px-3">Est. Cost (ZAR)</th>
                  <th className="pb-3 px-3 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F0]">
                {filteredRecipes.map(recipe => {
                  const isEditing = editingRecipeId === recipe.id;

                  return (
                    <tr key={recipe.id} className="hover:bg-[#F8FBF9] transition">
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-[#17211B]">{recipe.title}</div>
                        <div className="text-[10px] text-[#3FAE68] font-semibold">
                          {recipe.tags.join(' • ')}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-bold">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-16 px-1.5 py-1 border rounded text-xs"
                            defaultValue={recipe.nutrition.calories}
                            onChange={e =>
                              setEditFormData({
                                ...editFormData,
                                nutrition: {
                                  ...recipe.nutrition,
                                  calories: parseInt(e.target.value) || 0,
                                },
                              })
                            }
                          />
                        ) : (
                          formatCalories(recipe.nutrition.calories)
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-14 px-1.5 py-1 border rounded text-xs"
                            defaultValue={recipe.nutrition.proteinG}
                            onChange={e =>
                              setEditFormData({
                                ...editFormData,
                                nutrition: {
                                  ...recipe.nutrition,
                                  proteinG: parseInt(e.target.value) || 0,
                                },
                              })
                            }
                          />
                        ) : (
                          `${recipe.nutrition.proteinG}g`
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-14 px-1.5 py-1 border rounded text-xs"
                            defaultValue={recipe.nutrition.carbsG}
                            onChange={e =>
                              setEditFormData({
                                ...editFormData,
                                nutrition: {
                                  ...recipe.nutrition,
                                  carbsG: parseInt(e.target.value) || 0,
                                },
                              })
                            }
                          />
                        ) : (
                          `${recipe.nutrition.carbsG}g`
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-14 px-1.5 py-1 border rounded text-xs"
                            defaultValue={recipe.nutrition.fatG}
                            onChange={e =>
                              setEditFormData({
                                ...editFormData,
                                nutrition: {
                                  ...recipe.nutrition,
                                  fatG: parseInt(e.target.value) || 0,
                                },
                              })
                            }
                          />
                        ) : (
                          `${recipe.nutrition.fatG}g`
                        )}
                      </td>

                      <td className="py-3 px-3 font-extrabold text-[#2C854E]">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-16 px-1.5 py-1 border rounded text-xs"
                            defaultValue={recipe.estimatedCostZAR}
                            onChange={e =>
                              setEditFormData({
                                ...editFormData,
                                estimatedCostZAR: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        ) : (
                          formatZAR(recipe.estimatedCostZAR)
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveRecipeEdit(recipe.id)}
                            className="p-1.5 rounded-lg bg-[#3FAE68] text-white hover:bg-[#349859] transition"
                            title="Save Changes"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingRecipeId(recipe.id);
                              setEditFormData(recipe);
                            }}
                            className="p-1.5 rounded-lg text-[#6B756C] hover:text-[#17211B] hover:bg-black/5 transition"
                            title="Edit Food Metrics"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Resend Email Center & Subscription Automation */}
      {activeAdminTab === 'emails' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Card 1: Resend Configuration */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8EDE9] shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#EAF7EF] text-[#2C854E] flex items-center justify-center">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#17211B]">Resend API Configuration</h3>
                    <p className="text-[11px] text-[#6B756C]">Automated subscription & client receipt delivery</p>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                  resendApiKeyInput ? 'bg-[#EAF7EF] text-[#2C854E]' : 'bg-amber-50 text-amber-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${resendApiKeyInput ? 'bg-[#3FAE68]' : 'bg-amber-500'}`} />
                  {resendApiKeyInput ? 'Key Configured' : 'Key Needed'}
                </span>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-[#17211B] mb-1">
                    Resend API Key (starts with <code>re_...</code>)
                  </label>
                  <input
                    type="password"
                    value={resendApiKeyInput}
                    onChange={e => setResendApiKeyInput(e.target.value)}
                    placeholder="re_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EDE9] text-xs font-mono text-[#17211B] outline-none focus:border-[#3FAE68] bg-[#F8FBF9]"
                  />
                  <p className="text-[10px] text-[#6B756C] mt-1">
                    Create your free API key at <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-[#2C854E] font-bold hover:underline">resend.com/api-keys</a>.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#17211B] mb-1">
                    From Sender Email Address
                  </label>
                  <input
                    type="text"
                    value={resendSenderInput}
                    onChange={e => setResendSenderInput(e.target.value)}
                    placeholder="NutriPlan SA <notifications@thabosystems.co.za>"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EDE9] text-xs font-bold text-[#17211B] outline-none focus:border-[#3FAE68] bg-[#F8FBF9]"
                  />
                  <p className="text-[10px] text-[#6B756C] mt-1">
                    If your domain is pending verification in Resend, emails automatically route through <code>NutriPlan SA &lt;onboarding@resend.dev&gt;</code>.
                  </p>
                </div>

                <button
                  onClick={handleSaveResendSettings}
                  className="w-full py-2.5 rounded-xl bg-[#17211B] text-white hover:bg-black font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                >
                  <Save className="w-3.5 h-3.5 text-[#3FAE68]" />
                  <span>Save Email Configuration</span>
                </button>
              </div>
            </div>

            {/* Card 2: Send Test Subscription Email */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8EDE9] shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#EAF7EF] text-[#2C854E] flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#17211B]">Test Subscription Email</h3>
                    <p className="text-[11px] text-[#6B756C]">Send a real test email to check delivery & styling</p>
                  </div>
                </div>

                <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#F8FBF9] text-[#2C854E] border border-[#EAF7EF]">
                  Live Test
                </span>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-[#17211B] mb-1">
                    Recipient Test Email
                  </label>
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={e => setTestEmailAddress(e.target.value)}
                    placeholder="thabodigitalza@gmail.com"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EDE9] text-xs font-bold text-[#17211B] outline-none focus:border-[#3FAE68] bg-[#F8FBF9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#17211B] mb-1">
                    Plan Preview Tier
                  </label>
                  <select
                    value={testTier}
                    onChange={e => setTestTier(e.target.value as 'monthly' | 'annual')}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EDE9] text-xs font-bold text-[#17211B] outline-none focus:border-[#3FAE68] bg-[#F8FBF9]"
                  >
                    <option value="monthly">NutriPlan Pro Monthly (R49.00 / month)</option>
                    <option value="annual">NutriPlan Pro Annual (R399.00 / year - Save 32%)</option>
                  </select>
                </div>

                <button
                  onClick={handleSendTestEmail}
                  disabled={sendingTestEmail}
                  className="w-full py-2.5 rounded-xl bg-[#3FAE68] text-white hover:bg-[#349859] font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm active:scale-98 disabled:opacity-50"
                >
                  {sendingTestEmail ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending via Resend...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Test Pro Welcome Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Live Delivery Logs */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8EDE9] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#17211B]">Client Subscription Email Logs</h3>
                <p className="text-[11px] text-[#6B756C]">Real-time transactional dispatch history via Resend</p>
              </div>

              <button
                onClick={loadEmailLogs}
                disabled={loadingEmailLogs}
                className="px-3 py-1.5 rounded-xl bg-[#F8FBF9] hover:bg-[#EAF7EF] text-[#2C854E] text-xs font-bold transition flex items-center gap-1 border border-[#EAF7EF]"
              >
                <RefreshCw className={`w-3 h-3 ${loadingEmailLogs ? 'animate-spin' : ''}`} />
                <span>Refresh Logs</span>
              </button>
            </div>

            {emailLogs.length === 0 ? (
              <div className="py-8 text-center bg-[#F8FBF9] rounded-2xl border border-dashed border-[#E8EDE9] text-xs text-[#6B756C]">
                <Mail className="w-6 h-6 text-[#3FAE68] mx-auto mb-2 opacity-50" />
                <p className="font-bold">No emails recorded yet</p>
                <p className="text-[11px] mt-0.5">When users upgrade or you click "Send Email" above, dispatch logs appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E8EDE9] text-[#6B756C] font-bold uppercase text-[10px] tracking-wider">
                      <th className="pb-3 px-3">Recipient</th>
                      <th className="pb-3 px-3">Type</th>
                      <th className="pb-3 px-3">Plan Tier</th>
                      <th className="pb-3 px-3">Amount</th>
                      <th className="pb-3 px-3">Status</th>
                      <th className="pb-3 px-3 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F2F0]">
                    {emailLogs.map(log => (
                      <tr key={log.id} className="hover:bg-[#F8FBF9] transition">
                        <td className="py-2.5 px-3 font-extrabold text-[#17211B]">
                          {log.recipient_email}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="capitalize font-semibold text-[#17211B]">
                            {log.email_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-[#2C854E]">
                          {log.tier || 'monthly'}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#17211B]">
                          {formatZAR(Number(log.amount_zar) || 49)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2C854E]">
                            <CheckCircle2 className="w-3 h-3 text-[#3FAE68]" />
                            <span>Sent</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-[10px] text-[#6B756C]">
                          {new Date(log.created_at).toLocaleString('en-ZA')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};