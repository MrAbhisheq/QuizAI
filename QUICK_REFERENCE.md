# Quick Reference Guide 📚

## New Features At A Glance

### 🧪 API Key Testing

**Location:** Settings → API Keys section

**How to use:**
1. Enter your API key
2. Click "Test" button next to the key field
3. Wait for result (5-10 seconds)
4. See status: ✅ Success or ❌ Error with reason

**Test Results:**
| Icon | Status | Meaning |
|------|--------|---------|
| ⏳ | Testing | Currently validating key |
| ✅ | Success | Key is valid and working |
| ❌ | Error | Key failed with reason |

**Common Errors:**
```
✗ Invalid API key or authentication failed
  → Double-check you copied the entire key

✗ API key lacks required permissions
  → Check API key permissions in provider console

✗ Rate limit exceeded. Try again later
  → Wait 1-5 minutes and test again

✗ No credits or billing issue detected
  → Add credits/billing to your provider account

✗ Network error. Check your connection
  → Verify internet connection
```

### 🤖 New AI Providers

**Total: 7 providers (was 3)**

| Provider | Speed | Cost | Best For |
|----------|-------|------|----------|
| **Gemini** ⭐ | Fast | Free tier | General use, starting out |
| **Groq** ⭐ | Fastest | Free tier | Quick generation, testing |
| OpenAI | Fast | Paid ($0.002/1K tokens) | High quality |
| DeepSeek | Fast | Low cost | Budget-conscious |
| Anthropic | Medium | Paid | Complex content |
| Mistral | Fast | Paid | European users |
| HuggingFace | Slow | Free tier | Open source preference |

⭐ = Recommended for beginners

**How to add:**
1. Go to Settings → API Keys
2. Click link next to provider name
3. Get API key from provider
4. Paste in field
5. Click "Test" to verify
6. Click "Save All API Keys"

### 🎲 Mixed Question Type

**What it is:** Combine Multiple Choice (4 options) + True/False (2 options) in one quiz

**How to use:**
1. Create quiz
2. Select question type: "Mixed (Both types)"
3. Generate quiz
4. AI will mix MCQ and T/F questions

**Example:**
```
Quiz: "Introduction to React" (10 questions)

Questions 1-5: Multiple Choice
- What is JSX?
  A) JavaScript XML ✓
  B) Java Syntax Extension
  C) JSON XML
  D) JavaScript Extension

Questions 6-10: True/False
- React is a JavaScript library. 
  • True ✓
  • False
```

**Benefits:**
- More variety
- Tests different knowledge types
- More engaging for participants
- Better learning assessment

### 💾 Dual API Key Storage

**How it works:**
```
When you save API keys:
  ↓
Saved to Firestore (cloud) ✅
  +
Saved to localStorage (browser) ✅

When you load API keys:
  ↓
Try Firestore first ✅
  ↓ (if not found)
Try localStorage ✅
```

**Benefits:**
- Access keys from any device (Firestore)
- Works offline (localStorage backup)
- Survives browser restarts
- Automatic sync

**Note:** Keys are encrypted in Firestore!

## Feature Comparison

### Before vs After

| Feature | Before | After |
|---------|--------|-------|
| AI Providers | 3 | **7** ✨ |
| Question Types | 2 | **3** ✨ |
| API Key Testing | ❌ | **✅** ✨ |
| Key Storage | localStorage only | **Firestore + localStorage** ✨ |
| Error Messages | Generic | **Detailed with reasons** ✨ |
| Provider Links | Manual search | **Direct links** ✨ |

## Common Workflows

### 🎯 First Time Setup

```
1. Sign up → 2. Go to Settings → 3. Choose AI Provider
    ↓              ↓                    ↓
4. Get API key → 5. Test it → 6. Save → 7. Create Quiz!
```

### 🔑 Adding New API Key

```
Settings → API Keys → Paste key → Test → 
  ✅ Success → Save
  ❌ Failed → Fix issue → Test again
```

### 📝 Creating Mixed Quiz

```
Generate → Enter content → Select "Mixed" type →
Choose number of questions → Generate →
AI creates mix of MCQ + T/F questions
```

### 🧪 Testing All Keys

```
For each provider:
  1. Paste key
  2. Click Test
  3. Wait for result
  4. Fix if needed

Then: Save All API Keys
```

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save Settings | (none - click button) |
| Test API Key | (none - click button) |
| Navigate | Use browser nav |

## Tips & Tricks

### 💡 API Key Best Practices

**DO:**
- ✅ Test keys before saving
- ✅ Start with free providers (Gemini/Groq)
- ✅ Keep keys secure (never share)
- ✅ Save to get cloud backup
- ✅ Try multiple providers

**DON'T:**
- ❌ Share API keys publicly
- ❌ Commit keys to git
- ❌ Use expired keys
- ❌ Ignore test failures
- ❌ Mix up different provider keys

### 🎯 Choosing AI Provider

**For Free Usage:**
```
Gemini (generous free tier)
  or
Groq (fast, free)
```

**For Best Quality:**
```
Anthropic Claude (paid)
  or
OpenAI GPT-3.5 (paid, cheaper)
```

**For Speed:**
```
Groq (fastest)
  or
Gemini (very fast)
```

**For Cost:**
```
DeepSeek (cheapest paid)
  or
Gemini (free tier)
```

### 📚 Question Type Selection

**Multiple Choice:**
- Detailed knowledge testing
- More options = harder
- Good for complex topics

**True/False:**
- Quick assessment
- Fact-based questions
- Easy to answer quickly

**Mixed:**
- Best of both worlds ⭐
- More engaging
- Better variety
- Recommended for most use cases

### 🔍 Troubleshooting

**Test Always Fails:**
1. Check internet connection
2. Verify you copied complete key
3. Check provider account status
4. Try different provider
5. Check browser console

**Key Saves But Doesn't Work:**
1. Test the key first
2. Check test results
3. Verify provider is selected
4. Try generating with different provider

**Can't See Saved Keys:**
1. Refresh page
2. Check if logged in
3. Verify Firestore connection
4. Check browser localStorage

## Quick Links

### Get API Keys
- [Gemini](https://makersuite.google.com/app/apikey) - Free tier
- [Groq](https://console.groq.com/keys) - Free tier
- [OpenAI](https://platform.openai.com/api-keys) - Paid
- [DeepSeek](https://platform.deepseek.com/api_keys) - Paid
- [Anthropic](https://console.anthropic.com/settings/keys) - Paid
- [Mistral](https://console.mistral.ai/api-keys) - Paid
- [HuggingFace](https://huggingface.co/settings/tokens) - Free tier

### Documentation
- [README.md](README.md) - Full documentation
- [SETUP.md](SETUP.md) - Setup guide
- [FEATURES.md](FEATURES.md) - Feature list
- [CHANGELOG.md](CHANGELOG.md) - What's new

### Support
- Check browser console for errors
- Test API keys in Settings
- Review error messages
- Try different AI provider

## Cheat Sheet

### Settings Page Actions
```
┌─────────────────────────────────────┐
│ AI Provider                         │
│ ┌─────────────────────────────────┐ │
│ │ Select: Gemini ▼                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ API Keys                            │
│ ┌──────────────────┬──────────────┐ │
│ │ [API Key]        │ [Test] [✅]  │ │
│ └──────────────────┴──────────────┘ │
│                                     │
│ [Save All API Keys] ← Click this!  │
└─────────────────────────────────────┘
```

### Quiz Generation Flow
```
Content Input
    ↓
Title + Settings
    ↓
Click "Generate Quiz"
    ↓
AI Processing (5-10s)
    ↓
Quiz Created!
    ↓
Auto-redirect to quiz
```

### Test Result Interpretation
```
✅ Green + Checkmark
   → Key works! Save it!

❌ Red + X
   → Read error message
   → Fix issue
   → Test again

⏳ Gray + Spinner
   → Wait (5-10 seconds)
```

## Remember

1. **Always test keys** before saving ✅
2. **Start with free providers** (Gemini/Groq) 🆓
3. **Use Mixed questions** for variety 🎲
4. **Save often** (auto-sync to cloud) 💾
5. **Check Dashboard** for attempts 📊

---

**You're ready to use all the new features!** 🚀

Need more help? Check [SETUP.md](SETUP.md) for detailed guide.
