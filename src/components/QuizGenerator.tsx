import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { aiService } from '../services/ai/aiService';
import { QuestionType } from '../types';
import { FileText, Sparkles, Loader2, Upload, X, File } from 'lucide-react';
import { parseFile, formatFileSize, ACCEPT_STRING } from '../utils/fileParser';

type InputMode = 'text' | 'file';

export const QuizGenerator: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(
    userData?.settings.defaultNumberOfQuestions || 5
  );
  const [questionType, setQuestionType] = useState<QuestionType>(
    userData?.settings.defaultQuestionType || 'multiple-choice'
  );
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [timeLimit, setTimeLimit] = useState<number>(0); // 0 = no limit
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // File upload state
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [fileParsing, setFileParsing] = useState(false);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setFileError('');
    setFileContent('');
    setFileParsing(true);

    try {
      const text = await parseFile(file);
      if (!text.trim()) {
        throw new Error('The file appears to be empty. Please select a file with content.');
      }
      setFileContent(text);
    } catch (err: any) {
      setFileError(err.message || 'Failed to read file');
      setSelectedFile(null);
      setFileContent('');
    } finally {
      setFileParsing(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileContent('');
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const switchInputMode = (mode: InputMode) => {
    setInputMode(mode);
    setError('');
    if (mode === 'text') {
      removeFile();
    } else {
      setContent('');
    }
  };

  const getActiveContent = (): string => {
    return inputMode === 'file' ? fileContent : content;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('Please sign in to generate quizzes');
      return;
    }

    const activeContent = getActiveContent();

    if (!activeContent.trim()) {
      setError(inputMode === 'file' ? 'Please upload a file with content' : 'Please enter some content');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a quiz title');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const aiModel = userData?.settings.aiModel || 'gemini';
      
      // Generate quiz using AI
      const questions = await aiService.generateQuiz(
        aiModel,
        activeContent,
        numberOfQuestions,
        questionType
      );

      // Save quiz to Firestore
      const quizData = {
        userId: currentUser.uid,
        title,
        content: activeContent,
        questionType,
        difficulty,
        timeLimit: timeLimit > 0 ? timeLimit : undefined,
        questions,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'quizzes'), quizData);
      
      // Navigate to the success page with quiz data
      navigate('/quiz-success', { 
        state: { 
          quiz: { 
            ...quizData, 
            id: docRef.id,
            createdAt: new Date()
          } 
        } 
      });
    } catch (err: any) {
      console.error('Error generating quiz:', err);
      setError(err.message || 'Failed to generate quiz. Please check your AI settings and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Generate Quiz</h1>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiz Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="E.g., Introduction to React"
              required
            />
          </div>

          {/* Input Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Content Source
            </label>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => switchInputMode('text')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  inputMode === 'text'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                Paste Text
              </button>
              <button
                type="button"
                onClick={() => switchInputMode('file')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  inputMode === 'file'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload File
              </button>
            </div>

            {inputMode === 'text' ? (
              /* Text Input */
              <div>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[200px] resize-y"
                    placeholder="Paste your notes, articles, or study material here..."
                    required={inputMode === 'text'}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  The AI will generate questions based on this content
                </p>
              </div>
            ) : (
              /* File Upload */
              <div>
                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium mb-1">
                      Click to upload a file
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports PDF, DOCX, DOC, and TXT files
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPT_STRING}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* File Info */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <File className="w-8 h-8 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove file"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Parsing Status */}
                    {fileParsing && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Extracting text from file...
                      </div>
                    )}

                    {/* Extracted Text Preview */}
                    {fileContent && !fileParsing && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Extracted Content Preview
                        </label>
                        <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 max-h-[200px] overflow-y-auto">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {fileContent.length > 2000
                              ? fileContent.substring(0, 2000) + '...'
                              : fileContent}
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {fileContent.length.toLocaleString()} characters extracted
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* File Error */}
                {fileError && (
                  <div className="mt-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {fileError}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                min="1"
                max="20"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="multiple-choice">Multiple Choice (4 options)</option>
                <option value="true-false">True/False (2 options)</option>
                <option value="mixed">Mixed (Both types)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Limit (Optional)
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
                min="0"
                max="180"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0 for no limit"
              />
              <span className="text-gray-600 whitespace-nowrap">minutes</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Set to 0 for no time limit. Quiz will auto-submit when time expires.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || fileParsing}
            className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Quiz...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Quiz</span>
              </>
            )}
          </button>
        </form>

        {!currentUser && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-center">
              Please <a href="/login" className="font-semibold underline">sign in</a> to generate quizzes
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
