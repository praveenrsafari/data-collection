# 🚀 Deployment Guide - YSRCP Directory App

## ✅ Configuration Complete

All files are now properly configured for GitHub Pages deployment!

---

## 📝 Configuration Summary

### 1. **vite.config.js**

```javascript
base: "/data-collection/"  ✅
```

This ensures all URLs are prefixed with `/data-collection/`

### 2. **package.json**

```json
"homepage": "https://praveenrsafari.github.io/data-collection"  ✅
"deploy": "gh-pages -d dist"  ✅
```

### 3. **App.jsx Routing**

Routes will automatically use the base path:

- `/` → redirects to `/data-collection/photo-upload`
- `/photo-upload` → becomes `/data-collection/photo-upload`

---

## 🚀 Deploy Commands

### **Quick Deploy (One Command)**

```bash
npm run deploy
```

This will:

1. Build your app (`npm run build` via predeploy)
2. Deploy to GitHub Pages (`gh-pages -d dist`)

---

### **Step-by-Step Deploy**

```bash
# 1. Build the production app
npm run build

# This creates a 'dist' folder with optimized files

# 2. Test locally (optional)
npm run preview
# Visit http://localhost:4173/data-collection/

# 3. Deploy to GitHub Pages
npm run deploy
```

---

## 🌐 Your Live URLs

After deployment, your app will be available at:

**Main URL:**

```
https://praveenrsafari.github.io/data-collection
```

**Photo Upload Page:**

```
https://praveenrsafari.github.io/data-collection/photo-upload
```

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

### ✅ Firebase Configuration

1. **Firestore Rules** (Firebase Console → Firestore Database → Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // For development
    }
  }
}
```

Click **Publish** after updating.

2. **Storage Rules** (Firebase Console → Storage → Rules):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;  // For development
    }
  }
}
```

Click **Publish** after updating.

3. **Firebase Config** (`src/firebase/config.js`):

- Verify all API keys are correct
- Check projectId matches your Firebase project

---

## 🔧 Build Output

After running `npm run build`, you should see:

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── vite.svg
```

The `gh-pages` tool will deploy everything in the `dist` folder.

---

## 🧪 Testing After Deployment

### 1. **Visit Your Site**

```
https://praveenrsafari.github.io/data-collection
```

### 2. **Test Core Features**

- ✅ Page loads without errors
- ✅ Can select Constituency → Mandal → Panchayat
- ✅ Can add persons with photos
- ✅ Can save data to Firebase
- ✅ Can upload standalone photos
- ✅ Can delete persons/photos/documents
- ✅ Data persists after refresh

### 3. **Check Browser Console** (F12)

- Should see: `🎉 All tests passed! Firestore is working correctly.`
- No red errors

### 4. **Verify Firebase Data**

- Firebase Console → Firestore → Data
- Navigate: `constituencies/pileru/mandals/.../persons`
- Should see saved data

---

## 🚨 Troubleshooting

### Issue: "Failed to deploy"

```bash
# Clear cache and rebuild
rm -rf dist node_modules/.vite
npm run build
npm run deploy
```

### Issue: "Page shows 404"

**Wait 2-5 minutes** after first deployment for GitHub Pages to activate.

Then verify:

1. GitHub repo → Settings → Pages
2. Source should be: `gh-pages` branch
3. URL should show: `https://praveenrsafari.github.io/data-collection`

### Issue: "Blank page on deployment"

Check browser console for errors:

- Firebase config might be incorrect
- Base path might be wrong (should be `/data-collection/`)

### Issue: "Firebase errors on deployed site"

1. Check Firestore rules are published
2. Check Storage rules are published
3. Verify Firebase config in `src/firebase/config.js`

---

## 📊 Deployment Status

### Check Deployment Status

1. **GitHub Repo**:

   - Go to: https://github.com/praveenrsafari/data-collection
   - Click: Actions tab
   - See deployment status

2. **GitHub Pages Settings**:
   - Repo → Settings → Pages
   - Check "Your site is live at..."

---

## 🔄 Update Deployment

When you make changes:

```bash
# 1. Make your code changes
# 2. Test locally
npm run dev

# 3. Build and deploy
npm run deploy

# That's it! Changes will be live in 1-2 minutes
```

---

## 📱 Testing on Mobile

After deployment, test on mobile:

```
https://praveenrsafari.github.io/data-collection
```

- Test photo capture using camera
- Test responsive layout
- Test touch interactions
- Test file uploads

---

## 🎯 Quick Commands Reference

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Deploy
npm run deploy       # Build + Deploy to GitHub Pages

# Clean build
rm -rf dist && npm run build
```

---

## ✅ Success Indicators

After successful deployment:

1. ✅ No errors during `npm run deploy`
2. ✅ GitHub Actions shows green checkmark
3. ✅ Site loads at GitHub Pages URL
4. ✅ Firebase connection test passes
5. ✅ Can add/save/delete data
6. ✅ Photos upload successfully

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors (F12)
2. Check Firebase Console for data/rules
3. Check GitHub Actions for deployment logs
4. Verify all checklist items above

---

## 🎉 Summary

Your app is ready to deploy!

**Command to deploy:**

```bash
npm run deploy
```

**Your live URL will be:**

```
https://praveenrsafari.github.io/data-collection
```

Good luck! 🚀
