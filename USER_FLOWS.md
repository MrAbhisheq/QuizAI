# User Flows & Navigation Guide

## Complete Application Flow

### 1. Authentication Flow
```
┌─────────────┐
│   Visitor   │
└──────┬──────┘
       │
       ├──> Sign Up (Email/Password) ──┐
       │                               │
       └──> Sign In (Google)      ────┤
                                       │
                                       ▼
                              ┌────────────────┐
                              │  Authenticated │
                              │      User      │
                              └────────┬───────┘
                                       │
                                       ▼
                              ┌────────────────┐
                              │   Dashboard    │
                              └────────────────┘
```

### 2. Quiz Creation Flow (NEW - Educator Focused)
```
┌──────────────────┐
│  Click Generate  │
│   in Navbar      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Enter Content   │
│  Quiz Settings   │
│  (Title, Type,   │
│   # Questions)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Click "Generate  │
│     Quiz"        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   AI Processes   │
│   (5-10 sec)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│         SUCCESS PAGE (NEW!)              │
│                                          │
│  ✓ Quiz Created Successfully!           │
│  ✓ Show Quiz Details                    │
│  ✓ Copy Shareable Link                  │
│                                          │
│  ┌────────┐  ┌──────────┐  ┌─────────┐ │
│  │  View  │  │ Preview  │  │Dashboard│ │
│  │  Quiz  │  │   Quiz   │  │         │ │
│  └───┬────┘  └────┬─────┘  └────┬────┘ │
└──────┼────────────┼─────────────┼───────┘
       │            │             │
       ▼            ▼             ▼
  Manage Page   Quiz Attempt  Dashboard
```

### 3. Quiz Management Flow (NEW)
```
┌────────────────┐
│   Dashboard    │
└───────┬────────┘
        │
        ├──> Click "Manage" (Eye Icon)
        │
        ▼
┌───────────────────────────────────────────┐
│        QUIZ MANAGEMENT PANEL              │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │        Analytics Cards              │ │
│  │  [Questions] [Attempts] [Avg Score] │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │         Actions                     │ │
│  │  [Enable/Disable] [Share] [Export] │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │      Questions List                 │ │
│  │                                     │ │
│  │  Q1: ................               │ │
│  │      [Edit] [Regenerate]            │ │
│  │                                     │ │
│  │  Q2: ................               │ │
│  │      [Edit] [Regenerate]            │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │      Recent Attempts                │ │
│  │  Name     | Score | Date            │ │
│  │  John Doe | 85%   | Dec 20          │ │
│  │  Jane S.  | 92%   | Dec 20          │ │
│  └─────────────────────────────────────┘ │
└───────────────────────────────────────────┘
```

### 4. Question Edit Flow (NEW)
```
┌──────────────────┐
│  Manage Quiz     │
│  Page            │
└────────┬─────────┘
         │
         ├──────────────────┬─────────────────┐
         │                  │                 │
         ▼                  ▼                 ▼
    Click "Edit"      Click "Regenerate"  View Only
         │                  │
         ▼                  ▼
  ┌─────────────┐    ┌─────────────┐
  │ Edit Mode   │    │ AI Generates│
  │             │    │ New Question│
  │ • Question  │    │ (5-10 sec)  │
  │ • Options   │    └──────┬──────┘
  │ • Correct   │           │
  │   Answer    │           ▼
  │             │    ┌─────────────┐
  │ [Save]      │    │ Auto-Save   │
  │ [Cancel]    │    │ New Question│
  └─────┬───────┘    └──────┬──────┘
        │                   │
        └──────┬────────────┘
               ▼
       ┌──────────────┐
       │   Updated    │
       │   Question   │
       └──────────────┘
```

### 5. Dashboard Overview Flow
```
┌────────────────────────────────────────────┐
│              DASHBOARD                     │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  Quiz Card #1                        │ │
│  │  Title: "React Basics"               │ │
│  │  Questions: 10 | Attempts: 15        │ │
│  │                                      │ │
│  │  [Manage] [Preview] [Share] [Delete]│ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  Quiz Card #2                        │ │
│  │  Title: "JavaScript ES6"             │ │
│  │  Questions: 8 | Attempts: 23         │ │
│  │                                      │ │
│  │  [Manage] [Preview] [Share] [Delete]│ │
│  └──────────────────────────────────────┘ │
│                                            │
│  [+ Create New Quiz]                       │
└────────────────────────────────────────────┘
         │         │         │         │
         │         │         │         │
      Manage    Preview   Share     Delete
         │         │         │         │
         ▼         ▼         ▼         ▼
   Quiz Panel  Quiz Test  Copy Link  Confirm
```

### 6. Export Results Flow (NEW)
```
┌──────────────────┐
│  Manage Quiz     │
│  Page            │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Recent Attempts  │
│ Section          │
│                  │
│ [Export CSV] ◄── Click
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Generate CSV   │
│   File           │
│   (Instant)      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Download File   │
│  quiz_name.csv   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Open in Excel/  │
│  Google Sheets   │
└──────────────────┘
```

### 7. Enable/Disable Quiz Flow (NEW)
```
┌──────────────────┐
│  Quiz Enabled    │
│  (Students can   │
│   access)        │
└────────┬─────────┘
         │
         ▼
    Click Toggle
         │
         ▼
┌──────────────────┐
│  Quiz Disabled   │
│  (Students see   │
│   "Not Available"│
└────────┬─────────┘
         │
         ▼
    Click Toggle
         │
         ▼
┌──────────────────┐
│  Quiz Enabled    │
│  (Active again)  │
└──────────────────┘
```

### 8. Profile Management Flow (NEW)
```
┌──────────────────┐
│  Click Profile   │
│  in Navbar       │
└────────┬─────────┘
         │
         ▼
┌────────────────────────────────────────┐
│          PROFILE PAGE                  │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  Basic Information               │ │
│  │  Name: [        ]                │ │
│  │  Email: educator@example.com     │ │
│  │  [Save Profile]                  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  Change Password                 │ │
│  │  [Change Password] ─────┐        │ │
│  └──────────────────────────│────────┘ │
│                             │          │
│  ┌──────────────────────────▼────────┐ │
│  │  Danger Zone                      │ │
│  │  [Delete Account] ───┐            │ │
│  └──────────────────────│────────────┘ │
└──────────────────────────│──────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Confirm   │
                    │  "DELETE"   │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Account   │
                    │   Deleted   │
                    └─────────────┘
```

### 9. Student Quiz Flow (No Changes)
```
┌──────────────────┐
│  Student Gets    │
│  Quiz Link       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Enter Name      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Take Quiz       │
│  (Answer all     │
│   questions)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Submit Quiz     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  View Results    │
│  (Score, correct │
│   answers)       │
└──────────────────┘
```

## Navigation Map

```
┌─────────────────────────────────────────────────────────┐
│                    NAVBAR (Always visible)              │
│                                                         │
│  [QuizAI Logo] [Generate] [Dashboard] [Settings]      │
│                [Profile] [Sign Out]                     │
└─────────────────────────────────────────────────────────┘
       │            │           │          │        │
       │            │           │          │        │
       ▼            ▼           ▼          ▼        ▼
    Home      Quiz Gen    Dashboard   Settings  Profile
                  │            │          │
                  ▼            ▼          ▼
              Success      Manage      API Keys
               Page         Quiz      Configure
                  │            │
                  ▼            ▼
              View Quiz    Edit Qs
                             Export
                             Toggle
```

## Complete Feature Map

```
QuizAI Application
│
├── Authentication
│   ├── Sign Up (Email/Password)
│   ├── Sign In (Email/Password)
│   └── Sign In (Google)
│
├── Quiz Generation
│   ├── Input Content
│   ├── Configure Settings
│   ├── Generate with AI
│   └── Success Page (NEW)
│       ├── View Quiz
│       ├── Preview Quiz
│       └── Go to Dashboard
│
├── Quiz Management (NEW)
│   ├── Analytics Dashboard
│   │   ├── Total Questions
│   │   ├── Total Attempts
│   │   ├── Average Score
│   │   └── Quiz Status
│   ├── Actions
│   │   ├── Enable/Disable Toggle
│   │   ├── Share Link
│   │   └── Export CSV
│   ├── Question Management
│   │   ├── Edit Manually
│   │   └── Regenerate with AI
│   └── Attempts History
│       └── Export Results
│
├── Dashboard
│   ├── View All Quizzes
│   ├── Quiz Actions
│   │   ├── Manage (NEW)
│   │   ├── Preview
│   │   ├── Share
│   │   └── Delete
│   └── Create New Quiz
│
├── Settings
│   ├── AI Provider Selection (7 options)
│   ├── Default Quiz Settings
│   ├── API Key Management
│   └── Test API Keys
│
├── Profile (NEW)
│   ├── Edit Name
│   ├── View Email
│   ├── Change Password
│   └── Delete Account
│
└── Public Quiz Access
    ├── Enter Name
    ├── Take Quiz
    └── View Results
```

## Key User Journeys

### Journey 1: First-Time Educator
```
1. Sign Up → 2. Go to Settings → 3. Add API Key → 4. Test Key
   ↓
5. Generate First Quiz → 6. Review Success Page → 7. Preview Quiz
   ↓
8. Share with Students → 9. Monitor Dashboard → 10. Export Results
```

### Journey 2: Edit Existing Quiz
```
1. Dashboard → 2. Click "Manage" → 3. View Questions
   ↓
4. Click "Edit" on Question → 5. Modify Text/Options → 6. Save
   OR
4. Click "Regenerate" → 5. AI Creates New → 6. Auto-Save
```

### Journey 3: Close Quiz After Deadline
```
1. Dashboard → 2. Click "Manage" → 3. Toggle "Enabled" to Disabled
   ↓
Students now see: "Quiz Not Available"
   ↓
Can re-enable anytime by toggling back
```

### Journey 4: Grade Students
```
1. Dashboard → 2. Click "Manage" → 3. View Attempts Table
   ↓
4. Check Average Score → 5. Review Individual Scores
   ↓
6. Click "Export CSV" → 7. Open in Excel → 8. Import to Gradebook
```

### Journey 5: Improve Quiz Quality
```
1. Dashboard → 2. Preview Quiz (test yourself)
   ↓
3. Find unclear question → 4. Click "Manage"
   ↓
5. Click "Edit" or "Regenerate" → 6. Update Question
   ↓
7. Quiz automatically updated for future attempts
```

## Page-by-Page Breakdown

### Home/Generate Page
- **Purpose:** Create new quizzes
- **Actions:** Input content, configure, generate
- **Navigation:** Success Page

### Success Page (NEW)
- **Purpose:** Confirm creation, provide options
- **Actions:** View, Preview, Share, Dashboard
- **Navigation:** Manage Page or Dashboard

### Manage Page (NEW)
- **Purpose:** Full quiz control
- **Actions:** Edit, Regenerate, Toggle, Export
- **Navigation:** Back to Dashboard

### Dashboard
- **Purpose:** Overview of all quizzes
- **Actions:** Manage, Preview, Share, Delete
- **Navigation:** Manage Page or Quiz Attempt

### Settings
- **Purpose:** Configure AI and preferences
- **Actions:** Select provider, Test keys, Save
- **Navigation:** None (stays in Settings)

### Profile (NEW)
- **Purpose:** Account management
- **Actions:** Edit profile, Change password, Delete account
- **Navigation:** None (stays in Profile)

### Quiz Attempt (Public)
- **Purpose:** Students take quiz
- **Actions:** Enter name, Answer, Submit, View results
- **Navigation:** None (end of flow)

---

**All flows are now optimized for educators!** 🎓

The new flow ensures:
- ✅ Teachers have full control
- ✅ Easy quiz management
- ✅ Quick access to analytics
- ✅ Simple editing capabilities
- ✅ Efficient grading workflow
