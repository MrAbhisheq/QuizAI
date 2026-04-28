import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Quiz, QuizAttempt, QuizQuestion } from '../types';
import { 
  Eye, Edit, Download, Share2, ToggleLeft, ToggleRight,
  ArrowLeft, Users, Calendar, TrendingUp, Loader2, RefreshCw, FileText, Copy, CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { aiService } from '../services/ai/aiService';
import { toDate } from '../utils/dateHelpers';

const formatCompletionTime = (seconds?: number): string => {
  if (seconds === undefined || seconds === null) return '–';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
};

type TabType = 'questions' | 'attempts';

export const QuizManage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('questions');
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<QuizQuestion | null>(null);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    loadQuizData();
  }, [quizId]);

  const loadQuizData = async () => {
    if (!quizId || !currentUser) return;

    try {
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
      
      if (quizDoc.exists()) {
        const data = quizDoc.data();
        const quizData = { 
          id: quizDoc.id, 
          ...data,
          createdAt: toDate(data.createdAt)
        } as Quiz;
        
        if (quizData.userId !== currentUser.uid) {
          navigate('/dashboard');
          return;
        }
        
        setQuiz(quizData);
        setIsEnabled(quizData.enabled !== false);
        
        // Load attempts
        const attemptsQuery = query(
          collection(db, 'attempts'),
          where('quizId', '==', quizId),
          orderBy('createdAt', 'desc')
        );
        
        const attemptsSnapshot = await getDocs(attemptsQuery);
        const attemptsData: QuizAttempt[] = [];
        
        attemptsSnapshot.forEach((doc) => {
          const data = doc.data();
          attemptsData.push({
            id: doc.id,
            ...data,
            createdAt: toDate(data.createdAt)
          } as QuizAttempt);
        });
        
        setAttempts(attemptsData);
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleQuizStatus = async () => {
    if (!quiz || !quizId) return;

    try {
      const newStatus = !isEnabled;
      await updateDoc(doc(db, 'quizzes', quizId), {
        enabled: newStatus
      });
      setIsEnabled(newStatus);
      alert(`Quiz ${newStatus ? 'enabled' : 'disabled'} successfully!`);
    } catch (error) {
      console.error('Error toggling quiz status:', error);
      alert('Failed to update quiz status');
    }
  };

  const shareQuiz = async () => {
    const url = `${window.location.origin}/quiz/${quizId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: quiz?.title || 'Quiz',
          text: `Take this quiz: ${quiz?.title || 'Quiz'}`,
          url,
        });
      } catch (err: any) {
        // User cancelled share - ignore
        if (err?.name !== 'AbortError') {
          navigator.clipboard.writeText(url);
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
        }
      }
    } else {
      navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const exportToCSV = () => {
    if (!quiz || !attempts.length) return;

    const headers = ['Participant Name', 'Score (%)', 'Date', 'Time'];
    const rows = attempts.map(attempt => [
      attempt.participantName,
      attempt.score.toString(),
      format(attempt.createdAt, 'MMM d, yyyy'),
      format(attempt.createdAt, 'h:mm a')
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    downloadFile(csv, 'text/csv', 'csv');
  };

  const exportToExcel = () => {
    // Export as tab-separated for Excel
    if (!quiz || !attempts.length) return;

    const headers = ['Participant Name', 'Score (%)', 'Date', 'Time'].join('\t');
    const rows = attempts.map(attempt => [
      attempt.participantName,
      attempt.score.toString(),
      format(attempt.createdAt, 'MMM d, yyyy'),
      format(attempt.createdAt, 'h:mm a')
    ].join('\t'));

    const tsv = [headers, ...rows].join('\n');
    downloadFile(tsv, 'application/vnd.ms-excel', 'xls');
  };

  const exportToPDF = () => {
    if (!quiz || !attempts.length) return;
    
    // Create simple HTML for PDF print
    const content = `
      <html>
        <head>
          <title>${quiz.title} - Results</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #4F46E5; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>${quiz.title}</h1>
          <p>Generated on: ${format(new Date(), 'MMMM d, yyyy h:mm a')}</p>
          <p>Total Attempts: ${attempts.length}</p>
          <p>Average Score: ${Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)}%</p>
          
          <table>
            <thead>
              <tr>
                <th>Participant Name</th>
                <th>Score (%)</th>
                <th>Date</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              ${attempts.map(attempt => `
                <tr>
                  <td>${attempt.participantName}</td>
                  <td>${attempt.score}%</td>
                  <td>${format(attempt.createdAt, 'MMM d, yyyy')}</td>
                  <td>${format(attempt.createdAt, 'h:mm a')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const downloadFile = (content: string, type: string, extension: string) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz?.title.replace(/[^a-z0-9]/gi, '_')}_results.${extension}`;
    a.click();
    window.URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const startEditQuestion = (index: number) => {
    if (!quiz) return;
    setEditingQuestionIndex(index);
    setEditedQuestion({ ...quiz.questions[index] });
  };

  const saveEditedQuestion = async () => {
    if (!quiz || editingQuestionIndex === null || !editedQuestion || !quizId) return;

    const updatedQuestions = [...quiz.questions];
    updatedQuestions[editingQuestionIndex] = editedQuestion;

    try {
      await updateDoc(doc(db, 'quizzes', quizId), {
        questions: updatedQuestions
      });

      setQuiz({ ...quiz, questions: updatedQuestions });
      setEditingQuestionIndex(null);
      setEditedQuestion(null);
      alert('Question updated successfully!');
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Failed to update question');
    }
  };

  const regenerateQuestion = async (index: number) => {
    if (!quiz || !userData || !quizId) return;

    setRegeneratingIndex(index);

    try {
      const aiModel = userData.settings.aiModel || 'gemini';
      const questionType = quiz.questions[index].options.length === 2 ? 'true-false' : 'multiple-choice';
      
      const newQuestions = await aiService.generateQuiz(
        aiModel,
        quiz.content,
        1,
        questionType
      );

      if (newQuestions.length > 0) {
        const updatedQuestions = [...quiz.questions];
        updatedQuestions[index] = newQuestions[0];

        await updateDoc(doc(db, 'quizzes', quizId), {
          questions: updatedQuestions
        });

        setQuiz({ ...quiz, questions: updatedQuestions });
        alert('Question regenerated successfully!');
      }
    } catch (error) {
      console.error('Error regenerating question:', error);
      alert('Failed to regenerate question');
    } finally {
      setRegeneratingIndex(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Quiz Not Found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
    : 0;

  const quizUrl = `${window.location.origin}/quiz/${quizId}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </button>
          
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 break-words">{quiz.title}</h1>
                <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {quiz.createdAt ? format(quiz.createdAt, 'MMM d, yyyy') : 'Unknown'}
                  </span>
                  {quiz.difficulty && (
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                    </span>
                  )}
                  {quiz.timeLimit && (
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                      {quiz.timeLimit} min
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={toggleQuizStatus}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
                    isEnabled 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {isEnabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  <span className="hidden sm:inline">{isEnabled ? 'Enabled' : 'Disabled'}</span>
                </button>
                
                <button
                  onClick={shareQuiz}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  {linkCopied ? <CheckCircle className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                  <span className="hidden sm:inline">{linkCopied ? 'Copied!' : 'Share'}</span>
                </button>
                
                {attempts.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      <Download className="w-5 h-5" />
                      <span className="hidden sm:inline">Export</span>
                    </button>
                    
                    {showExportMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={exportToCSV}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Export as CSV
                        </button>
                        <button
                          onClick={exportToExcel}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Export as Excel
                        </button>
                        <button
                          onClick={exportToPDF}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Export as PDF
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quiz URL */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Quiz Link:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={quizUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={shareQuiz}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-2 text-sm"
                  title="Copy link"
                >
                  {linkCopied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm">Total Questions</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">{quiz.questions.length}</p>
              </div>
              <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm">Total Attempts</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">{attempts.length}</p>
              </div>
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm">Average Score</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">{avgScore}%</p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm">Status</p>
                <p className={`text-lg sm:text-xl font-bold ${isEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {isEnabled ? 'Active' : 'Disabled'}
                </p>
              </div>
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('questions')}
                className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base transition-colors ${
                  activeTab === 'questions'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  Questions ({quiz.questions.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('attempts')}
                className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base transition-colors ${
                  activeTab === 'attempts'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  Attempts ({attempts.length})
                </span>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === 'questions' ? (
              <div className="space-y-4">
                {quiz.questions.map((question, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    {editingQuestionIndex === index ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Question {index + 1}
                          </label>
                          <input
                            type="text"
                            value={editedQuestion?.question || ''}
                            onChange={(e) => setEditedQuestion({ ...editedQuestion!, question: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Options
                          </label>
                          {editedQuestion?.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...editedQuestion.options];
                                  newOptions[optIndex] = e.target.value;
                                  setEditedQuestion({ ...editedQuestion, options: newOptions });
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base"
                              />
                              <input
                                type="radio"
                                name={`correct-${index}`}
                                checked={editedQuestion.correctAnswer === option}
                                onChange={() => setEditedQuestion({ ...editedQuestion, correctAnswer: option })}
                                className="w-5 h-5"
                              />
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={saveEditedQuestion}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingQuestionIndex(null);
                              setEditedQuestion(null);
                            }}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                          <p className="font-semibold text-gray-800 flex-1 text-sm sm:text-base break-words">
                            {index + 1}. {question.question}
                          </p>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => startEditQuestion(index)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Question"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => regenerateQuestion(index)}
                              disabled={regeneratingIndex === index}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Regenerate Question"
                            >
                              {regeneratingIndex === index ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <RefreshCw className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-2 sm:p-3 rounded-lg text-sm ${
                                option === question.correctAnswer
                                  ? 'bg-green-100 border border-green-300'
                                  : 'bg-gray-50 border border-gray-200'
                              }`}
                            >
                              <span className="text-gray-800 break-words">{option}</span>
                              {option === question.correctAnswer && (
                                <span className="ml-2 text-green-600 font-semibold text-xs sm:text-sm">✓ Correct</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {attempts.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No attempts yet</p>
                    <p className="text-sm text-gray-500 mt-1">Students who take this quiz will appear here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Score
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                              Completion Time
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                              Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                              Time
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {attempts.map((attempt) => (
                            <tr key={attempt.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-800 break-words">{attempt.participantName}</td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`text-sm font-semibold ${
                                  attempt.score >= 70 ? 'text-green-600' : 
                                  attempt.score >= 50 ? 'text-yellow-600' : 
                                  'text-red-600'
                                }`}>
                                  {attempt.score}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap hidden sm:table-cell">
                                {formatCompletionTime(attempt.completionTime)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap hidden sm:table-cell">
                                {attempt.createdAt ? format(attempt.createdAt, 'MMM d, yyyy') : 'Unknown'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap hidden sm:table-cell">
                                {attempt.createdAt ? format(attempt.createdAt, 'h:mm a') : 'Unknown'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
