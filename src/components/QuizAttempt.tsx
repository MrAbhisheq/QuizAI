import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Quiz, QuizScore } from '../types';
import { CheckCircle2, XCircle, Loader2, User, ArrowRight, ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import { toDate } from '../utils/dateHelpers';

export const QuizAttempt: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [participantName, setParticipantName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<QuizScore | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  // Timer effect
  useEffect(() => {
    if (!quiz || showNameInput || submitted || !quiz.timeLimit) return;

    // Initialize timer
    if (timeRemaining === null) {
      setTimeRemaining(quiz.timeLimit * 60); // Convert minutes to seconds
    }

    // Countdown
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        
        // Show warning at 1 minute remaining
        if (prev === 60) {
          setShowTimeWarning(true);
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, showNameInput, submitted, timeRemaining]);

  const loadQuiz = async () => {
    if (!quizId) return;

    try {
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
      
      if (quizDoc.exists()) {
        const data = quizDoc.data();
        const quizData = { 
          id: quizDoc.id, 
          ...data,
          createdAt: toDate(data.createdAt)
        } as Quiz;
        
        // Check if quiz is disabled
        if (quizData.enabled === false) {
          setQuiz(null);
          setLoading(false);
          return;
        }
        
        setQuiz(quizData);
        setAnswers(new Array(quizData.questions.length).fill(''));
      } else {
        console.error('Quiz not found');
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    if (participantName.trim()) {
      setShowNameInput(false);
      setQuizStartTime(Date.now());
    }
  };

  const handleAnswerChange = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const goToNextQuestion = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = (): QuizScore => {
    if (!quiz) {
      return {
        totalQuestions: 0,
        attempted: 0,
        correct: 0,
        incorrect: 0,
        notAttempted: 0,
        percentage: 0
      };
    }

    let correct = 0;
    let attempted = 0;
    let incorrect = 0;

    quiz.questions.forEach((q, index) => {
      if (answers[index] && answers[index].trim() !== '') {
        attempted++;
        if (answers[index] === q.correctAnswer) {
          correct++;
        } else {
          incorrect++;
        }
      }
    });

    const notAttempted = quiz.questions.length - attempted;
    const percentage = quiz.questions.length > 0 
      ? Math.round((correct / quiz.questions.length) * 100) 
      : 0;

    return {
      totalQuestions: quiz.questions.length,
      attempted,
      correct,
      incorrect,
      notAttempted,
      percentage
    };
  };

  const handleSubmit = async () => {
    if (!quiz || !quizId) return;

    const quizScore = calculateScore();
    setScore(quizScore);

    // Save attempt to Firestore
    try {
      // Calculate completion time in seconds
      const completionTime = quizStartTime ? Math.round((Date.now() - quizStartTime) / 1000) : undefined;

      const attemptData = {
        quizId,
        participantName,
        answers,
        score: quizScore.percentage,
        completionTime,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'attempts'), attemptData);
      setSubmitted(true);
      setCurrentQuestion(0); // Reset to first question for review
    } catch (error) {
      console.error('Error saving attempt:', error);
    }
  };

  const handleAutoSubmit = () => {
    if (!submitted) {
      handleSubmit();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Quiz Not Available</h2>
          <p className="text-gray-600 mt-2">This quiz may have been disabled, deleted, or the link is invalid.</p>
        </div>
      </div>
    );
  }

  if (showNameInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{quiz.title}</h1>
          <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-6">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              {quiz.questions.length} Questions
            </span>
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
              {quiz.difficulty || 'Medium'}
            </span>
            {quiz.timeLimit && (
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                {quiz.timeLimit} min
              </span>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
                onKeyPress={(e) => e.key === 'Enter' && handleStartQuiz()}
              />
            </div>
          </div>

          {quiz.timeLimit && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <strong>Time Limit:</strong> {quiz.timeLimit} minutes
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Quiz will auto-submit when time expires
              </p>
            </div>
          )}

          <button
            onClick={handleStartQuiz}
            disabled={!participantName.trim()}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>Start Quiz</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (submitted && score) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Score Summary Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full mb-4 ${
                score.percentage >= 70 ? 'bg-green-100' : score.percentage >= 50 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <span className={`text-3xl sm:text-4xl font-bold ${
                  score.percentage >= 70 ? 'text-green-600' : score.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {score.percentage}%
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h2>
              <p className="text-gray-600">Great job, {participantName}!</p>
            </div>

            {/* Detailed Score Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">{score.totalQuestions}</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">Total</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">{score.correct}</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">Correct</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-red-600">{score.incorrect}</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">Incorrect</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-600">{score.notAttempted}</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">Skipped</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Attempted: {score.attempted}/{score.totalQuestions}</span>
                <span>{Math.round((score.attempted / score.totalQuestions) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(score.attempted / score.totalQuestions) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Answers Review */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Review Answers</h3>
            <div className="space-y-4">
              {quiz.questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                const isAttempted = userAnswer && userAnswer.trim() !== '';
                
                return (
                  <div key={index} className={`p-4 rounded-lg border-2 ${
                    !isAttempted ? 'bg-gray-50 border-gray-200' :
                    isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-2 sm:gap-3 mb-3">
                      {!isAttempted ? (
                        <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0 mt-1" />
                      ) : isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-1" />
                      ) : (
                        <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm sm:text-base mb-2 break-words">
                          {index + 1}. {question.question}
                        </p>
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-2 sm:p-3 rounded-lg text-sm ${
                                option === question.correctAnswer
                                  ? 'bg-green-100 border border-green-300'
                                  : option === userAnswer
                                  ? 'bg-red-100 border border-red-300'
                                  : 'bg-white border border-gray-200'
                              }`}
                            >
                              <span className="text-gray-800 break-words">{option}</span>
                              {option === question.correctAnswer && (
                                <span className="ml-2 text-green-600 font-semibold text-xs sm:text-sm">✓ Correct</span>
                              )}
                              {option === userAnswer && option !== question.correctAnswer && (
                                <span className="ml-2 text-red-600 font-semibold text-xs sm:text-sm">✗ Your answer</span>
                              )}
                            </div>
                          ))}
                          {!isAttempted && (
                            <p className="text-sm text-gray-500 italic">Not attempted</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
              >
                Create Your Own Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with Timer and Progress */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">{quiz.title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </p>
            </div>
            
            {quiz.timeLimit && timeRemaining !== null && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeRemaining < 60 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-mono font-bold text-sm sm:text-base">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Time Warning */}
      {showTimeWarning && timeRemaining !== null && timeRemaining < 60 && (
        <div className="bg-red-500 text-white px-4 py-2 text-center text-sm font-medium">
          ⚠️ Less than 1 minute remaining!
        </div>
      )}

      {/* Question Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 w-full max-w-2xl">
          <div className="mb-6">
            <span className="inline-block bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium px-3 py-1 rounded-full mb-3">
              {currentQ.options.length === 2 ? 'True/False' : 'Multiple Choice'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 break-words">
              {currentQ.question}
            </h2>
          </div>

          <div className="space-y-3">
            {currentQ.options.map((option, optIndex) => (
              <label
                key={optIndex}
                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  answers[currentQuestion] === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  value={option}
                  checked={answers[currentQuestion] === option}
                  onChange={() => handleAnswerChange(option)}
                  className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
                />
                <span className="ml-3 text-gray-700 break-words flex-1">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="bg-white border-t sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <button
              onClick={goToPreviousQuestion}
              disabled={currentQuestion === 0}
              className="px-4 sm:px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex-1"></div>

            {currentQuestion < quiz.questions.length - 1 ? (
              <button
                onClick={goToNextQuestion}
                className="px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Submit Quiz</span>
              </button>
            )}
          </div>

          {/* Answer Status */}
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                  index === currentQuestion
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                    : answers[index] && answers[index].trim() !== ''
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
