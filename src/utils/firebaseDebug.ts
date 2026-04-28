// Firebase Debug Utility
// Run this in browser console to diagnose issues

import { auth, db } from '../services/firebase';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';

export const debugFirebase = async () => {
  console.log('🔍 Firebase Debug Report\n');
  console.log('═══════════════════════════════════════\n');

  // 1. Check Firebase initialization
  console.log('1️⃣ Firebase Initialization:');
  try {
    console.log('✅ Firebase app initialized');
    console.log('   Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
  } catch (error) {
    console.error('❌ Firebase not initialized:', error);
  }
  console.log('');

  // 2. Check Authentication
  console.log('2️⃣ Authentication Status:');
  const currentUser = auth.currentUser;
  if (currentUser) {
    console.log('✅ User is authenticated');
    console.log('   UID:', currentUser.uid);
    console.log('   Email:', currentUser.email);
    console.log('   Display Name:', currentUser.displayName);
  } else {
    console.log('❌ No user authenticated');
    console.log('   Please sign in first!');
  }
  console.log('');

  // 3. Check Firestore connection
  console.log('3️⃣ Firestore Connection:');
  try {
    const testQuery = query(collection(db, 'quizzes'), limit(1));
    await getDocs(testQuery);
    console.log('✅ Firestore connection working');
  } catch (error: any) {
    console.error('❌ Firestore connection error:');
    console.error('   Error:', error.message);
    if (error.code) {
      console.error('   Code:', error.code);
    }
  }
  console.log('');

  // 4. Test Write Permission
  console.log('4️⃣ Write Permission Test:');
  if (currentUser) {
    try {
      const testData = {
        test: true,
        userId: currentUser.uid,
        createdAt: new Date(),
        timestamp: Date.now()
      };
      
      await addDoc(collection(db, 'test'), testData);
      console.log('✅ Write permission working');
      console.log('   Test document created successfully');
    } catch (error: any) {
      console.error('❌ Write permission failed:');
      console.error('   Error:', error.message);
      console.error('   Code:', error.code);
      
      if (error.code === 'permission-denied') {
        console.error('\n   💡 Solution: Check Firestore security rules');
      } else if (error.code === 'failed-precondition') {
        console.error('\n   💡 Solution: Create required indexes');
        console.error('   Click the link in the error above!');
      }
    }
  } else {
    console.log('⚠️  Cannot test - user not authenticated');
  }
  console.log('');

  // 5. Check Environment Variables
  console.log('5️⃣ Environment Variables:');
  const envVars = {
    'VITE_FIREBASE_API_KEY': import.meta.env.VITE_FIREBASE_API_KEY,
    'VITE_FIREBASE_AUTH_DOMAIN': import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    'VITE_FIREBASE_PROJECT_ID': import.meta.env.VITE_FIREBASE_PROJECT_ID,
    'VITE_FIREBASE_STORAGE_BUCKET': import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    'VITE_FIREBASE_MESSAGING_SENDER_ID': import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    'VITE_FIREBASE_APP_ID': import.meta.env.VITE_FIREBASE_APP_ID,
  };

  Object.entries(envVars).forEach(([key, value]) => {
    if (value && value !== 'demo-api-key' && value !== 'demo-project') {
      console.log(`✅ ${key}: Set`);
    } else {
      console.log(`❌ ${key}: Not set or using demo values`);
    }
  });
  console.log('');

  // 6. Summary
  console.log('═══════════════════════════════════════\n');
  console.log('📋 Summary:');
  
  const issues: string[] = [];
  
  if (!currentUser) {
    issues.push('User not authenticated');
  }
  
  if (import.meta.env.VITE_FIREBASE_PROJECT_ID === 'demo-project') {
    issues.push('Using demo Firebase config');
  }
  
  if (issues.length === 0) {
    console.log('✅ No obvious issues detected');
    console.log('\nIf you still have problems:');
    console.log('1. Check Firestore indexes are created');
    console.log('2. Check security rules are published');
    console.log('3. Restart dev server (npm run dev)');
  } else {
    console.log('❌ Issues found:');
    issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
    console.log('\n📖 See FIRESTORE_SETUP.md for solutions');
  }
  
  console.log('\n═══════════════════════════════════════');
};

// Also export individual test functions
export const testAuth = () => {
  const user = auth.currentUser;
  if (user) {
    console.log('✅ Authenticated as:', user.email);
    return true;
  } else {
    console.log('❌ Not authenticated');
    return false;
  }
};

export const testFirestore = async () => {
  try {
    const testQuery = query(collection(db, 'quizzes'), limit(1));
    await getDocs(testQuery);
    console.log('✅ Firestore working');
    return true;
  } catch (error: any) {
    console.error('❌ Firestore error:', error.message);
    return false;
  }
};

export const checkEnv = () => {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];
  
  const missing: string[] = [];
  required.forEach(key => {
    const value = import.meta.env[key];
    if (!value || value.includes('demo')) {
      missing.push(key);
    }
  });
  
  if (missing.length === 0) {
    console.log('✅ All environment variables set');
    return true;
  } else {
    console.log('❌ Missing environment variables:');
    missing.forEach(key => console.log(`   - ${key}`));
    return false;
  }
};

// Make available in browser console
if (typeof window !== 'undefined') {
  (window as any).debugFirebase = debugFirebase;
  (window as any).testAuth = testAuth;
  (window as any).testFirestore = testFirestore;
  (window as any).checkEnv = checkEnv;
  
  console.log('🔧 Firebase Debug Tools Loaded!');
  console.log('Run in console:');
  console.log('  debugFirebase()  - Full diagnostic');
  console.log('  testAuth()       - Test authentication');
  console.log('  testFirestore()  - Test Firestore');
  console.log('  checkEnv()       - Check env variables');
}
