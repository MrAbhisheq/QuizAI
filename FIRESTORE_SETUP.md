# Firestore Database Setup Guide 🔥

## Complete Setup Instructions

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name (e.g., "quiz-ai")
4. Click **Continue**
5. **Disable Google Analytics** (optional, or enable if you want)
6. Click **Create project**
7. Wait for project creation
8. Click **Continue**

### Step 2: Enable Firestore Database

1. In Firebase Console, click **"Firestore Database"** in the left menu
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll update security rules later)
4. Select your preferred location (choose closest to your users)
5. Click **Enable**
6. Wait for database creation

### Step 3: Create Firestore Indexes

This is **CRITICAL** - Without indexes, queries will fail!

#### Method 1: Automatic (Recommended)

1. Run your app and try to create a quiz
2. Check browser console for error
3. Firebase will provide a **direct link** to create the index
4. Click the link and it will auto-create the index
5. Wait 2-5 minutes for index to build

#### Method 2: Manual Creation

1. In Firestore Console, go to **"Indexes"** tab
2. Click **"Create Index"**

**Create these 3 indexes:**

**Index 1: Quizzes by User**
- Collection ID: `quizzes`
- Fields to index:
  - Field: `userId` | Order: Ascending
  - Field: `createdAt` | Order: Descending
- Query scope: Collection
- Click **Create**

**Index 2: Attempts by Quiz**
- Collection ID: `attempts`
- Fields to index:
  - Field: `quizId` | Order: Ascending
  - Field: `createdAt` | Order: Descending
- Query scope: Collection
- Click **Create**

**Index 3: Attempts by User (if needed)**
- Collection ID: `attempts`
- Fields to index:
  - Field: `userId` | Order: Ascending
  - Field: `createdAt` | Order: Descending
- Query scope: Collection
- Click **Create**

⏰ **Wait 2-5 minutes for indexes to build!**

### Step 4: Update Security Rules

1. In Firestore Console, go to **"Rules"** tab
2. Replace the content with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      // Users can read and write their own data
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Quizzes collection
    match /quizzes/{quizId} {
      // Anyone can read quizzes (for public quiz links)
      allow read: if true;
      
      // Only authenticated users can create quizzes
      allow create: if request.auth != null;
      
      // Only quiz owner can update or delete
      allow update, delete: if request.auth != null && 
                               request.auth.uid == resource.data.userId;
    }
    
    // Attempts collection
    match /attempts/{attemptId} {
      // Authenticated users can read attempts
      allow read: if request.auth != null;
      
      // Anyone can create attempts (public quiz access)
      allow create: if true;
      
      // No updates or deletes allowed
      allow update, delete: if false;
    }
  }
}
```

3. Click **"Publish"**

### Step 5: Enable Authentication

1. In Firebase Console, click **"Authentication"** in left menu
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Email/Password"**:
   - Click on it
   - Toggle **Enable**
   - Click **Save**
5. Enable **"Google"**:
   - Click on it
   - Toggle **Enable**
   - Select project support email
   - Click **Save**

### Step 6: Get Firebase Configuration

1. In Firebase Console, click the **gear icon** (⚙️) → **Project settings**
2. Scroll down to **"Your apps"** section
3. Click the **Web icon** (`</>`)
4. Register app:
   - App nickname: "QuizAI Web"
   - ✅ Check "Also set up Firebase Hosting" (optional)
   - Click **"Register app"**
5. Copy the `firebaseConfig` object

### Step 7: Update .env File

Create or update `.env` file in your project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Optional: AI Provider API Keys
VITE_GEMINI_API_KEY=your_gemini_key_here
```

Replace with your actual values from Step 6!

### Step 8: Restart Development Server

**IMPORTANT:** Environment variables only load on server start!

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

## Troubleshooting Common Errors

### Error: "Missing or insufficient permissions"

**Cause:** Security rules are too restrictive or not published

**Solution:**
1. Go to Firestore → Rules
2. Verify rules are published (see Step 4)
3. For testing, you can temporarily use:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // ⚠️ TEST MODE ONLY!
    }
  }
}
```
4. Click Publish
5. **Remember to change back to proper rules later!**

### Error: "9 FAILED_PRECONDITION: The query requires an index"

**Cause:** Missing Firestore indexes

**Solution:**
1. Check console error - it has a **direct link**
2. Click the link to auto-create index
3. OR manually create indexes (see Step 3)
4. Wait 2-5 minutes for index to build
5. Refresh page and try again

**Example error:**
```
The query requires an index. You can create it here: 
https://console.firebase.google.com/v1/r/project/.../firestore/indexes?create_composite=...
```
👆 Click this link!

### Error: "Firebase: Error (auth/invalid-api-key)"

**Cause:** Invalid Firebase API key in .env

**Solution:**
1. Check `.env` file exists in project root
2. Verify all VITE_FIREBASE_* values are correct
3. No quotes around values
4. No spaces
5. Restart dev server: `npm run dev`

### Error: "Firebase: Error (auth/configuration-not-found)"

**Cause:** Authentication not enabled

**Solution:**
1. Firebase Console → Authentication
2. Click "Get started"
3. Enable Email/Password and Google (see Step 5)

### Error: Quiz not saving, no error in console

**Possible causes:**

1. **Environment variables not loaded:**
   ```bash
   # Restart server
   npm run dev
   ```

2. **Firestore rules blocking:**
   - Check rules allow creation
   - User must be authenticated

3. **Network issues:**
   - Check browser Network tab
   - Look for failed requests
   - Check internet connection

4. **Missing fields:**
   - Check all required fields are present
   - Verify user is logged in

### Error: "Cannot read properties of undefined (reading 'uid')"

**Cause:** User not authenticated

**Solution:**
1. Make sure you're logged in
2. Check auth state in React DevTools
3. Verify AuthContext is wrapping app
4. Try logging out and in again

## Verification Steps

### 1. Test Authentication

```javascript
// In browser console:
console.log(firebase.auth().currentUser);
// Should show user object, not null
```

### 2. Test Firestore Write

1. Sign in to your app
2. Open browser DevTools → Console
3. Try creating a quiz
4. Check Network tab for Firestore requests
5. Check Firestore Console → Data tab for new documents

### 3. Check Firestore Data

1. Firebase Console → Firestore Database
2. Click "Data" tab
3. You should see collections:
   - `users`
   - `quizzes` (after creating a quiz)
   - `attempts` (after taking a quiz)

### 4. Verify Indexes

1. Firebase Console → Firestore → Indexes tab
2. Status should be "Enabled" (green)
3. If "Building" (yellow), wait a few minutes
4. If "Error" (red), delete and recreate

## Complete .env Example

```env
# ============================================
# FIREBASE CONFIGURATION (REQUIRED)
# ============================================
# Get these from Firebase Console → Project Settings → Your apps
VITE_FIREBASE_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
VITE_FIREBASE_AUTH_DOMAIN=quiz-ai-12345.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=quiz-ai-12345
VITE_FIREBASE_STORAGE_BUCKET=quiz-ai-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456ghi789

# ============================================
# AI PROVIDER API KEYS (OPTIONAL)
# ============================================
# You can also configure these in Settings page

# Google Gemini (Recommended - Free tier)
# Get from: https://makersuite.google.com/app/apikey
VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Groq (Fast & Free)
# Get from: https://console.groq.com/keys
# VITE_GROQ_API_KEY=gsk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# OpenAI (Paid)
# Get from: https://platform.openai.com/api-keys
# VITE_OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# DeepSeek (Paid)
# Get from: https://platform.deepseek.com/api_keys
# VITE_DEEPSEEK_API_KEY=sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Anthropic (Paid)
# Get from: https://console.anthropic.com/settings/keys
# VITE_ANTHROPIC_API_KEY=sk-ant-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Mistral (Paid)
# Get from: https://console.mistral.ai/api-keys
# VITE_MISTRAL_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# HuggingFace (Free tier)
# Get from: https://huggingface.co/settings/tokens
# VITE_HUGGINGFACE_API_KEY=hf_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Testing Checklist

After setup, test these features:

- [ ] Sign up with email/password works
- [ ] Sign in with Google works
- [ ] Create quiz saves to Firestore
- [ ] Quiz appears in Dashboard
- [ ] Can view quiz in Manage page
- [ ] Can edit questions
- [ ] Can export CSV
- [ ] Public quiz link works (no login)
- [ ] Student can submit answers
- [ ] Attempt saves to Firestore
- [ ] Attempt appears in Manage page

## Common Console Errors & Solutions

### 1. `@firebase/firestore: Firestore: Quota exceeded`

**Solution:** Using too much Firestore. Check your queries or upgrade plan.

### 2. `Failed to get document because the client is offline`

**Solution:** Check internet connection. Firestore works offline by default.

### 3. `FirebaseError: Missing or insufficient permissions`

**Solution:**
- Check Firestore rules (Step 4)
- Verify user is authenticated
- Check document ownership

### 4. `The query requires an index`

**Solution:**
- Click the link in error message
- Or create index manually (Step 3)
- Wait for index to build

### 5. `Network request failed`

**Solution:**
- Check internet connection
- Check Firebase project is active
- Verify API key is correct
- Check browser console for blocked requests

## Firestore Collection Structure

After setup, your database should have:

```
quiz-ai (Firestore Database)
│
├── users/
│   └── {userId}/
│       ├── id: string
│       ├── name: string
│       ├── email: string
│       ├── settings: object
│       └── apiKeys: object
│
├── quizzes/
│   └── {quizId}/
│       ├── id: string
│       ├── userId: string
│       ├── title: string
│       ├── content: string
│       ├── questionType: string
│       ├── questions: array
│       ├── enabled: boolean
│       └── createdAt: timestamp
│
└── attempts/
    └── {attemptId}/
        ├── id: string
        ├── quizId: string
        ├── participantName: string
        ├── answers: array
        ├── score: number
        └── createdAt: timestamp
```

## Security Rules Explained

```javascript
// Users collection - users can only access their own data
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}

// Quizzes - public read, authenticated write
match /quizzes/{quizId} {
  allow read: if true;  // Anyone can read (for public links)
  allow create: if request.auth != null;  // Must be logged in
  allow update, delete: if request.auth.uid == resource.data.userId;  // Only owner
}

// Attempts - authenticated read, public write
match /attempts/{attemptId} {
  allow read: if request.auth != null;  // Only logged in users
  allow create: if true;  // Anyone can attempt (no login required)
}
```

## Quick Debug Checklist

If quiz is not saving:

1. ✅ Firestore database created?
2. ✅ Authentication enabled?
3. ✅ .env file exists and has correct values?
4. ✅ Server restarted after .env changes?
5. ✅ User is logged in?
6. ✅ Indexes created and enabled?
7. ✅ Security rules published?
8. ✅ Browser console shows errors?
9. ✅ Network tab shows Firestore requests?
10. ✅ Internet connection working?

## Need More Help?

**Check these:**
1. Browser console (F12) - look for red errors
2. Network tab - check failed requests
3. Firestore Console - verify data is there
4. Authentication tab - verify user is logged in

**Common fixes:**
- Restart dev server
- Clear browser cache
- Sign out and sign in again
- Delete and recreate indexes
- Check .env file path and values

## Success Indicators

✅ You know it's working when:
1. No errors in browser console
2. Quiz appears in Firestore Data tab
3. Quiz appears in Dashboard
4. Can view quiz in Manage page
5. Students can access quiz via link

---

**Still having issues?** Share the exact error message from browser console!
