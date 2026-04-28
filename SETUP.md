# Quick Setup Guide 🚀

This guide will help you get QuizAI up and running in minutes!

## Step 1: Prerequisites ✅

Make sure you have:
- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)
- A [Firebase](https://firebase.google.com/) account (free)
- At least one AI provider API key (recommendations below)

## Step 2: Clone & Install 📦

```bash
# Clone the repository
git clone <repository-url>
cd quiz-ai

# Install dependencies
npm install
```

## Step 3: Firebase Setup 🔥

### 3.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "quiz-ai")
4. Disable Google Analytics (optional)
5. Click "Create project"

### 3.2 Enable Firestore

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode"
4. Select a location
5. Click "Enable"

### 3.3 Set Firestore Security Rules

1. Go to "Firestore Database" → "Rules"
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /quizzes/{quizId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    match /attempts/{attemptId} {
      allow read: if request.auth != null;
      allow create: if true;
    }
  }
}
```

3. Click "Publish"

### 3.4 Enable Authentication

1. Go to "Authentication" → "Get started"
2. Enable "Email/Password"
3. Enable "Google" sign-in:
   - Click on Google
   - Enable
   - Enter project support email
   - Save

### 3.5 Get Firebase Config

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click the web icon (`</>`)
4. Register your app (e.g., "QuizAI Web")
5. Copy the config object

## Step 4: Environment Variables 🔧

1. Create `.env` file in project root:

```bash
cp .env.example .env
```

2. Edit `.env` and add your Firebase config:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## Step 5: Get AI API Key 🤖

Choose at least ONE provider (recommended: Gemini or Groq for free tier):

### Option A: Google Gemini (RECOMMENDED - Free Tier)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API key"
3. Copy the key (starts with `AIza...`)

### Option B: Groq (RECOMMENDED - Fast & Free)
1. Go to [Groq Console](https://console.groq.com/keys)
2. Sign up/Login
3. Create API key
4. Copy the key (starts with `gsk_...`)

### Option C: OpenAI (Paid, $5 minimum)
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up/Login
3. Add billing ($5 minimum)
4. Create API key
5. Copy the key (starts with `sk-...`)

### Other Options:
- **DeepSeek**: [platform.deepseek.com](https://platform.deepseek.com/api_keys)
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com/settings/keys)
- **Mistral**: [console.mistral.ai](https://console.mistral.ai/api-keys)
- **HuggingFace**: [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

**Note:** You can configure API keys later in the app's Settings page!

## Step 6: Run the App 🎉

```bash
# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser!

## Step 7: First Time Setup 👤

1. **Sign Up:**
   - Click "Sign In" in the navbar
   - Choose "Sign up" tab
   - Enter your details or use Google Sign-In

2. **Configure API Key:**
   - Go to Settings (gear icon)
   - Scroll to "API Keys" section
   - Paste your API key
   - Click "Test" to verify it works ✅
   - Click "Save All API Keys"

3. **Set Preferences:**
   - Choose your preferred AI model
   - Set default number of questions
   - Choose default question type
   - Click "Save Settings"

## Step 8: Create Your First Quiz 🎓

1. Click "Generate" in navbar
2. Enter a quiz title
3. Paste your study content
4. Choose number of questions (1-20)
5. Select question type:
   - Multiple Choice (4 options)
   - True/False (2 options)
   - Mixed (both types)
6. Click "Generate Quiz"
7. Wait for AI to create questions (~5-10 seconds)

## Step 9: Share & Take Quiz 📤

After quiz is generated:
1. Copy the quiz URL from browser
2. Or go to Dashboard → Click "Share" icon
3. Send link to anyone (no login required!)
4. They enter their name and take the quiz
5. View all attempts in your Dashboard

## Troubleshooting 🔧

### "Quiz generation failed"
- ✅ Check API key is entered correctly
- ✅ Use "Test" button to verify API key
- ✅ Check you have credits (for paid providers)
- ✅ Try a different AI provider

### "Firebase error"
- ✅ Verify all environment variables are correct
- ✅ Check Firestore rules are published
- ✅ Ensure Authentication is enabled

### "Cannot connect to Firebase"
- ✅ Check internet connection
- ✅ Verify Firebase project is active
- ✅ Check browser console for errors

### API Key Test Fails
Common errors and solutions:

| Error | Solution |
|-------|----------|
| Invalid API key | Double-check you copied the complete key |
| Authentication failed | Generate a new API key |
| Rate limit exceeded | Wait a few minutes and try again |
| No credits | Add billing/credits to your account |
| Network error | Check internet connection |

## Build for Production 🏗️

```bash
# Build the app
npm run build

# The output will be in /dist folder
# Deploy to Vercel, Netlify, or Firebase Hosting
```

### Deploy to Vercel (Recommended)
1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import repository
4. Add environment variables
5. Deploy!

### Deploy to Netlify
1. Push code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Import repository
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Add environment variables
7. Deploy!

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## Tips for Best Results 💡

### Content Quality
- Use clear, well-structured text
- Include key facts and concepts
- Avoid overly complex sentences
- 200-2000 words works best

### Question Generation
- Start with 5 questions to test
- Use "Mixed" type for variety
- Multiple providers may give different results
- Regenerate if questions aren't good enough

### API Key Management
- Test keys before saving
- Gemini/Groq best for free usage
- OpenAI best for quality (paid)
- Keep keys secure (never commit to git)

### Performance
- Gemini: Fast, generous free tier
- Groq: Fastest, free
- OpenAI: High quality, paid
- Try different providers for different use cases

## Next Steps 🎯

✅ Create your first quiz
✅ Share with friends/students
✅ Check Dashboard for attempts
✅ Try different AI providers
✅ Experiment with Mixed questions
✅ Set up custom defaults in Settings

## Need Help? 🆘

- Check [README.md](README.md) for detailed docs
- Review [FEATURES.md](FEATURES.md) for feature list
- Check browser console for errors
- Verify API keys with Test button
- Try different AI providers

## Common Use Cases 📚

**Students:**
```
Content: Your study notes
Questions: 10-15
Type: Mixed
Provider: Gemini (free)
```

**Teachers:**
```
Content: Lecture material
Questions: 5-10
Type: Multiple Choice
Provider: Groq (fast)
```

**Corporate Training:**
```
Content: Training manual
Questions: 20
Type: Multiple Choice
Provider: OpenAI (high quality)
```

---

**You're all set! 🎉 Start generating quizzes with AI!**

For more information, see:
- [README.md](README.md) - Complete documentation
- [FEATURES.md](FEATURES.md) - Feature list
- Firebase Console - Manage your backend
- Settings page - Configure everything

Happy quiz making! 🚀
