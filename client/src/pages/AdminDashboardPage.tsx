import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { apiClient } from '../api/client.js';
import {
  ShieldCheck,
  Users,
  Image,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  RefreshCw,
  Clock
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'jobs' | 'payments'>('metrics');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [mRes, uRes, jRes, pRes] = await Promise.all([
        apiClient.get('/admin/metrics'),
        apiClient.get('/admin/users'),
        apiClient.get('/admin/jobs'),
        apiClient.get('/admin/payments')
      ]);

      setMetrics(mRes.data);
      setUsers(uRes.data?.users || []);
      setJobs(jRes.data?.jobs || []);
      setPayments(pRes.data?.payments || []);
    } catch (err) {
      console.error('Failed to load admin telemetry', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Platform Administration
            </h1>
            <Badge variant="danger" className="text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              RESTRICTED
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#AAB3D0]">
            System-wide processing statistics, user subscriptions, and API telemetry
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchAdminData}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh Telemetry
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-2 bg-[#080B1A]">
          <div className="flex items-center justify-between text-xs text-[#707B9E] font-semibold">
            <span>TOTAL USERS</span>
            <Users className="w-4 h-4 text-[#00D9FF]" />
          </div>
          <p className="text-2xl font-black text-white">
            {metrics?.totalUsers ?? '...'}
          </p>
          <span className="text-[11px] text-emerald-400">● Live registered</span>
        </Card>

        <Card className="p-5 space-y-2 bg-[#080B1A]">
          <div className="flex items-center justify-between text-xs text-[#707B9E] font-semibold">
            <span>PROCESSING VOLUME</span>
            <Image className="w-4 h-4 text-[#6C3BFF]" />
          </div>
          <p className="text-2xl font-black text-white">
            {metrics?.totalJobs ?? '...'}
          </p>
          <span className="text-[11px] text-[#AAB3D0]">Total AI Jobs Executed</span>
        </Card>

        <Card className="p-5 space-y-2 bg-[#080B1A]">
          <div className="flex items-center justify-between text-xs text-[#707B9E] font-semibold">
            <span>SUCCESS RATE</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {metrics ? `${((metrics.successfulJobs / metrics.totalJobs) * 100).toFixed(1)}%` : '...'}
          </p>
          <span className="text-[11px] text-emerald-400">
            {metrics?.successfulJobs} passed / {metrics?.failedJobs} failed
          </span>
        </Card>

        <Card className="p-5 space-y-2 bg-[#080B1A]">
          <div className="flex items-center justify-between text-xs text-[#707B9E] font-semibold">
            <span>RAZORPAY REVENUE</span>
            <IndianRupee className="w-4 h-4 text-[#F02BFF]" />
          </div>
          <p className="text-2xl font-black text-white">
            ₹{metrics?.totalRevenue?.toLocaleString('en-IN') ?? '...'}
          </p>
          <span className="text-[11px] text-[#00D9FF]">
            {metrics?.activeSubscriptions} Active Subscriptions
          </span>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-[#1C2450] space-x-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`pb-3 px-3 transition-colors border-b-2 ${
            activeTab === 'metrics'
              ? 'border-[#00D9FF] text-white'
              : 'border-transparent text-[#707B9E] hover:text-white'
          }`}
        >
          Recent Activity
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-3 transition-colors border-b-2 ${
            activeTab === 'users'
              ? 'border-[#00D9FF] text-white'
              : 'border-transparent text-[#707B9E] hover:text-white'
          }`}
        >
          User Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-3 px-3 transition-colors border-b-2 ${
            activeTab === 'jobs'
              ? 'border-[#00D9FF] text-white'
              : 'border-transparent text-[#707B9E] hover:text-white'
          }`}
        >
          Processing Jobs ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 px-3 transition-colors border-b-2 ${
            activeTab === 'payments'
              ? 'border-[#00D9FF] text-white'
              : 'border-transparent text-[#707B9E] hover:text-white'
          }`}
        >
          Payment Transactions ({payments.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'users' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1C2450] bg-[#080B1A]/80 text-[11px] uppercase font-bold text-[#AAB3D0]">
                  <th className="p-4">User</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Credits</th>
                  <th className="p-4">Total Jobs</th>
                  <th className="p-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2450]/60">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="p-4">
                      <p className="font-semibold text-white">{u.displayName}</p>
                      <p className="text-[11px] text-[#707B9E]">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <Badge variant={u.plan === 'business' ? 'purple' : u.plan === 'pro' ? 'cyan' : 'neutral'}>
                        {u.plan.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4 font-bold text-white">{u.credits}</td>
                    <td className="p-4 text-[#AAB3D0]">{u.jobsCount}</td>
                    <td className="p-4 text-[#707B9E]">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'jobs' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1C2450] bg-[#080B1A]/80 text-[11px] uppercase font-bold text-[#AAB3D0]">
                  <th className="p-4">Job ID</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Filename</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2450]/60">
                {jobs.map(j => (
                  <tr key={j.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-mono text-white">{j.id}</td>
                    <td className="p-4 text-[#AAB3D0]">{j.userEmail}</td>
                    <td className="p-4 text-white font-medium">{j.originalFilename}</td>
                    <td className="p-4 text-[#707B9E]">{(j.durationMs / 1000).toFixed(2)}s</td>
                    <td className="p-4">
                      <Badge variant={j.status === 'completed' ? 'success' : 'danger'}>
                        {j.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'payments' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1C2450] bg-[#080B1A]/80 text-[11px] uppercase font-bold text-[#AAB3D0]">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Plan / Pack</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2450]/60">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-mono text-white">{p.orderId}</td>
                    <td className="p-4 text-[#AAB3D0]">{p.userEmail}</td>
                    <td className="p-4 text-white uppercase">{p.plan}</td>
                    <td className="p-4 font-bold text-white">₹{p.amount}</td>
                    <td className="p-4">
                      <Badge variant="success">{p.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Processing Jobs
            </h3>
            <div className="space-y-3">
              {jobs.map(j => (
                <div key={j.id} className="p-3 rounded-xl bg-[#080B1A] border border-[#1C2450] flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-white">{j.originalFilename}</p>
                    <p className="text-[11px] text-[#707B9E]">{j.userEmail}</p>
                  </div>
                  <Badge variant={j.status === 'completed' ? 'success' : 'danger'}>
                    {j.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Payments (Razorpay Verified)
            </h3>
            <div className="space-y-3">
              {payments.map(p => (
                <div key={p.id} className="p-3 rounded-xl bg-[#080B1A] border border-[#1C2450] flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-white">₹{p.amount} • {p.plan?.toUpperCase()}</p>
                    <p className="text-[11px] text-[#707B9E]">{p.userEmail}</p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400">Captured</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
