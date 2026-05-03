import { getAnalytics, logEvent, setUserId, setUserProperties, isSupported } from 'firebase/analytics';
import type { Analytics } from 'firebase/analytics';
import app from './firebase';

// Analytics instance - initialized lazily since analytics may not be supported in all environments
let analyticsInstance: Analytics | null = null;

/**
 * Initialize Firebase Analytics.
 * Called once when the app starts. Analytics is only available in browser environments.
 */
export const initAnalytics = async (): Promise<void> => {
  try {
    const supported = await isSupported();
    if (supported) {
      analyticsInstance = getAnalytics(app);
      console.log('[Analytics] Firebase Analytics initialized successfully');
    } else {
      console.warn('[Analytics] Firebase Analytics is not supported in this environment');
    }
  } catch (error) {
    console.error('[Analytics] Failed to initialize Firebase Analytics:', error);
  }
};

/**
 * Get the analytics instance (may be null if not initialized or unsupported)
 */
const getAnalyticsInstance = (): Analytics | null => analyticsInstance;

// ─── User Identification ───────────────────────────────────────────────────

/**
 * Set the user ID for analytics tracking
 */
export const setAnalyticsUserId = (userId: string): void => {
  const analytics = getAnalyticsInstance();
  if (analytics) {
    setUserId(analytics, userId);
  }
};

/**
 * Set user properties for segmentation
 */
export const setAnalyticsUserProperties = (properties: Record<string, string>): void => {
  const analytics = getAnalyticsInstance();
  if (analytics) {
    setUserProperties(analytics, properties);
  }
};

// ─── Page / Screen Tracking ────────────────────────────────────────────────

/**
 * Log a page view event (called on route changes)
 */
export const trackPageView = (pagePath: string, pageTitle?: string): void => {
  const analytics = getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
      page_location: window.location.href,
    });
  }
};

// ─── Authentication Events ─────────────────────────────────────────────────

export const trackSignUp = (method: 'email' | 'google'): void => {
  const analytics = getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, 'sign_up', { method });
  }
};

export const trackLogin = (method: 'email' | 'google'): void => {
  const analytics = getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, 'login', { method });
  }
};

export const trackLogout = (): void => {
  const analytics = getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, 'logout');
  }
};

// ─── Quiz Events ───────────────────────────────────────────────────────────

export const trackQuizGenerated = (params: {
  quizId: string;
  questionType: string;
  numberOfQuestions: number;
  difficulty: string;
  aiModel: string;
  inputMode: string;
}): void => {
  const analytics = getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, 'quiz_generated', {
      quiz_id: params.quizId,
      question_type: params.questionType,
      num_questions: params.numberOfQuestions,
      difficulty: params.difficulty,
      ai_model: params.aiModel,
      input_mode: params.inputMode,
    });
  }
};

export const trackQuizStarted = (params: {
  quizId: string;
  quizTitle: string;
  numberOfQuestions: number;
}): void => {
  const analytics = getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, 'quiz_started', {
      quiz_id: params.quizId,
      quiz_title: params.quizTitle,
      num_questions: params.numberOfQuestions,
    });
  }
};

export const trackQuizCompleted = (params: {
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completionTimeSeconds?: number;
}): void => {
  const analytics = getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, 'quiz_completed', {
      quiz_id: params.quizId,
      quiz_title: params.quizTitle,
      score_percentage: params.score,
      total_questions: params.totalQuestions,
      correct_answers: params.correctAnswers,
      completion_time_seconds: params.completionTimeSeconds,
    });
  }
};

export const trackQuizShared = (quizId: string, method: 'link' | 'native_share'): void => {
  const analytics = getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, 'share', {
      content_type: 'quiz',
      item_id: quizId,
      method,
    });
  }
};

export const trackQuizDeleted = (quizId: string): void => {
  const analytics = getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, 'quiz_deleted', {
      quiz_id: quizId,
    });
  }
};

// ─── File Upload Events ────────────────────────────────────────────────────

export const trackFileUploaded = (fileType: string, fileSizeBytes: number): void => {
  const analytics = getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, 'file_uploaded', {
      file_type: fileType,
      file_size_bytes: fileSizeBytes,
    });
  }
};

// ─── Settings Events ──────────────────────────────────────────────────────

export const trackSettingsUpdated = (aiModel: string): void => {
  const analytics = getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, 'settings_updated', {
      ai_model: aiModel,
    });
  }
};

// ─── Error Events ──────────────────────────────────────────────────────────

export const trackError = (errorType: string, errorMessage: string): void => {
  const analytics = getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, 'app_error', {
      error_type: errorType,
      error_message: errorMessage.substring(0, 100), // Truncate long error messages
    });
  }
};
