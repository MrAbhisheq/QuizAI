import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Copy, Eye, LayoutDashboard, Share2, ExternalLink } from 'lucide-react';
import { Quiz } from '../types';

export const QuizSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const quiz = location.state?.quiz as Quiz;

  if (!quiz) {
    navigate('/');
    return null;
  }

  const quizUrl = `${window.location.origin}/quiz/${quiz.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(quizUrl);
    alert('Quiz link copied to clipboard!');
  };

  const shareQuiz = () => {
    if (navigator.share) {
      navigator.share({
        title: quiz.title,
        text: `Take this quiz: ${quiz.title}`,
        url: quizUrl,
      });
    } else {
      copyLink();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Created Successfully! 🎉</h1>
          <p className="text-gray-600">Your quiz is ready to share with students</p>
        </div>

        {/* Quiz Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{quiz.title}</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Questions:</span>
              <span className="ml-2 font-semibold text-gray-800">{quiz.questions.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Type:</span>
              <span className="ml-2 font-semibold text-gray-800">
                {quiz.questionType === 'multiple-choice' ? 'Multiple Choice' :
                 quiz.questionType === 'true-false' ? 'True/False' : 'Mixed'}
              </span>
            </div>
          </div>
        </div>

        {/* Share Link */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Share this link with your students:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={quizUrl}
              readOnly
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={copyLink}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
            <button
              onClick={shareQuiz}
              className="px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => navigate(`/manage/${quiz.id}`)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Eye className="w-5 h-5" />
            View Quiz
          </button>
          
          <button
            onClick={() => navigate(`/quiz/${quiz.id}`)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <ExternalLink className="w-5 h-5" />
            Preview
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Next Steps:</strong>
            <ul className="mt-2 ml-4 list-disc space-y-1">
              <li>Share the link with your students</li>
              <li>View quiz details and manage questions</li>
              <li>Track student attempts in Dashboard</li>
              <li>Export results to Excel or PDF</li>
            </ul>
          </p>
        </div>
      </div>
    </div>
  );
};
