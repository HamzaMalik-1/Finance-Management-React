import React from 'react';
import { ShieldCheck, Key, Smartphone, LogOut, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SecurityTab = () => {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 italic uppercase">Access Control</h3>
        <p className="text-sm text-zinc-500">Manage your password and authentication methods</p>
      </section>

      <div className="grid grid-cols-1 gap-4">
        {/* Password Change Action */}
        <button className="flex items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-zinc-700 hover:border-indigo-500 transition-all group">
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 bg-white dark:bg-zinc-700 rounded-2xl shadow-sm text-indigo-600">
              <Key size={22} />
            </div>
            <div>
              <p className="font-bold text-zinc-900 dark:text-zinc-100">Update Password</p>
              <p className="text-xs text-zinc-500">Last changed 3 months ago</p>
            </div>
          </div>
          <ChevronRight className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* 2FA Status */}
        <div className="flex items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-zinc-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white dark:bg-zinc-700 rounded-2xl shadow-sm text-emerald-500">
              <Smartphone size={22} />
            </div>
            <div>
              <p className="font-bold text-zinc-900 dark:text-zinc-100">Two-Factor Authentication</p>
              <p className="text-xs text-emerald-500 font-bold">Enabled & Verified</p>
            </div>
          </div>
          <button className="text-xs font-black uppercase text-indigo-600 hover:underline">Manage</button>
        </div>
      </div>

      {/* Danger Zone */}
      <section className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800">
        <h4 className="text-sm font-black text-rose-500 uppercase tracking-widest mb-6">Danger Zone</h4>
        <div className="p-6 border-2 border-rose-100 dark:border-rose-900/20 bg-rose-50/30 dark:bg-rose-900/5 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-bold text-zinc-900 dark:text-zinc-100 text-center sm:text-left">Delete Account</p>
            <p className="text-xs text-zinc-500 max-w-xs text-center sm:text-left">Once deleted, all your financial history, budgets, and accounts will be permanently erased.</p>
          </div>
          <button className="px-6 py-3 bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all">
            Purge All Data
          </button>
        </div>
      </section>
    </div>
  );
};

export default SecurityTab;