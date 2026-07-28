"use client";
/**
 * QuantAdv - Quantitative Trading Platform
 * Copyright (C) 2026 John Varghese (J0X)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { updateProfile } from 'firebase/auth';
import { User, Sliders, Key, Bell, Save, AlertTriangle, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { currency, setCurrency } = useAppStore();
  const { theme, setTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile State
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // Notifications State
  const [notifs, setNotifs] = useState({
    trades: true,
    ai: true,
    margin: true,
    system: false
  });

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    setProfileMessage('');
    try {
      await updateProfile(user, { displayName });
      setProfileMessage('Profile updated successfully');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (error: any) {
      setProfileMessage(`Error: ${error.message}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile & Account', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
    { id: 'apis', label: 'Exchange APIs', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-sm text-zinc-500">Manage your account, preferences, and API integrations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="md:w-64 flex-shrink-0">
          <nav className="flex md:flex-col overflow-x-auto md:overflow-visible gap-2 pb-4 md:pb-0 hide-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal
                    ${isActive 
                      ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' 
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'
                    }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="glass p-6 md:p-8 rounded-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                
                {/* 1. Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-8">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><User size={20}/> Profile Settings</h2>
                    
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center overflow-hidden">
                        {user?.photoURL ? (
                          <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl font-bold text-zinc-500">
                            {(user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <button className="btn-secondary text-sm">Change Avatar</button>
                        <p className="text-xs text-zinc-500 mt-2">JPG, GIF or PNG. 1MB max.</p>
                      </div>
                    </div>

                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Display Name</label>
                        <input 
                          type="text" 
                          value={displayName} 
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Email Address</label>
                        <input 
                          type="email" 
                          value={user?.email || ''} 
                          disabled
                          className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-2 text-zinc-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1"><Shield size={12}/> Managed by Firebase Auth</p>
                      </div>
                      
                      <button 
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                        className="btn-primary mt-4 w-full md:w-auto"
                      >
                        {isSavingProfile ? 'Saving...' : <><Save size={16}/> Save Changes</>}
                      </button>
                      
                      {profileMessage && (
                        <p className={`text-sm ${profileMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                          {profileMessage}
                        </p>
                      )}
                    </div>

                    <div className="pt-8 border-t border-white/10 mt-8">
                      <h3 className="text-lg font-semibold text-red-500 mb-2">Danger Zone</h3>
                      <p className="text-sm text-zinc-400 mb-4">Permanently delete your account and all of your data.</p>
                      <button className="px-4 py-2 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors text-sm font-medium">
                        Delete Account
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div className="space-y-8">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Sliders size={20}/> Global Preferences</h2>
                    
                    <div className="space-y-6 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Application Theme</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['light', 'dark', 'system'].map((t) => (
                            <button
                              key={t}
                              onClick={() => setTheme(t)}
                              className={`py-2 px-3 rounded-lg text-sm font-medium capitalize border transition-all ${
                                theme === t 
                                  ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                                  : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Default Base Currency</label>
                        <select 
                          value={currency} 
                          onChange={(e) => setCurrency(e.target.value as any)}
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="USD">USD ($) - US Dollar</option>
                          <option value="EUR">EUR (€) - Euro</option>
                          <option value="GBP">GBP (£) - British Pound</option>
                          <option value="INR">INR (₹) - Indian Rupee</option>
                        </select>
                        <p className="text-xs text-zinc-500 mt-1">Updates global ticker and portfolio values.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Default Chart Style</label>
                        <select className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                          <option value="candle">Candlestick</option>
                          <option value="line">Line</option>
                          <option value="area">Area</option>
                          <option value="heikin">Heikin-Ashi</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. APIs Tab */}
                {activeTab === 'apis' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><Key size={20}/> Exchange API Keys</h2>
                      <p className="text-sm text-zinc-400">Connect external exchange accounts for live trading execution.</p>
                    </div>

                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
                      <Shield className="text-blue-500 mt-0.5 flex-shrink-0" size={18} />
                      <p className="text-xs text-blue-300 leading-relaxed">
                        Your API keys are encrypted at rest using AES-256 and never logged. Ensure you configure your API keys on the exchange side to <strong>restrict withdrawal permissions</strong>. We only require trading and read permissions.
                      </p>
                    </div>

                    <div className="space-y-4 mt-6">
                      {['Binance', 'Alpaca', 'Interactive Brokers'].map((exchange) => (
                        <div key={exchange} className="p-5 border border-white/10 rounded-xl bg-white/5">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-white">{exchange}</h3>
                            <span className="text-xs font-medium px-2 py-1 bg-zinc-800 text-zinc-400 rounded-md">Not Connected</span>
                          </div>
                          <div className="space-y-3">
                            <input 
                              type="password" 
                              placeholder="API Key" 
                              className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                            <input 
                              type="password" 
                              placeholder="Secret Key" 
                              className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                            <button className="btn-secondary text-sm w-full mt-2">Connect {exchange}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><Bell size={20}/> Notification Preferences</h2>
                      <p className="text-sm text-zinc-400">Control how and when you receive alerts.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-white/10 rounded-xl bg-white/5">
                        <div>
                          <h4 className="font-medium text-white mb-1">Trade Executions</h4>
                          <p className="text-xs text-zinc-400">Receive alerts when an algorithmic order is filled.</p>
                        </div>
                        <button 
                          onClick={() => setNotifs({...notifs, trades: !notifs.trades})}
                          className={`w-12 h-6 rounded-full transition-colors relative ${notifs.trades ? 'bg-blue-500' : 'bg-zinc-700'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${notifs.trades ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-white/10 rounded-xl bg-white/5">
                        <div>
                          <h4 className="font-medium text-white mb-1">AI Signal Alerts</h4>
                          <p className="text-xs text-zinc-400">Get notified when models detect a high-probability setup.</p>
                        </div>
                        <button 
                          onClick={() => setNotifs({...notifs, ai: !notifs.ai})}
                          className={`w-12 h-6 rounded-full transition-colors relative ${notifs.ai ? 'bg-blue-500' : 'bg-zinc-700'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${notifs.ai ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-red-500/20 rounded-xl bg-red-500/5">
                        <div>
                          <h4 className="font-medium text-red-400 mb-1 flex items-center gap-2">Margin Call Warnings <AlertTriangle size={14}/></h4>
                          <p className="text-xs text-zinc-400">Critical alerts when margin utilization exceeds 85%.</p>
                        </div>
                        <button 
                          onClick={() => setNotifs({...notifs, margin: !notifs.margin})}
                          className={`w-12 h-6 rounded-full transition-colors relative ${notifs.margin ? 'bg-red-500' : 'bg-zinc-700'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${notifs.margin ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-white/10 rounded-xl bg-white/5">
                        <div>
                          <h4 className="font-medium text-white mb-1">System Updates</h4>
                          <p className="text-xs text-zinc-400">Platform maintenance and feature release notes.</p>
                        </div>
                        <button 
                          onClick={() => setNotifs({...notifs, system: !notifs.system})}
                          className={`w-12 h-6 rounded-full transition-colors relative ${notifs.system ? 'bg-blue-500' : 'bg-zinc-700'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${notifs.system ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
