import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Quiz, QuizAttempt } from '../types';
import { FileText, Trash2, Share2, Users, Loader2, Calendar, ExternalLink, Eye, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { trackQuizShared, trackQuizDeleted } from '../services/analytics';

const formatCompletionTime = (seconds?: number): string => {
  if (seconds === undefined || seconds === null) return '–';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
};

export const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<{ [quizId: string]: QuizAttempt[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadQuizzes();
    }
  }, [currentUser]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const loadQuizzes = async () => {
    if (!currentUser) return;

    try {
      const q = query(
        collection(db, 'quizzes'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const quizzesData: Quiz[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        quizzesData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Quiz);
      });
      
      setQuizzes(quizzesData);

      // Load attempts for each quiz
      const attemptsData: { [quizId: string]: QuizAttempt[] } = {};
      for (const quiz of quizzesData) {
        const attemptsQuery = query(
          collection(db, 'attempts'),
          where('quizId', '==', quiz.id),
          orderBy('createdAt', 'desc')
        );
        
        const attemptsSnapshot = await getDocs(attemptsQuery);
        attemptsData[quiz.id] = [];
        
        attemptsSnapshot.forEach((doc) => {
          const data = doc.data();
          attemptsData[quiz.id].push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date()
          } as QuizAttempt);
        });
      }
      
      setAttempts(attemptsData);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz? All attempts will also be deleted.')) {
      return;
    }

    try {
      // Delete all attempts
      const quizAttempts = attempts[quizId] || [];
      for (const attempt of quizAttempts) {
        await deleteDoc(doc(db, 'attempts', attempt.id));
      }

      // Delete the quiz
      await deleteDoc(doc(db, 'quizzes', quizId));
      
      // Track quiz deletion
      trackQuizDeleted(quizId);

      // Reload quizzes
      await loadQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  const handleShareQuiz = async (quizId: string) => {
    const url = `${window.location.origin}/quiz/${quizId}`;
    const quiz = quizzes.find(q => q.id === quizId);
    if (navigator.share) {
      try {
        await navigator.share({
          title: quiz?.title || 'Quiz',
          text: `Take this quiz: ${quiz?.title || 'Quiz'}`,
          url,
        });
        trackQuizShared(quizId, 'native_share');
      } catch (err: any) {
        // User cancelled share - ignore
        if (err?.name !== 'AbortError') {
          navigator.clipboard.writeText(url);
          trackQuizShared(quizId, 'link');
          alert('Quiz link copied to clipboard!');
        }
      }
    } else {
      navigator.clipboard.writeText(url);
      trackQuizShared(quizId, 'link');
      alert('Quiz link copied to clipboard!');
    }
  };

  const toggleMenu = (e: React.MouseEvent, quizId: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === quizId ? null : quizId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">My Quizzes</h1>
          <p className="text-gray-600">Manage your quizzes and view student attempts</p>
        </div>

        {quizzes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Quizzes Yet</h2>
            <p className="text-gray-600 mb-6">Create your first quiz to get started!</p>
            <button
              onClick={() => navigate('/generate')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Quiz
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="p-4 sm:p-6">
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Quiz Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 break-words">
                        {quiz.title}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{quiz.questions.length} questions</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{attempts[quiz.id]?.length || 0} attempts</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{quiz.createdAt ? format(quiz.createdAt, 'MMM d, yyyy') : 'Unknown'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons - Desktop */}
                    <div className="hidden sm:flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/manage/${quiz.id}`)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        title="Manage Quiz"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Manage</span>
                      </button>
                      <button
                        onClick={() => navigate(`/quiz/${quiz.id}`)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        title="Preview Quiz"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => handleShareQuiz(quiz.id)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        title="Share Quiz"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        title="Delete Quiz"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>

                     {/* Action Menu - Mobile */}
                    <div className="sm:hidden flex-shrink-0">
                      <div className="relative">
                        <button
                          onClick={(e) => toggleMenu(e, quiz.id)}
                          className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Actions"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                        {/* Dropdown Menu */}
                        {openMenuId === quiz.id && (
                          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                            <button
                              onClick={() => {
                                navigate(`/manage/${quiz.id}`);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                            >
                              <Eye className="w-5 h-5 text-purple-600" />
                              <span className="text-gray-700 font-medium">Manage Quiz</span>
                            </button>
                            <button
                              onClick={() => {
                                navigate(`/quiz/${quiz.id}`);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                            >
                              <ExternalLink className="w-5 h-5 text-blue-600" />
                              <span className="text-gray-700 font-medium">Preview Quiz</span>
                            </button>
                            <button
                              onClick={() => {
                                handleShareQuiz(quiz.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                            >
                              <Share2 className="w-5 h-5 text-green-600" />
                              <span className="text-gray-700 font-medium">Share Link</span>
                            </button>
                            <div className="border-t border-gray-200 my-1"></div>
                            <button
                              onClick={() => {
                                handleDeleteQuiz(quiz.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-5 h-5 text-red-600" />
                              <span className="text-red-600 font-medium">Delete Quiz</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Attempts Section */}
                  {attempts[quiz.id] && attempts[quiz.id].length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setSelectedQuiz(selectedQuiz === quiz.id ? null : quiz.id)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-3"
                      >
                        {selectedQuiz === quiz.id ? '▼ Hide' : '▶'} Attempts ({attempts[quiz.id].length})
                      </button>

                      {selectedQuiz === quiz.id && (
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 overflow-x-auto">
                          <div className="min-w-full">
                            <div className="grid grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm font-semibold text-gray-600 mb-2 pb-2 border-b border-gray-200">
                              <span>Participant</span>
                              <span>Score</span>
                              <span>Time</span>
                              <span>Date</span>
                            </div>
                            {attempts[quiz.id].map((attempt) => (
                              <div
                                key={attempt.id}
                                className="grid grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-800 py-2 border-b border-gray-100 last:border-0"
                              >
                                <span className="truncate" title={attempt.participantName}>
                                  {attempt.participantName}
                                </span>
                                <span className={`font-semibold ${
                                  attempt.score >= 70 ? 'text-green-600' : 
                                  attempt.score >= 50 ? 'text-yellow-600' : 
                                  'text-red-600'
                                }`}>
                                  {attempt.score}%
                                </span>
                                <span className="text-gray-600">
                                  {formatCompletionTime(attempt.completionTime)}
                                </span>
                                <span className="text-gray-600 truncate">
                                  {attempt.createdAt ? format(attempt.createdAt, 'MMM d, h:mm a') : 'Unknown'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
