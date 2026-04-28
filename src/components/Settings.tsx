import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { aiService } from '../services/ai/aiService';
import { UserSettings, QuestionType, ApiKeys } from '../types';
import { Settings as SettingsIcon, Save, Key, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface TestResult {
  status: 'idle' | 'testing' | 'success' | 'error';
  message: string;
}

export const Settings: React.FC = () => {
  const { currentUser, userData, updateUserSettings } = useAuth();
  
  const [settings, setSettings] = useState<UserSettings>({
    aiModel: 'gemini',
    defaultNumberOfQuestions: 5,
    defaultQuestionType: 'multiple-choice'
  });
  
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: '',
    gemini: '',
    huggingface: '',
    groq: '',
    deepseek: '',
    anthropic: '',
    mistral: ''
  });
  
  const [testResults, setTestResults] = useState<{ [key: string]: TestResult }>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (userData?.settings) {
      setSettings(userData.settings);
    }
    
    // Load API keys from Firestore or localStorage
    if (userData?.apiKeys) {
      setApiKeys({
        openai: userData.apiKeys.openai || '',
        gemini: userData.apiKeys.gemini || '',
        huggingface: userData.apiKeys.huggingface || '',
        groq: userData.apiKeys.groq || '',
        deepseek: userData.apiKeys.deepseek || '',
        anthropic: userData.apiKeys.anthropic || '',
        mistral: userData.apiKeys.mistral || ''
      });
    } else {
      // Fallback to localStorage
      setApiKeys({
        openai: localStorage.getItem('openai_api_key') || '',
        gemini: localStorage.getItem('gemini_api_key') || '',
        huggingface: localStorage.getItem('huggingface_api_key') || '',
        groq: localStorage.getItem('groq_api_key') || '',
        deepseek: localStorage.getItem('deepseek_api_key') || '',
        anthropic: localStorage.getItem('anthropic_api_key') || '',
        mistral: localStorage.getItem('mistral_api_key') || ''
      });
    }
  }, [userData]);

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage('');

    try {
      await updateUserSettings(settings);
      setMessage('Settings saved successfully!');
    } catch (error) {
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveApiKeys = async () => {
    if (!currentUser) return;

    setMessage('');
    setSaving(true);

    try {
      // Save to Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        apiKeys: apiKeys
      });

      // Also save to localStorage as backup
      Object.entries(apiKeys).forEach(([key, value]) => {
        if (value) {
          localStorage.setItem(`${key}_api_key`, value);
        }
      });
      
      setMessage('API keys saved successfully!');
    } catch (error) {
      console.error('Error saving API keys:', error);
      setMessage('Error saving API keys');
    } finally {
      setSaving(false);
    }
  };

  const testApiKey = async (provider: string) => {
    const key = apiKeys[provider as keyof ApiKeys];
    
    if (!key) {
      setTestResults({
        ...testResults,
        [provider]: { status: 'error', message: 'No API key provided' }
      });
      return;
    }

    setTestResults({
      ...testResults,
      [provider]: { status: 'testing', message: 'Testing...' }
    });

    // Temporarily save to localStorage for testing
    localStorage.setItem(`${provider}_api_key`, key);

    const testContent = "The capital of France is Paris. It is known for the Eiffel Tower.";

    try {
      const questions = await aiService.generateQuiz(provider, testContent, 1, 'true-false');
      
      if (questions && questions.length > 0) {
        setTestResults({
          ...testResults,
          [provider]: { 
            status: 'success', 
            message: '✓ API key is valid and working!' 
          }
        });
      } else {
        throw new Error('No questions generated');
      }
    } catch (error: any) {
      let errorMessage = 'API key test failed';
      
      // Provide specific error messages based on common issues
      if (error.message.includes('401') || error.message.includes('authentication') || error.message.includes('unauthorized')) {
        errorMessage = '✗ Invalid API key or authentication failed';
      } else if (error.message.includes('403') || error.message.includes('forbidden')) {
        errorMessage = '✗ API key lacks required permissions';
      } else if (error.message.includes('429') || error.message.includes('rate limit')) {
        errorMessage = '✗ Rate limit exceeded. Try again later';
      } else if (error.message.includes('quota') || error.message.includes('billing')) {
        errorMessage = '✗ No credits or billing issue detected';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = '✗ Network error. Check your connection';
      } else if (error.message) {
        errorMessage = `✗ ${error.message}`;
      }
      
      setTestResults({
        ...testResults,
        [provider]: { status: 'error', message: errorMessage }
      });
    }
  };

  const availableProviders = aiService.getAvailableProviders();

  const providerInfo: { [key: string]: { name: string; url: string } } = {
    openai: { name: 'OpenAI GPT-3.5', url: 'https://platform.openai.com/api-keys' },
    gemini: { name: 'Google Gemini', url: 'https://makersuite.google.com/app/apikey' },
    groq: { name: 'Groq (Llama 3)', url: 'https://console.groq.com/keys' },
    deepseek: { name: 'DeepSeek', url: 'https://platform.deepseek.com/api_keys' },
    anthropic: { name: 'Anthropic Claude', url: 'https://console.anthropic.com/settings/keys' },
    mistral: { name: 'Mistral AI', url: 'https://console.mistral.ai/api-keys' },
    huggingface: { name: 'HuggingFace', url: 'https://huggingface.co/settings/tokens' }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        </div>

        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg ${
            message.includes('Error') ? 'bg-red-50 border border-red-200 text-red-600' : 'bg-green-50 border border-green-200 text-green-600'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-8">
          {/* AI Provider Settings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">AI Provider</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred AI Model
                </label>
                <select
                  value={settings.aiModel}
                  onChange={(e) => setSettings({ ...settings, aiModel: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {availableProviders.map(provider => (
                    <option key={provider} value={provider}>
                      {providerInfo[provider]?.name || provider}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  Choose your preferred AI model for quiz generation
                </p>
              </div>
            </div>
          </div>

          {/* Default Quiz Settings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Default Quiz Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Number of Questions
                </label>
                <input
                  type="number"
                  value={settings.defaultNumberOfQuestions}
                  onChange={(e) => setSettings({ ...settings, defaultNumberOfQuestions: parseInt(e.target.value) })}
                  min="1"
                  max="20"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Question Type
                </label>
                <select
                  value={settings.defaultQuestionType}
                  onChange={(e) => setSettings({ ...settings, defaultQuestionType: e.target.value as QuestionType })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="multiple-choice">Multiple Choice (4 options)</option>
                  <option value="true-false">True/False (2 options)</option>
                  <option value="mixed">Mixed (Both types)</option>
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  Mixed type will generate a combination of multiple choice and true/false questions
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>

          {/* API Keys Configuration */}
          <div className="border-t pt-8">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">API Keys</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Configure your AI provider API keys. These are stored securely in your account and locally in your browser.
            </p>

            <div className="space-y-6">
              {Object.entries(providerInfo).map(([provider, info]) => (
                <div key={provider} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">
                      {info.name}
                    </label>
                    <a 
                      href={info.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Get API Key →
                    </a>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={apiKeys[provider as keyof ApiKeys] || ''}
                      onChange={(e) => setApiKeys({ ...apiKeys, [provider]: e.target.value })}
                      className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Enter ${info.name} API key`}
                    />
                    <button
                      onClick={() => testApiKey(provider)}
                      disabled={!apiKeys[provider as keyof ApiKeys] || testResults[provider]?.status === 'testing'}
                      className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {testResults[provider]?.status === 'testing' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Testing
                        </>
                      ) : (
                        'Test'
                      )}
                    </button>
                  </div>

                  {testResults[provider] && testResults[provider].status !== 'idle' && (
                    <div className={`mt-2 px-3 py-2 rounded text-sm flex items-center gap-2 ${
                      testResults[provider].status === 'success' 
                        ? 'bg-green-50 text-green-700' 
                        : testResults[provider].status === 'error'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-gray-50 text-gray-700'
                    }`}>
                      {testResults[provider].status === 'success' && <CheckCircle2 className="w-4 h-4" />}
                      {testResults[provider].status === 'error' && <XCircle className="w-4 h-4" />}
                      {testResults[provider].message}
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={handleSaveApiKeys}
                disabled={saving}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Key className="w-5 h-5" />
                <span>{saving ? 'Saving...' : 'Save All API Keys'}</span>
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Tips:</strong>
                <ul className="mt-2 ml-4 list-disc space-y-1">
                  <li>Use the "Test" button to verify each API key before saving</li>
                  <li>API keys are stored securely in your account and locally</li>
                  <li>Most providers offer free tiers - check their pricing pages</li>
                  <li>Recommended: Start with Gemini (generous free tier)</li>
                </ul>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
