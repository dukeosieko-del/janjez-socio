'use client';

import { useState } from 'react';

export default function DemoModePage() {
  const [demoMode, setDemoMode] = useState(true);
  const [demoBalance, setDemoBalance] = useState(10000);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Demo Mode</h1>
        <p className="text-gray-600 mt-2">Test your panel functionality without using real credits</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900">Demo Mode Status</h3>
            <p className="text-sm text-blue-700">{demoMode ? 'Active' : 'Inactive'}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Demo Balance</h3>
          <p className="text-3xl font-bold text-green-600">KES {demoBalance.toLocaleString()}</p>
          <button
            onClick={() => setDemoBalance(demoBalance + 1000)}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add Demo Funds
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Demo Orders</h3>
          <p className="text-gray-600">All orders placed in demo mode use virtual credits</p>
          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            <li>• Orders are simulated</li>
            <li>• No real charges applied</li>
            <li>• Status updates are simulated</li>
            <li>• Perfect for testing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
