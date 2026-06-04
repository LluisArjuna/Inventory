const ERROR_MESSAGES: Record<string, string> = {
  'auth/user-not-found': 'Invalid email or password',
  'auth/wrong-password': 'Invalid email or password',
  'auth/invalid-credential': 'Invalid email or password',
  'auth/invalid-email': 'Invalid email format',
  'auth/too-many-requests': 'Too many attempts. Try again later',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled',
  'auth/email-already-in-use': 'Email already registered',
  'auth/weak-password': 'Password too weak',
};

export const getAuthErrorMessage = (err: unknown): string => {
  const code = (err as { code?: string })?.code;
  return ERROR_MESSAGES[code ?? ''] ?? 'An unexpected error occurred';
};
