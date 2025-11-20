import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import {
  Users,
  DollarSign,
  TrendingUp,
  Settings,
  Search,
  Edit,
  Trash2,
  Plus,
  Check,
  X,
  Crown,
  Ticket,
  Calendar,
  Eye,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Progress } from "./ui/progress";
import { supabase } from "../lib/supabaseClient";
import { User, PlanType, AppConfig } from "../types";

interface AdminUser extends User {
  joinDate?: string;
  lastActive?: string;
  status: "active" | "suspended" | "inactive";
}

interface PlanConfig {
  id: PlanType;
  name: string;
  price: number; // stored in dollars in UI, derived from price_monthly_cents
  conversions: number; // monthly_conversions
  features: string[];
  active: boolean;
}

interface Coupon {
  id: string;
  code: string;
  discount_percentage: number;
  created_at: string;
  expires_at: string;
  usage_type: 'single' | 'multi';
  used_by: any[];
  is_active: boolean;
  max_uses: number | null;
  description: string | null;
}

interface AdminProps {
  currentUser: User;
}

export function Admin({ currentUser }: AdminProps) {
  console.log("[Admin] component render start");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<PlanType | null>(null);
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
  const [viewingCouponUsers, setViewingCouponUsers] = useState<Coupon | null>(null);

  const [defaultFreePlanLimit, setDefaultFreePlanLimit] = useState<string>("10");
  const [conversionResetPeriod, setConversionResetPeriod] = useState<string>("monthly");
  const [registrationMode, setRegistrationMode] = useState<"enabled" | "disabled" | "invite-only">("enabled");

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_percentage: 10,
    expires_at: '',
    usage_type: 'multi' as 'single' | 'multi',
    max_uses: null as number | null,
    description: ''
  });

  // Debug: track when the viewingCouponUsers dialog state changes
  useEffect(() => {
    console.log("[Admin] viewingCouponUsers state changed:", viewingCouponUsers);
  }, [viewingCouponUsers]);

  useEffect(() => {
    const loadAdminData = async () => {
      const [{ data: userRows, error: userError }, { data: planRows, error: planError }, { data: configRows, error: configError }, { data: couponRows, error: couponError }] =
        await Promise.all([
          supabase
            .from("users_custom")
            .select("id, name, email, plan, conversions_used, is_active, created_at")
            .order("created_at", { ascending: true }),
          supabase
            .from("plans")
            .select("id, name, price_monthly_cents, monthly_conversions, features, is_active"),
          supabase
            .from("app_configs")
            .select("*")
            .eq("config_key", "global")
            .limit(1)
            .single(),
          supabase
            .from("coupons")
            .select("*")
            .order("created_at", { ascending: false }),
        ]);

      if (!userError && userRows) {
        const mappedUsers: AdminUser[] = userRows.map((u: any) => {
          const createdDate = u.created_at ? new Date(u.created_at) : null;
          return {
            id: u.id,
            name: u.name || u.email,
            email: u.email,
            plan: u.plan as PlanType,
            conversionsUsed: u.conversions_used ?? 0,
            isAdmin: u.role === "admin",
            role: u.role ?? "user",
            planStartedAt: u.plan_started_at ?? null,
            planRenewsAt: u.plan_renews_at ?? null,
            isActive: u.is_active,
            joinDate: createdDate ? createdDate.toISOString() : undefined,
            lastActive: createdDate ? createdDate.toISOString() : undefined,
            status: u.is_active ? "active" : "inactive",
          };
        });
        setUsers(mappedUsers);
      }

      if (!planError && planRows) {
        const mappedPlans: PlanConfig[] = planRows.map((p: any) => ({
          id: p.id as PlanType,
          name: p.name,
          price: (p.price_monthly_cents ?? 0) / 100,
          conversions: p.monthly_conversions ?? 0,
          features: (p.features as string[]) || [],
          active: !!p.is_active,
        }));
        setPlans(mappedPlans);
      }

      if (!configError && configRows) {
        setAppConfig(configRows as AppConfig);
        setDefaultFreePlanLimit(String(configRows.default_free_plan_limit ?? 10));
        setConversionResetPeriod(configRows.conversion_reset_period ?? "monthly");
        setRegistrationMode(configRows.enable_user_registration ? "enabled" : "disabled");
      }

      if (!couponError && couponRows) {
        setCoupons(couponRows as Coupon[]);
      }
    };

    loadAdminData();
  }, []);

  // Calculate statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "active").length;
  const totalConversions = users.reduce((sum, u) => sum + (u.conversionsUsed || 0), 0);
  const totalRevenue = users.reduce((sum, u) => {
    const plan = plans.find(p => p.id === u.plan);
    return sum + (plan?.price || 0);
  }, 0);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateUserPlan = (userId: string, newPlan: PlanType) => {
    const now = new Date();
    const renew = new Date(now);
    renew.setMonth(renew.getMonth() + 1);

    const planStartedAt = now.toISOString();
    const planRenewsAt = renew.toISOString();

    setUsers(users.map(user =>
      user.id === userId
        ? { ...user, plan: newPlan, planStartedAt, planRenewsAt }
        : user
    ));

    supabase
      .from("users_custom")
      .update({
        plan: newPlan,
        plan_started_at: planStartedAt,
        plan_renews_at: planRenewsAt,
      })
      .eq("id", userId)
      .then(({ error }) => {
        if (error) {
          console.error("Failed to update user plan", error);
        }
      });
  };

  const handleUpdateUserStatus = (userId: string, status: "active" | "suspended" | "inactive") => {
    const isActive = status === "active";

    setUsers(users.map(user =>
      user.id === userId ? { ...user, status, isActive } : user
    ));

    supabase
      .from("users_custom")
      .update({ is_active: isActive })
      .eq("id", userId)
      .then(({ error }) => {
        if (error) {
          console.error("Failed to update user status", error);
        }
      });
  };

  const handleResetConversions = (userId: string) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, conversionsUsed: 0 } : user
    ));

    supabase
      .from("users_custom")
      .update({ conversions_used: 0 })
      .eq("id", userId)
      .then(({ error }) => {
        if (error) {
          console.error("Failed to reset conversions", error);
        }
      });
  };

  const handleUpdatePlan = (planId: PlanType, updates: Partial<PlanConfig>) => {
    setPlans(plans.map(plan =>
      plan.id === planId ? { ...plan, ...updates } : plan
    ));
    setEditingPlan(null);

    const supabaseUpdates: any = {};
    if (updates.price !== undefined) {
      supabaseUpdates.price_monthly_cents = Math.round(updates.price * 100);
    }
    if (updates.conversions !== undefined) {
      supabaseUpdates.monthly_conversions = updates.conversions;
    }
    if (updates.active !== undefined) {
      supabaseUpdates.is_active = updates.active;
    }

    if (Object.keys(supabaseUpdates).length > 0) {
      supabase
        .from("plans")
        .update(supabaseUpdates)
        .eq("id", planId)
        .then(({ error }) => {
          if (error) {
            console.error("Failed to update plan", error);
          }
        });
    }
  };

  const getPlanLimits = (planId: PlanType) => {
    return plans.find(p => p.id === planId)?.conversions || 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "suspended": return "bg-red-500";
      case "inactive": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const handleResetAllConversions = async () => {
    const { data, error } = await supabase
      .from("users_custom")
      .update({ conversions_used: 0 })
      .gt("conversions_used", 0)
      .select("id");

    if (error) {
      console.error("Failed to reset all conversions", error);
      return;
    }

    const resetIds = new Set((data || []).map((u: any) => u.id));
    setUsers(prev => prev.map(u => resetIds.has(u.id) ? { ...u, conversionsUsed: 0 } : u));

    const count = resetIds.size;
    if (count === 0) {
      console.info("No users had conversions to reset.");
    }
  };

  const handleExportUserData = async () => {
    const { data, error } = await supabase
      .from("users_custom")
      .select("id, email, name, plan, conversions_used, api_key, bearer_token, role, plan_started_at, plan_renews_at, is_active");

    if (error || !data) {
      console.error("Failed to export user data", error);
      return;
    }

    const rows = data as any[];
    const headers = Object.keys(rows[0] || {
      id: "",
      email: "",
      name: "",
      plan: "",
      conversions_used: "",
      api_key: "",
      bearer_token: "",
      role: "",
      plan_started_at: "",
      plan_renews_at: "",
      is_active: "",
    });

    const csv = [
      headers.join(","),
      ...rows.map(row => headers.map(h => {
        const value = row[h];
        if (value === null || value === undefined) return "";
        const str = String(value).replace(/"/g, '""');
        return `"${str}"`;
      }).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "users_export.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSuspendInactiveUsers = async () => {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("users_custom")
      .update({ is_active: false })
      .lt("plan_started_at", cutoff)
      .eq("is_active", true)
      .eq("conversions_used", 0)
      .select("id");

    if (error) {
      console.error("Failed to suspend inactive users", error);
      return;
    }

    const suspendedIds = new Set((data || []).map((u: any) => u.id));
    setUsers(prev => prev.map(u =>
      suspendedIds.has(u.id)
        ? { ...u, status: "inactive", isActive: false }
        : u
    ));

    const count = suspendedIds.size;
    if (count === 0) {
      console.info("No inactive users to suspend.");
    }
  };

  const handleCreateCoupon = async () => {
    if (!newCoupon.code.trim()) {
      alert('Coupon code is required');
      return;
    }

    const { data, error } = await supabase
      .from('coupons')
      .insert([{
        code: newCoupon.code.toUpperCase(),
        discount_percentage: newCoupon.discount_percentage,
        expires_at: newCoupon.expires_at,
        usage_type: newCoupon.usage_type,
        max_uses: newCoupon.max_uses,
        description: newCoupon.description || null,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Failed to create coupon:', error);
      alert('Failed to create coupon: ' + error.message);
      return;
    }

    if (data) {
      setCoupons([data as Coupon, ...coupons]);
      setIsCreatingCoupon(false);
      setNewCoupon({
        code: '',
        discount_percentage: 10,
        expires_at: '',
        usage_type: 'multi',
        max_uses: null,
        description: ''
      });
    }
  };

  const handleUpdateCoupon = async (couponId: string, updates: Partial<Coupon>) => {
    const { error } = await supabase
      .from('coupons')
      .update(updates)
      .eq('id', couponId);

    if (error) {
      console.error('Failed to update coupon:', error);
      return;
    }

    setCoupons(coupons.map(c => c.id === couponId ? { ...c, ...updates } : c));
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', couponId);

    if (error) {
      console.error('Failed to delete coupon:', error);
      return;
    }

    setCoupons(coupons.filter(c => c.id !== couponId));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const handleViewCouponUsers = (coupon: Coupon) => {
    try {
      console.log("[Admin] handleViewCouponUsers called with coupon:", coupon);
      let usedBy = coupon.used_by;

      // FIX: Handle case where Supabase returns JSONB as a string
      if (typeof usedBy === 'string') {
        try {
          usedBy = JSON.parse(usedBy);
        } catch (e) {
          console.error('Error parsing used_by JSON:', e);
          usedBy = [];
        }
      }

      // Ensure it is an array
      if (!Array.isArray(usedBy)) {
        usedBy = [];
      }

      console.log("[Admin] Parsed used_by value:", usedBy);

      const usageCount = usedBy.length;

      if (usageCount === 0) {
        alert('0 users have used this coupon');
        console.log("[Admin] Coupon has 0 uses, dialog will not open.");
        return;
      }

      // Update state with the PARSED data so the Dialog can read it
      setViewingCouponUsers({ ...coupon, used_by: usedBy });
      console.log("[Admin] viewingCouponUsers set with parsed used_by.");

    } catch (error) {
      console.error('Error viewing coupon users:', error);
      alert('Something went wrong trying to view the users list.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-8 h-8 text-yellow-600" />
            <h2 className="text-gray-900">Admin Dashboard</h2>
          </div>
          <p className="text-gray-600">
            Manage users, plans, and system settings
          </p>
        </div>
        <Badge variant="secondary" className="text-lg py-2 px-4">
          Administrator
        </Badge>
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-gray-600 mb-1">Total Users</p>
          <p className="text-gray-900">{totalUsers}</p>
          <p className="text-sm text-green-600 mt-1">
            {activeUsers} active
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-gray-600 mb-1">Total Conversions</p>
          <p className="text-gray-900">{totalConversions.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">All time</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-gray-600 mb-1">Monthly Revenue</p>
          <p className="text-gray-900">${totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-green-600 mt-1">+12% from last month</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Settings className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-gray-600 mb-1">Active Plans</p>
          <p className="text-gray-900">{plans.filter(p => p.active).length}</p>
          <p className="text-sm text-gray-500 mt-1">Out of {plans.length}</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-muted text-muted-foreground h-9 inline-flex w-full max-w-md items-center justify-center rounded-xl p-[3px] mx-auto">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {/* Search */}
          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          {/* Users Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm text-gray-600">User</th>
                    <th className="text-left p-4 text-sm text-gray-600">Plan</th>
                    <th className="text-left p-4 text-sm text-gray-600">Usage</th>
                    <th className="text-left p-4 text-sm text-gray-600">Status</th>
                    <th className="text-left p-4 text-sm text-gray-600">Last Active</th>
                    <th className="text-left p-4 text-sm text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const limit = getPlanLimits(user.plan);
                    const usagePercent = (user.conversionsUsed / limit) * 100;

                    return (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <p className="text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          {editingUser === user.id ? (
                            <Select
                              value={user.plan}
                              onValueChange={(value: PlanType) => handleUpdateUserPlan(user.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {plans.map(plan => (
                                  <SelectItem key={plan.id} value={plan.id}>
                                    {plan.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="secondary" className="capitalize">
                              {user.plan}
                            </Badge>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="space-y-1 min-w-[150px]">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {user.conversionsUsed} / {limit.toLocaleString()}
                              </span>
                              <span className="text-gray-500">
                                {usagePercent.toFixed(0)}%
                              </span>
                            </div>
                            <Progress value={usagePercent} className="h-2" />
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(user.status)}`} />
                            <span className="text-sm text-gray-700 capitalize">{user.status}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{user.lastActive}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingUser(editingUser === user.id ? null : user.id)}
                            >
                              {editingUser === user.id ? <Check className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResetConversions(user.id)}
                              title="Reset conversions"
                            >
                              <TrendingUp className="w-4 h-4" />
                            </Button>
                            <Select
                              value={user.status}
                              onValueChange={(value: "active" | "suspended" | "inactive") =>
                                handleUpdateUserStatus(user.id, value)
                              }
                            >
                              <SelectTrigger className="w-28 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-gray-900">{plan.name}</h3>
                        <Badge variant={plan.active ? "default" : "secondary"}>
                          {plan.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      {editingPlan === plan.id ? (
                        <div className="grid md:grid-cols-3 gap-4 mt-4">
                          <div>
                            <Label>Price ($)</Label>
                            <Input
                              type="number"
                              defaultValue={plan.price}
                              onChange={(e) => {
                                const newPrice = parseFloat(e.target.value);
                                handleUpdatePlan(plan.id, { price: newPrice });
                              }}
                            />
                          </div>
                          <div>
                            <Label>Conversions</Label>
                            <Input
                              type="number"
                              defaultValue={plan.conversions}
                              onChange={(e) => {
                                const newConversions = parseInt(e.target.value);
                                handleUpdatePlan(plan.id, { conversions: newConversions });
                              }}
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              variant="outline"
                              onClick={() => setEditingPlan(null)}
                              className="w-full"
                            >
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <span>${plan.price}/month</span>
                          <span>•</span>
                          <span>{plan.conversions.toLocaleString()} conversions</span>
                          <span>•</span>
                          <span>{users.filter(u => u.plan === plan.id).length} users</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPlan(editingPlan === plan.id ? null : plan.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdatePlan(plan.id, { active: !plan.active })}
                      >
                        {plan.active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {plan.features.map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Coupons Tab */}
        <TabsContent value="coupons" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Coupon Management</h3>
              <Button onClick={() => setIsCreatingCoupon(!isCreatingCoupon)}>
                {isCreatingCoupon ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {isCreatingCoupon ? 'Cancel' : 'Create Coupon'}
              </Button>
            </div>

            {isCreatingCoupon && (
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                <div>
                  <Label>Coupon Code *</Label>
                  <Input
                    placeholder="SAVE20"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Discount Percentage *</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={newCoupon.discount_percentage}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount_percentage: parseInt(e.target.value) })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Expires At *</Label>
                  <Input
                    type="datetime-local"
                    value={newCoupon.expires_at}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expires_at: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Usage Type</Label>
                  <Select
                    value={newCoupon.usage_type}
                    onValueChange={(value: 'single' | 'multi') => setNewCoupon({ ...newCoupon, usage_type: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Use</SelectItem>
                      <SelectItem value="multi">Multi Use</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Max Uses (Optional)</Label>
                  <Input
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={newCoupon.max_uses || ''}
                    onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    placeholder="e.g., Summer sale discount"
                    value={newCoupon.description}
                    onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <Button onClick={handleCreateCoupon} className="w-full">
                    Create Coupon
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm text-gray-600">Code</th>
                    <th className="text-left p-4 text-sm text-gray-600">Discount</th>
                    <th className="text-left p-4 text-sm text-gray-600">Type</th>
                    <th className="text-left p-4 text-sm text-gray-600">Expires</th>
                    <th className="text-left p-4 text-sm text-gray-600">Usage</th>
                    <th className="text-left p-4 text-sm text-gray-600">Status</th>
                    <th className="text-left p-4 text-sm text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => {
                    const usageCount = Array.isArray(coupon.used_by) ? coupon.used_by.length : 0;
                    const expired = isExpired(coupon.expires_at);

                    return (
                      <tr key={coupon.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-indigo-600" />
                            <span className="font-mono font-semibold text-gray-900">{coupon.code}</span>
                          </div>
                          {coupon.description && (
                            <p className="text-xs text-gray-500 mt-1">{coupon.description}</p>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary">{coupon.discount_percentage}% OFF</Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="capitalize">
                            {coupon.usage_type}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className={`text-sm ${expired ? 'text-red-600' : 'text-gray-700'}`}>
                              {formatDate(coupon.expires_at)}
                            </span>
                          </div>
                          {expired && <p className="text-xs text-red-600 mt-1">Expired</p>}
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-700 font-medium">
                            {usageCount}{coupon.max_uses ? ` / ${coupon.max_uses}` : ''}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={coupon.is_active && !expired ? "default" : "secondary"}>
                            {coupon.is_active && !expired ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                console.log("[Admin] eye button clicked for coupon:", coupon.code);
                                handleViewCouponUsers(coupon);
                              }}
                              title="View users who used this coupon"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateCoupon(coupon.id, { is_active: !coupon.is_active })}
                              title={coupon.is_active ? "Deactivate" : "Activate"}
                            >
                              {coupon.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              title="Delete coupon"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {coupons.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        No coupons created yet. Click "Create Coupon" to add one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">System Settings</h3>
            <div className="space-y-6">
              <div>
                <Label>Default Free Plan Limit</Label>
                <Input
                  type="number"
                  value={defaultFreePlanLimit}
                  onChange={(e) => setDefaultFreePlanLimit(e.target.value)}
                  className="max-w-xs mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Number of conversions for new free users
                </p>
              </div>

              <div>
                <Label>Conversion Reset Period</Label>
                <Select
                  value={conversionResetPeriod}
                  onValueChange={(value: string) => setConversionResetPeriod(value)}
                >
                  <SelectTrigger className="max-w-xs mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Enable User Registration</Label>
                <Select
                  value={registrationMode}
                  onValueChange={(value: string) => setRegistrationMode(value as any)}
                >
                  <SelectTrigger className="max-w-xs mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                    <SelectItem value="invite-only">Invite Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={async () => {
                    if (!appConfig) return;

                    const enableRegistration = registrationMode !== "disabled";

                    await supabase
                      .from("app_configs")
                      .update({
                        default_free_plan_limit: parseInt(defaultFreePlanLimit || "10", 10),
                        conversion_reset_period: conversionResetPeriod,
                        enable_user_registration: enableRegistration,
                      })
                      .eq("id", appConfig.id);
                  }}
                >
                  Save Settings
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Bulk Actions</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleResetAllConversions}>
                  Reset All Conversions
                </Button>
                <p className="text-sm text-gray-600">
                  Reset conversion counts for all users
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleExportUserData}>
                  Export User Data
                </Button>
                <p className="text-sm text-gray-600">
                  Download CSV of all user data
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="destructive" onClick={handleSuspendInactiveUsers}>
                  Suspend Inactive Users
                </Button>
                <p className="text-sm text-gray-600">
                  Suspend users inactive for 30+ days
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Coupon Users Modal (custom overlay instead of Radix Dialog) */}
      {viewingCouponUsers && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 p-6 relative">
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setViewingCouponUsers(null)}
            >
              ×
            </button>

            <div className="mb-2">
              <h2 className="text-lg font-semibold text-gray-900">
                Users Who Used Coupon: {viewingCouponUsers.code}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {viewingCouponUsers.description || 'View all users who have claimed this coupon'}
              </p>
            </div>

            <div className="mt-4">
              {Array.isArray(viewingCouponUsers.used_by) && viewingCouponUsers.used_by.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600">
                      Total uses: <span className="font-semibold">{viewingCouponUsers.used_by.length}</span>
                    </p>
                    <Badge variant="secondary">
                      {viewingCouponUsers.discount_percentage}% OFF
                    </Badge>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium text-gray-600">#</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-600">User ID</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-600">Claimed Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingCouponUsers.used_by.map((usage: any, index: number) => (
                          <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50">
                            <td className="p-3 text-sm text-gray-900">{index + 1}</td>
                            <td className="p-3 text-sm font-mono text-gray-700">
                              {usage.user_id?.substring(0, 8)}...
                            </td>
                            <td className="p-3 text-sm text-gray-600">
                              {usage.claimed_date ? new Date(usage.claimed_date).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No users have used this coupon yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
