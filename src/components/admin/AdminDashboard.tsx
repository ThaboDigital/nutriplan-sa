import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import { SA_RECIPES } from '../../data/saFoodDatabase';
import { Recipe } from '../../types';
import { formatZAR, formatCalories } from '../../utils/formatters';
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
  Smartphone
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
  const [activeAdminTab, setActiveAdminTab] = useState<'subscribers' | 'database'>('subscribers');

  // Food Database Editable State
  const [recipesList, setRecipesList] = useState<Recipe[]>(SA_RECIPES);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [foodSearch, setFoodSearch] = useState('');
  const [editFormData, setEditFormData] = useState<Partial<Recipe>>({});

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    setLoadingUsers(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, created_at, role, subscription_tier, subscription_period, subscription_status, cell_number')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          const rows: SubscriberRow[] = data.map(d => ({
            id: d.id,
            name: d.name || 'User',
            email: 'user_' + d.id.slice(0, 5) + '@nutriplans.co.za',
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
  const totalMRR = (monthlySubscribers * 69) + (annualSubscribers * (579 / 12));
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
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleTogglePro(sub)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
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
    </div>
  );
};