# Complete Troubleshooting Guide 🔧

## Quick Start Debugging

### Step 1: Open Browser Console
- Press **F12** (or **Cmd+Option+I** on Mac)
- Go to **Console** tab
- Look for **red error messages**

### Step 2: Run Debug Tool
Type in console:
```javascript
debugFirebase()
```

This will show you exactly what's wrong!

---

## Common Errors & Solutions

### 1. Quiz Not Saving to Database

#### Symptoms:
- Click "Generate Quiz" button
- Loading indicator appears
- No success page appears
- Error in console

#### Diagnosis:
```javascript
// Run in console:
debugFirebase()
```

#### Possible Causes & Fixes:

**A. Missing Environment Variables**

Error message:
```
Firebase: Error (auth/invalid-api-key)
```

Solution:
1. Check `.env` file exists in project root
2. Verify all `VITE_FIREBASE_*` variables are set
3. No quotes around values:
   ```env
   ✅ VITE_FIREBASE_API_KEY=AIzaSy...
   ❌ VITE_FIREBASE_API_KEY="AIzaSy..."
   ```
4. **Restart server:**
   ```bash
   # Stop with Ctrl+C
   npm run dev
   ```

**B. Missing Firestore Indexes**

Error message:
```
FirebaseError: 9 FAILED_PRECONDITION: The query requires an index.
You can create it here: https://console.firebase.google.com/...
```

Solution:
1. **Click the link in the error** ← Easiest way!
2. Click "Create Index" button
3. Wait 2-5 minutes for index to build
4. Refresh page and try again

Alternative (manual):
1. Firebase Console → Firestore → Indexes
2. Create index for `quizzes`:
   - Collection: `quizzes`
   - `userId` (Ascending)
   - `createdAt` (Descending)
3. Create index for `attempts`:
   - Collection: `attempts`
   - `quizId` (Ascending)
   - `createdAt` (Descending)

**C. Permission Denied**

Error message:
```
FirebaseError: Missing or insufficient permissions
```

Solution:
1. Check you're signed in (click Profile icon)
2. Go to Firebase Console → Firestore → Rules
3. Publish these rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /quizzes/{quizId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    match /attempts/{attemptId} {
      allow read: if request.auth != null;
      allow create: if true;
    }
  }
}
```
4. Click **Publish**

**D. Not Authenticated**

Error message:
```
Cannot read properties of undefined (reading 'uid')
```

Solution:
1. Click "Sign In" in navbar
2. Create account or sign in
3. Verify you see your name in navbar
4. Try creating quiz again

**E. Network Error**

Error message:
```
Failed to fetch
Network request failed
```

Solution:
1. Check internet connection
2. Check if Firebase project is active
3. Try different network
4. Check browser isn't blocking requests
5. Disable VPN if using one

---

### 2. Authentication Issues

#### Google Sign-In Not Working

Error message:
```
auth/popup-blocked
auth/popup-closed-by-user
```

Solution:
1. Allow popups in browser
2. Try again
3. Or use Email/Password instead

#### Email Sign-In Failed

Error message:
```
auth/user-not-found
auth/wrong-password
```

Solution:
1. Check email spelling
2. Try "Sign up" if new user
3. Use "Forgot password" if needed
4. Or use Google Sign-In

#### Configuration Not Found

Error message:
```
auth/configuration-not-found
```

Solution:
1. Firebase Console → Authentication
2. Click "Get started"
3. Enable Email/Password provider
4. Enable Google provider
5. Save changes

---

### 3. API Key Issues

#### API Key Test Failed

Error in Settings:
```
✗ Invalid API key or authentication failed
```

Solutions:

**For Gemini:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Copy complete key (starts with `AIza`)
4. Paste in Settings
5. Click Test

**For OpenAI:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create new secret key
3. Copy complete key (starts with `sk-`)
4. **Important:** Add billing ($5 minimum)
5. Paste in Settings
6. Click Test

**For Groq:**
1. Go to [Groq Console](https://console.groq.com/keys)
2. Create API key
3. Copy complete key (starts with `gsk_`)
4. Paste in Settings
5. Click Test

#### Rate Limit Exceeded

Error:
```
✗ Rate limit exceeded. Try again later
```

Solution:
1. Wait 5-10 minutes
2. Try different AI provider
3. Check provider's rate limits
4. Consider upgrading plan

#### No Credits

Error:
```
✗ No credits or billing issue detected
```

Solution:
1. Check provider account has credits
2. Add billing if required
3. Verify payment method
4. Use free provider (Gemini/Groq) instead

---

### 4. Quiz Management Issues

#### Can't Edit Questions

Symptoms:
- Click "Edit" but nothing happens
- Changes don't save

Solution:
1. Check console for errors
2. Verify you're the quiz owner
3. Check Firestore permissions
4. Try refreshing page
5. Try different browser

#### Regenerate Not Working

Symptoms:
- Click "Regenerate" but nothing happens
- Loading forever

Solution:
1. Check API key is configured
2. Test API key in Settings
3. Check console for errors
4. Try different AI provider
5. Check internet connection

#### Export CSV Not Working

Symptoms:
- Click "Export" but nothing downloads
- File is empty

Solution:
1. Check browser allows downloads
2. Try different browser
3. Disable popup blockers
4. Check quiz has attempts
5. Try opening CSV in different program

---

### 5. Dashboard Issues

#### Quizzes Not Showing

Symptoms:
- Dashboard is empty
- Just created quiz doesn't appear

Solution:
1. Refresh page
2. Check you're signed in with correct account
3. Run in console:
   ```javascript
   testFirestore()
   ```
4. Check Firestore Console for data
5. Clear browser cache

#### Manage Button Not Working

Symptoms:
- Click "Manage" but nothing happens
- Page doesn't load

Solution:
1. Check browser console for errors
2. Verify quiz ID is valid
3. Check you own the quiz
4. Try refreshing page
5. Check URL is correct

---

### 6. Student Quiz Issues

#### "Quiz Not Available"

Symptoms:
- Student clicks link
- Sees "Quiz not available" message

Solution:
1. Check quiz is enabled (not disabled)
2. Go to Manage → Toggle to "Enabled"
3. Verify quiz wasn't deleted
4. Check quiz link is correct
5. Try opening in incognito mode

#### Can't Submit Quiz

Symptoms:
- Student answers questions
- Submit button doesn't work
- No results shown

Solution:
1. Check all questions are answered
2. Refresh page and try again
3. Check internet connection
4. Try different browser
5. Check Firestore permissions

---

## Browser Console Errors

### Understanding Error Messages

**Red Text = Error** ❌
- Must be fixed
- Application won't work

**Yellow Text = Warning** ⚠️
- Optional to fix
- Application still works

**Blue Text = Info** ℹ️
- Just information
- Ignore unless debugging

### Common Console Errors

**1. "Failed to load resource: net::ERR_BLOCKED_BY_CLIENT"**
- Ad blocker is blocking Firebase
- Disable ad blocker for this site

**2. "Uncaught Error: Firebase: Error"**
- General Firebase error
- Read the full message for details
- Run `debugFirebase()` for diagnosis

**3. "Cannot read properties of null"**
- Data not loaded yet
- Usually harmless
- If persists, refresh page

**4. "Quota exceeded"**
- Used too much Firestore
- Check your usage
- Wait for quota reset
- Or upgrade plan

---

## Environment Setup Issues

### .env File Not Working

Checklist:
- [ ] File is named exactly `.env` (not `.env.txt`)
- [ ] File is in project root (same folder as `package.json`)
- [ ] No quotes around values
- [ ] No spaces at end of lines
- [ ] Server was restarted after creating file

### Verify .env is loaded:
```javascript
// In console:
checkEnv()
```

Should show all variables as "Set"

### Common .env mistakes:

❌ **Wrong:**
```env
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_PROJECT_ID = your-project
```

✅ **Correct:**
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_PROJECT_ID=your-project
```

---

## Network Tab Debugging

### View Firebase Requests

1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter: `firestore` or `googleapis`
4. Try to create quiz
5. Look for **red** entries (failed requests)

### Failed Request?

Click on failed request:
- **Status:** Shows error code
  - 401 = Authentication failed
  - 403 = Permission denied
  - 500 = Server error
- **Response:** Shows error details
- **Headers:** Check authentication token

---

## Performance Issues

### Quiz Generation is Slow

Normal timing:
- 5-10 seconds for 5 questions
- 10-20 seconds for 10 questions
- 15-30 seconds for 15+ questions

If slower:
1. Try different AI provider (Groq is fastest)
2. Check internet speed
3. Reduce number of questions
4. Try during off-peak hours

### Dashboard Loads Slowly

Solutions:
1. Limit quizzes shown
2. Clear browser cache
3. Check internet connection
4. Reduce number of attempts
5. Archive old quizzes

---

## Data Issues

### Lost Data

If quizzes disappeared:
1. Check Firestore Console → Data tab
2. Verify data is there
3. Check signed in with correct account
4. Clear browser cache
5. Hard refresh (Ctrl+Shift+R)

### Duplicate Quizzes

If seeing duplicates:
1. Delete duplicates from Dashboard
2. Check Firestore Console for actual count
3. Clear browser cache
4. Don't click "Generate" multiple times

---

## Testing Firestore Connection

### Quick Test

```javascript
// In console:
testFirestore()
```

Should show:
```
✅ Firestore working
```

### Full Diagnostic

```javascript
// In console:
debugFirebase()
```

This will check:
- ✅ Firebase initialization
- ✅ Authentication status
- ✅ Firestore connection
- ✅ Write permissions
- ✅ Environment variables

---

## Getting Additional Help

### Before Asking for Help

1. Run diagnostics:
   ```javascript
   debugFirebase()
   ```

2. Check console for errors

3. Try in incognito mode

4. Clear cache and try again

### What to Include When Asking

1. **Exact error message** (screenshot)
2. **Output from** `debugFirebase()`
3. **What you were trying to do**
4. **Steps to reproduce**
5. **Browser and OS**

### Useful Commands

```javascript
// Check everything
debugFirebase()

// Check auth only
testAuth()

// Check Firestore only
testFirestore()

// Check environment
checkEnv()

// Get current user
auth.currentUser

// Check Firebase config
import.meta.env.VITE_FIREBASE_PROJECT_ID
```

---

## Prevention Tips

### Before Creating Quiz

1. ✅ Signed in
2. ✅ API key configured and tested
3. ✅ Internet connection stable
4. ✅ No console errors on page load

### Regular Maintenance

1. **Weekly:** Export important results
2. **Monthly:** Check Firestore usage
3. **As needed:** Archive old quizzes
4. **After updates:** Test all features

### Best Practices

1. **Always test with one quiz first**
2. **Preview before sharing**
3. **Keep API keys updated**
4. **Monitor Firestore usage**
5. **Backup important data**

---

## Last Resort Solutions

If nothing works:

### 1. Complete Reset

```bash
# Clear everything and start fresh
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### 2. New Firebase Project

1. Create new Firebase project
2. Set up from scratch
3. Update .env with new config
4. Restart server

### 3. Different Browser

- Try Chrome, Firefox, Safari
- Disable extensions
- Use incognito/private mode

### 4. Check Firebase Status

- Visit [Firebase Status](https://status.firebase.google.com/)
- Check for outages
- Wait if systems are down

---

## Success Checklist

Everything working when:

- [x] Can sign in/out
- [x] Can create quiz
- [x] Quiz appears in Dashboard
- [x] Can view quiz in Manage page
- [x] Can edit questions
- [x] Can export CSV
- [x] Students can access quiz
- [x] Students can submit answers
- [x] Attempts appear in Manage page
- [x] No errors in console

---

**Still stuck?** Run `debugFirebase()` and share the output!
