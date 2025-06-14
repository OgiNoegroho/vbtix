"use client";

import React, { useState } from 'react';

export default function InputFixDebugPage() {
  const [values, setValues] = useState({
    text: '',
    email: '',
    password: '',
    textarea: '',
    number: '',
    date: ''
  });

  const handleChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    console.log(`Input changed: ${key} = ${e.target.value}`);
    setValues(prev => ({
      ...prev,
      [key]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          🔧 Input Fix Debug Page
        </h1>
        
        <div className="space-y-6">
          {/* Basic HTML Input Tests */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
              HTML Native Inputs
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Text Input (Native)
              </label>
              <input
                type="text"
                value={values.text}
                onChange={handleChange('text')}
                placeholder="Type here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                style={{ 
                  pointerEvents: 'auto',
                  userSelect: 'auto',
                  cursor: 'text',
                  zIndex: 10 
                }}
              />
              <p className="text-xs text-gray-500 mt-1">Value: {values.text}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Email Input
              </label>
              <input
                type="email"
                value={values.email}
                onChange={handleChange('email')}
                placeholder="email@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ 
                  pointerEvents: 'auto',
                  userSelect: 'auto',
                  cursor: 'text' 
                }}
              />
              <p className="text-xs text-gray-500 mt-1">Value: {values.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Password Input
              </label>
              <input
                type="password"
                value={values.password}
                onChange={handleChange('password')}
                placeholder="Enter password..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ 
                  pointerEvents: 'auto',
                  userSelect: 'auto',
                  cursor: 'text' 
                }}
              />
              <p className="text-xs text-gray-500 mt-1">Length: {values.password.length} chars</p>
            </div>
          </section>

          {/* Textarea Test */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
              Textarea Test
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Textarea
              </label>
              <textarea
                value={values.textarea}
                onChange={handleChange('textarea')}
                placeholder="Type your message here..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                style={{ 
                  pointerEvents: 'auto',
                  userSelect: 'auto',
                  cursor: 'text' 
                }}
              />
              <p className="text-xs text-gray-500 mt-1">Value: {values.textarea}</p>
            </div>
          </section>

          {/* Special Input Types */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
              Special Input Types
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Number Input
              </label>
              <input
                type="number"
                value={values.number}
                onChange={handleChange('number')}
                placeholder="Enter number..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ 
                  pointerEvents: 'auto',
                  userSelect: 'auto',
                  cursor: 'text' 
                }}
              />
              <p className="text-xs text-gray-500 mt-1">Value: {values.number}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Date Input
              </label>
              <input
                type="date"
                value={values.date}
                onChange={handleChange('date')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ 
                  pointerEvents: 'auto',
                  userSelect: 'auto',
                  cursor: 'pointer' 
                }}
              />
              <p className="text-xs text-gray-500 mt-1">Value: {values.date}</p>
            </div>
          </section>

          {/* Click Test Buttons */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
              Interaction Tests
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  console.log('Button clicked!');
                  alert('Button berfungsi!');
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Test Button Click
              </button>
              
              <button
                onClick={() => {
                  const firstInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                  if (firstInput) {
                    firstInput.focus();
                    console.log('Focus programmatically set');
                  }
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Focus First Input
              </button>
            </div>
          </section>

          {/* Debug Info */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
              Debug Info
            </h2>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Current Values:</h3>
              <pre className="text-sm text-gray-600">
                {JSON.stringify(values, null, 2)}
              </pre>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}</p>
              <p><strong>Screen Size:</strong> {typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'N/A'}</p>
              <p><strong>Viewport:</strong> {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
