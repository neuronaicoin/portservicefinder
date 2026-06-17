'use client';

import { useState, useEffect, useCallback } from 'react';

interface Member {
  id: string;
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  port?: string;
  service_type?: string;
  subscription_status?: string;
  created_at?: string;
}

interface Stats {
  total: number;
  activeSubscriptions: number;
  pending: number;
  thisMonth: number;
  lastWeek: number;
  portDistribution: { port: string; count: number }[];
  serviceDistribution: { service: string; count: number }[];
}

interface IndexingResult {
  bing: { success: boolean; message: string };
  google: { success: boolean; message: string };
  yandex: { success: boolean; message: string };
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [portFilter, setPortFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Indexing state
  const [indexing, setIndexing] = useState(false);
  const [indexingResult, setIndexingResult] = useState<{
    totalUrls: number;
    results: IndexingResult;
    submittedAt: string;
  } | null>(null);
  const [indexingError, setIndexingError] = useState('');

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (portFilter !== 'all') params.set('port', portFilter);

      const [membersRes, statsRes] = await Promise.all([
        fetch(`/api/admin/members?${params.toString()}`),
        fetch('/api/admin/stats'),
      ]);

      if (membersRes.status === 401 || statsRes.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      const membersData = await membersRes.json();
      const statsData = await statsRes.json();

      if (membersData.success) {
        setMembers(membersData.members);
      }
      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [search, statusFilter, portFilter]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.status === 401) {
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch {
        setIsAuthenticated(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', password }),
      });

      const data = await res.json();

      if (data.success) {
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (error) {
      setLoginError('Network error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      setIsAuthenticated(false);
      setMembers([]);
      setStats(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleExport = () => {
    window.location.href = '/api/admin/export';
  };

  const handleNotifySearchEngines = async () => {
    setIndexing(true);
    setIndexingError('');
    setIndexingResult(null);

    try {
      const res = await fetch('/api/admin/indexing', {
        method: 'POST',
      });

      const data = await res.json();

      if (data.success) {
        setIndexingResult({
          totalUrls: data.totalUrls,
          results: data.results,
          submittedAt: data.submittedAt,
        });
      } else {
        setIndexingError(data.error || 'Indexing failed');
      }
    } catch (error: any) {
      setIndexingError(error.message || 'Network error');
    } finally {
      setIndexing(false);
    }
  };

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="max-w-md w-full">
          <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700">
            <div className="text-center mb-8">
              <div className="text-4xl mb-2">🔐</div>
              <h1 className="text-2xl font-bold text-white mb-1">PSF Admin Panel</h1>
              <p className="text-slate-400 text-sm">Authorized access only</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder="Enter password"
                  required
                  autoFocus
                />
              </div>

              {loginError && (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
                  ⚠️ {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading || !password}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-semibold py-3 px-4 rounded-lg transition"
              >
                {loginLoading ? 'Authenticating...' : 'Login →'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500">
              5 failed attempts will block access for 30 minutes
            </div>
          </div>
        </div>
      </div>
    );
  }

  const uniquePorts = Array.from(new Set(members.map((m) => m.port).filter(Boolean))).sort();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">PSF Admin</h1>
            <p className="text-xs text-slate-400">PortServiceFinder Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Indexing Section */}
        <div className="bg-gradient-to-r from-amber-900/20 to-amber-800/20 border border-amber-700/50 rounded-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-400 mb-1">
                🚀 Search Engine Indexing
              </h3>
              <p className="text-sm text-slate-300">
                Notify Bing, Google, and Yandex to index all pages immediately.
                Press after writing new blogs or member updates.
              </p>
            </div>
            <button
              onClick={handleNotifySearchEngines}
              disabled={indexing}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-bold px-6 py-3 rounded-lg transition whitespace-nowrap"
            >
              {indexing ? '⏳ Submitting...' : '🚀 Notify Search Engines'}
            </button>
          </div>

          {/* Indexing Result */}
          {indexingResult && (
            <div className="mt-4 bg-slate-800/80 border border-slate-700 rounded-lg p-4">
              <div className="text-sm font-semibold text-amber-400 mb-3">
                ✅ Submitted {indexingResult.totalUrls} URLs
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div
                  className={`p-3 rounded ${
                    indexingResult.results.bing.success
                      ? 'bg-green-900/30 border border-green-700/50'
                      : 'bg-red-900/30 border border-red-700/50'
                  }`}
                >
                  <div className="font-semibold mb-1">
                    {indexingResult.results.bing.success ? '✅' : '❌'} Bing
                  </div>
                  <div className="text-xs text-slate-300">
                    {indexingResult.results.bing.message}
                  </div>
                </div>
                <div
                  className={`p-3 rounded ${
                    indexingResult.results.google.success
                      ? 'bg-green-900/30 border border-green-700/50'
                      : 'bg-red-900/30 border border-red-700/50'
                  }`}
                >
                  <div className="font-semibold mb-1">
                    {indexingResult.results.google.success ? '✅' : '❌'} Google
                  </div>
                  <div className="text-xs text-slate-300">
                    {indexingResult.results.google.message}
                  </div>
                </div>
                <div
                  className={`p-3 rounded ${
                    indexingResult.results.yandex.success
                      ? 'bg-green-900/30 border border-green-700/50'
                      : 'bg-red-900/30 border border-red-700/50'
                  }`}
                >
                  <div className="font-semibold mb-1">
                    {indexingResult.results.yandex.success ? '✅' : '❌'} Yandex
                  </div>
                  <div className="text-xs text-slate-300">
                    {indexingResult.results.yandex.message}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                Submitted at: {new Date(indexingResult.submittedAt).toLocaleString()}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700">
                <a
                  href="https://search.google.com/search-console"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-400 hover:text-amber-300 transition"
                >
                  → Open Google Search Console (manual submit)
                </a>
              </div>
            </div>
          )}

          {indexingError && (
            <div className="mt-4 bg-red-900/30 border border-red-700/50 rounded-lg p-3 text-sm text-red-300">
              ❌ {indexingError}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 sm:p-6">
            <div className="text-slate-400 text-xs sm:text-sm mb-1">Total Members</div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{stats?.total ?? '—'}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 sm:p-6">
            <div className="text-slate-400 text-xs sm:text-sm mb-1">Active Subs</div>
            <div className="text-2xl sm:text-3xl font-bold text-green-400">
              {stats?.activeSubscriptions ?? '—'}
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 sm:p-6">
            <div className="text-slate-400 text-xs sm:text-sm mb-1">This Month</div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-400">
              {stats?.thisMonth ?? '—'}
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 sm:p-6">
            <div className="text-slate-400 text-xs sm:text-sm mb-1">Last 7 Days</div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-400">
              {stats?.lastWeek ?? '—'}
            </div>
          </div>
        </div>

        {/* Distribution Section */}
        {stats && (stats.portDistribution.length > 0 || stats.serviceDistribution.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            {stats.portDistribution.length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">🌍 Top Ports</h3>
                <div className="space-y-2">
                  {stats.portDistribution.slice(0, 5).map((item) => (
                    <div key={item.port} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{item.port}</span>
                      <span className="bg-slate-700 px-2 py-1 rounded text-xs font-mono">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {stats.serviceDistribution.length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">🛠️ Top Services</h3>
                <div className="space-y-2">
                  {stats.serviceDistribution.slice(0, 5).map((item) => (
                    <div key={item.service} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{item.service}</span>
                      <span className="bg-slate-700 px-2 py-1 rounded text-xs font-mono">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Members Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          {/* Header Actions */}
          <div className="p-4 sm:p-6 border-b border-slate-700">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="🔍 Search by company, name, or email..."
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                onClick={fetchData}
                disabled={refreshing}
                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 px-4 py-2 rounded-lg text-sm transition"
              >
                {refreshing ? '🔄 Loading...' : '🔄 Refresh'}
              </button>
              <button
                onClick={handleExport}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 rounded-lg text-sm transition"
              >
                📧 Export CSV
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={portFilter}
                onChange={(e) => setPortFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Ports</option>
                {uniquePorts.map((port) => (
                  <option key={port} value={port}>
                    {port}
                  </option>
                ))}
              </select>

              <div className="ml-auto text-sm text-slate-400 self-center">
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </div>
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto">
            {members.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <div className="text-5xl mb-4">📭</div>
                <div className="text-lg font-medium mb-2">No members yet</div>
                <div className="text-sm">
                  Members will appear here when they register through the website
                </div>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-900/50">
                  <tr className="text-left text-xs text-slate-400 uppercase">
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Contact</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3 hidden md:table-cell">Port</th>
                    <th className="px-4 py-3 hidden md:table-cell">Service</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-700/30 transition">
                      <td className="px-4 py-3 font-medium">
                        {member.company_name || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-300 hidden sm:table-cell">
                        {member.contact_name || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        <a
                          href={`mailto:${member.email}`}
                          className="hover:text-amber-400 transition"
                        >
                          {member.email || '—'}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-slate-300 hidden md:table-cell">
                        {member.port || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-300 hidden md:table-cell">
                        {member.service_type || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            member.subscription_status === 'active'
                              ? 'bg-green-900/50 text-green-400'
                              : member.subscription_status === 'pending'
                              ? 'bg-amber-900/50 text-amber-400'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {member.subscription_status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">
                        {member.created_at
                          ? new Date(member.created_at).toLocaleDateString()
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-500">
          PSF Admin · Session expires in 30 minutes of inactivity
        </div>
      </main>
    </div>
  );
}
