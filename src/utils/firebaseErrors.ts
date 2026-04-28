/**
 * Maps Firebase error codes to user-friendly messages.
 */

const firebaseErrorMessages: Record<string, string> = {
  // Auth errors
  'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-not-found': 'No account found with this email. Please sign up first.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/invalid-credential': 'Invalid email or password. Please check and try again.',
  'auth/email-not-verified': 'Please verify your email before signing in. Check your inbox for the verification link.',
  'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact the administrator.',
  'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
  'auth/popup-blocked': 'Sign-in popup was blocked by your browser. Please allow popups and try again.',
  'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
  'auth/requires-recent-login': 'This action requires recent authentication. Please sign in again.',
  'auth/credential-already-in-use': 'This credential is already associated with another account.',
  'auth/expired-action-code': 'This link has expired. Please request a new one.',
  'auth/invalid-action-code': 'This link is invalid or has already been used.',
  'auth/missing-email': 'Please enter your email address.',
};

/**
 * Extracts a user-friendly error message from a Firebase error.
 */
export function getFirebaseErrorMessage(error: any): string {
  // Firebase errors have a `code` property
  if (error?.code && typeof error.code === 'string') {
    const friendlyMessage = firebaseErrorMessages[error.code];
    if (friendlyMessage) {
      return friendlyMessage;
    }
  }

  // Fallback: if the message contains a Firebase error code pattern, try to extract it
  if (error?.message && typeof error.message === 'string') {
    const codeMatch = error.message.match(/\(auth\/[\w-]+\)/);
    if (codeMatch) {
      const code = codeMatch[0].replace(/[()]/g, '');
      const friendlyMessage = firebaseErrorMessages[code];
      if (friendlyMessage) {
        return friendlyMessage;
      }
    }
  }

  // Generic fallback
  return 'Something went wrong. Please try again.';
}
