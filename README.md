# QuizAI - AI-Powered MCQ Quiz Generator

A full-featured web application that uses AI to automatically generate quiz questions from any textual content. Create, share, and track quiz attempts with ease.

## Features

### 🎯 Core Features
- **AI-Powered Quiz Generation**: Transform any text into interactive quizzes
- **Multiple Question Types**: Support for Multiple Choice (4 options), True/False questions, and Mixed (both types)
- **Multiple AI Providers**: Choose between OpenAI, Google Gemini, Groq, DeepSeek, Anthropic Claude, Mistral, or HuggingFace
- **API Key Testing**: Test your API keys before saving to ensure they work correctly
- **Secure Key Storage**: API keys stored both in Firestore and locally for redundancy
- **Shareable Quizzes**: Generate unique public links for each quiz
- **Real-time Scoring**: Instant feedback with detailed results
- **User Dashboard**: Manage all your quizzes and view attempts
- **Attempt Tracking**: See who took your quiz and their scores

### 🔐 Authentication
- Google Sign-In
- Email and Password authentication
- No login required for quiz participants

### ⚙️ Settings
- Configure preferred AI model from 7+ providers
- Set default number of questions
- Choose default question type (MCQ, True/False, or Mixed)
- Manage API keys securely (stored in Firestore and locally)
- Test API keys with one click to verify they work
- Detailed error messages for failed API key tests

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase project (free tier works great!)
- At least one AI provider API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quiz-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Firestore Database
   - Enable Authentication (Email/Password and Google)
   - Copy your Firebase configuration

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

5. **Set up Firestore Security Rules**
   
   Go to Firestore Database → Rules and add:
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

6. **Get AI Provider API Keys**
   
   You need at least one. We support 7 AI providers:
   
   - **Google Gemini** (Recommended - Generous free tier)
     - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
     - Create an API key
     - Add to Settings page or `.env` as `VITE_GEMINI_API_KEY`
   
   - **Groq** (Fast inference, free tier available)
     - Go to [Groq Console](https://console.groq.com/keys)
     - Create an API key
     - Add to Settings page or `.env` as `VITE_GROQ_API_KEY`
   
   - **OpenAI** (GPT-3.5, paid but affordable)
     - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
     - Create an API key
     - Add to Settings page or `.env` as `VITE_OPENAI_API_KEY`
   
   - **DeepSeek** (Cost-effective alternative)
     - Go to [DeepSeek Platform](https://platform.deepseek.com/api_keys)
     - Create an API key
     - Add to Settings page or `.env` as `VITE_DEEPSEEK_API_KEY`
   
   - **Anthropic Claude** (High quality, paid)
     - Go to [Anthropic Console](https://console.anthropic.com/settings/keys)
     - Create an API key
     - Add to Settings page or `.env` as `VITE_ANTHROPIC_API_KEY`
   
   - **Mistral AI** (European alternative)
     - Go to [Mistral Console](https://console.mistral.ai/api-keys)
     - Create an API key
     - Add to Settings page or `.env` as `VITE_MISTRAL_API_KEY`
   
   - **HuggingFace** (Open source models)
     - Go to [HuggingFace Tokens](https://huggingface.co/settings/tokens)
     - Create an access token
     - Add to Settings page or `.env` as `VITE_HUGGINGFACE_API_KEY`

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Build for production**
   ```bash
   npm run build
   ```

## Usage

### Creating a Quiz

1. **Sign In**: Use Google or create an account with email/password
2. **Enter Content**: Paste your study material, notes, or any text
3. **Configure**: Choose number of questions and question type
4. **Generate**: Click "Generate Quiz" and wait for AI to create questions
5. **Share**: Copy the quiz link and share it with others

### Taking a Quiz

1. **Open Quiz Link**: Click on any shared quiz link
2. **Enter Name**: Provide your name (no login required)
3. **Answer Questions**: Select your answers
4. **Submit**: Get instant results with correct answers highlighted

### Managing Quizzes

1. **Dashboard**: View all your created quizzes
2. **View Attempts**: See who took each quiz and their scores
3. **Share**: Copy quiz links to clipboard
4. **Delete**: Remove quizzes you no longer need

### Settings

1. **AI Provider**: Choose from 7 different AI models
2. **Defaults**: Set default number of questions and type (MCQ, True/False, or Mixed)
3. **API Keys**: 
   - Configure your AI provider API keys
   - Test each key with one click
   - Keys are saved to your Firestore account and browser
   - Get detailed error messages if a key doesn't work

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **Routing**: React Router v6
- **Backend**: Firebase (Firestore + Authentication)
- **AI Integration**: OpenAI GPT-3.5, Google Gemini, Groq (Llama 3), DeepSeek, Anthropic Claude, Mistral AI, HuggingFace
- **Icons**: Lucide React
- **Date Formatting**: date-fns

## Architecture

### AI Service Layer
The application uses a pluggable architecture for AI providers:
- **Unified Interface**: All providers implement the same `AIProvider` interface
- **Easy Integration**: Add new AI providers by implementing the interface
- **Graceful Fallbacks**: Handles API errors and malformed responses

### Data Models

**Users**
- id, name, email
- settings (aiModel, defaultNumberOfQuestions, defaultQuestionType)

**Quizzes**
- id, userId, title, content
- questionType, questions[]
- createdAt

**Attempts**
- id, quizId, participantName
- answers[], score
- createdAt

## New Features ✨

### Mixed Question Types
Generate quizzes that combine both Multiple Choice and True/False questions in a single quiz for more variety and engagement.

### API Key Testing
Before saving your API keys, test them with a single click to ensure they work correctly. The system will:
- Generate a test question using the API key
- Provide detailed feedback on success or failure
- Show specific error messages for common issues:
  - Invalid/unauthorized API keys
  - Rate limit exceeded
  - Insufficient credits
  - Network errors
  - Permission issues

### Enhanced API Key Management
- **Dual Storage**: Keys saved both in Firestore (cloud) and localStorage (local backup)
- **Multi-Provider Support**: 7 different AI providers to choose from
- **Easy Configuration**: Set up all keys in one place
- **Direct Links**: Quick access to get API keys from each provider

## Security

- Firebase Authentication for user management
- Firestore security rules to protect data
- API keys encrypted and stored in Firestore
- Local backup of API keys in browser localStorage
- Public quiz access without authentication

## Deployment

### Recommended Platforms (Free Tier Available)

1. **Vercel**
   ```bash
   npm run build
   # Deploy the dist folder
   ```

2. **Netlify**
   ```bash
   npm run build
   # Deploy the dist folder
   ```

3. **Firebase Hosting**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   npm run build
   firebase deploy
   ```

## Environment Variables

All configuration is done via environment variables:
- `VITE_FIREBASE_*`: Firebase configuration
- `VITE_OPENAI_API_KEY`: OpenAI API key (optional)
- `VITE_GEMINI_API_KEY`: Google Gemini API key (optional)
- `VITE_HUGGINGFACE_API_KEY`: HuggingFace API key (optional)

API keys can also be configured in the Settings page and are stored in browser localStorage.

## Troubleshooting

### "Quiz generation failed"
- Check that you've configured at least one AI provider API key
- Verify your API key is valid and has credits
- Check browser console for detailed error messages

### Firebase errors
- Verify all Firebase environment variables are set correctly
- Check Firestore security rules are configured
- Ensure Authentication providers are enabled in Firebase Console

### Build errors
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Update dependencies: `npm update`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using React, Vite, Tailwind CSS, and Firebase
