# Firestore Quick Fix Guide ⚡

## Error: Quiz Not Saving?

### 🔴 Quick Diagnosis (30 seconds)

Open browser console (F12) and run:
```javascript
debugFirebase()
```

This will show you exactly what's wrong!

---

## 🎯 Most Common Issues & Fixes

### Issue #1: "Missing environment variables"

**Fix:**
1. Create `.env` file in project root (same folder as `package.json`)
2. Add your Firebase config:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```
3. **Restart server:** `Ctrl+C` then `npm run dev`

---

### Issue #2: "The query requires an index"

**Error message:**
```
FirebaseError: The query requires an index. You can create it here: https://console.firebase.google.com/...
```

**Fix:**
1. **Click the link in the error** ← This is the fastest way!
2. Click "Create Index" button
3. Wait 2-5 minutes
4. Refresh page and try again

**Or create manually:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Firestore Database → Indexes tab
4. Click "Create Index"
5. Add these indexes:

**Quizzes Index:**
- Collection: `quizzes`
- Fields: `userId` (Ascending), `createdAt` (Descending)

**Attempts Index:**
- Collection: `attempts`
- Fields: `quizId` (Ascending), `createdAt` (Descending)

---

### Issue #3: "Missing or insufficient permissions"

**Fix:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Firestore Database → Rules tab
3. Replace with:

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

---

### Issue #4: "Not authenticated"

**Fix:**
1. Make sure you're signed in!
2. Click "Sign In" in navbar
3. Create account or sign in with Google
4. Try creating quiz again

---

### Issue #5: "Invalid API key"

**Fix:**
1. Check `.env` file has correct values
2. No quotes around values
3. No spaces at end of lines
4. Get fresh config from Firebase Console:
   - Project Settings → Your apps → Web app
   - Copy the config

---

## 🚀 Complete Setup (5 minutes)

### Step 1: Firebase Console Setup
```
1. Go to console.firebase.google.com
2. Create new project
3. Enable Firestore (test mode)
4. Enable Authentication (Email + Google)
5. Get config from Project Settings
```

### Step 2: Local Setup
```
1. Create .env file
2. Add Firebase config
3. Restart server: npm run dev
4. Sign in to app
5. Try creating quiz
```

### Step 3: Fix Indexes
```
1. Try to create quiz
2. Check console for error
3. Click the index creation link
4. Wait 2-5 minutes
5. Try again
```

---

## 🔍 Debug Checklist

Run this in browser console:

```javascript
// Check environment
checkEnv()

// Check authentication
testAuth()

// Check Firestore connection
testFirestore()

// Full diagnostic
debugFirebase()
```

---

## 📋 Complete Verification

✅ **Before creating quiz:**
- [ ] Firebase project created
- [ ] Firestore enabled
- [ ] Authentication enabled (Email + Google)
- [ ] .env file exists with correct values
- [ ] Server restarted after .env changes
- [ ] User signed in
- [ ] No console errors on page load

✅ **If quiz creation fails:**
- [ ] Check console for errors
- [ ] Run `debugFirebase()` in console
- [ ] Click index creation link if shown
- [ ] Wait for indexes to build
- [ ] Check Firestore rules are published
- [ ] Verify user is authenticated

---

## 🆘 Still Not Working?

### Get exact error:
1. Open DevTools (F12)
2. Go to Console tab
3. Try to create quiz
4. Copy the exact error message
5. Look for red errors

### Common error codes:
- `permission-denied` → Check Firestore rules
- `failed-precondition` → Create indexes
- `unauthenticated` → Sign in first
- `invalid-argument` → Check data format
- `not-found` → Check collection names

### Quick test:
```javascript
// In console:
debugFirebase()
```

This will tell you exactly what's wrong!

---

## 💡 Pro Tips

1. **Always restart server after .env changes!**
   ```bash
   # Stop with Ctrl+C
   npm run dev
   ```

2. **Click the index link in errors**
   - Fastest way to create indexes
   - Auto-fills all settings
   - Just click "Create"

3. **Use test mode first**
   - Start with test mode rules
   - Test everything works
   - Then add security rules

4. **Check Network tab**
   - F12 → Network tab
   - Filter: "firestore"
   - Look for failed requests (red)

5. **Clear cache if weird issues**
   ```
   Ctrl+Shift+Delete
   Clear cache and cookies
   Hard refresh: Ctrl+Shift+R
   ```

---

## 📞 Getting Help

**Before asking for help, run:**
```javascript
debugFirebase()
```

**Then share:**
1. The output from debugFirebase()
2. Exact error from console
3. Screenshot of error
4. What you were trying to do

**Check these docs:**
- `FIRESTORE_SETUP.md` - Detailed setup
- `SETUP.md` - Complete installation
- `README.md` - Full documentation

---

## ✅ Success Indicators

You know it's working when:

1. **Console shows:**
   ```
   ✅ User is authenticated
   ✅ Firestore connection working
   ✅ Write permission working
   ```

2. **In Firebase Console:**
   - Firestore → Data shows `quizzes` collection
   - New quiz document appears
   - All fields are populated

3. **In app:**
   - Success page appears after generation
   - Quiz shows in Dashboard
   - Can open Manage page
   - Can see questions

---

**Need more help?** Run `debugFirebase()` in console and share the output!
