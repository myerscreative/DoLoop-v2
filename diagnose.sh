#!/bin/bash

# Doloop Diagnostic Script
# Run this to check if your environment is ready for iOS development

echo "🔍 Doloop Environment Diagnostics"
echo "=================================="
echo ""

# Check Node.js
echo "📦 Node.js:"
if command -v node &> /dev/null; then
    echo "  ✅ $(node --version)"
else
    echo "  ❌ Node.js not found"
fi
echo ""

# Check npm
echo "📦 npm:"
if command -v npm &> /dev/null; then
    echo "  ✅ $(npm --version)"
else
    echo "  ❌ npm not found"
fi
echo ""

# Check Expo CLI
echo "📦 Expo CLI:"
if command -v npx expo &> /dev/null; then
    echo "  ✅ Available via npx"
else
    echo "  ⚠️  Not found (will be installed by npx)"
fi
echo ""

# Check Xcode
echo "🛠️  Xcode:"
if [ -d "/Applications/Xcode.app" ]; then
    echo "  ✅ Xcode.app found"
    if command -v xcodebuild &> /dev/null; then
        echo "  ✅ xcodebuild available"
        xcodebuild -version | head -1
    else
        echo "  ⚠️  xcodebuild not found"
    fi
else
    echo "  ❌ Xcode.app NOT FOUND"
    echo "     👉 Install from App Store: https://apps.apple.com/us/app/xcode/id497799835"
fi
echo ""

# Check Xcode Command Line Tools
echo "🛠️  Xcode Command Line Tools:"
XCODE_PATH=$(xcode-select -p 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "  ✅ $XCODE_PATH"
    if [[ "$XCODE_PATH" == *"CommandLineTools"* ]]; then
        echo "  ⚠️  Using Command Line Tools only"
        echo "     👉 Switch to full Xcode with:"
        echo "        sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer"
    fi
else
    echo "  ❌ Not found"
fi
echo ""

# Check CocoaPods
echo "💎 CocoaPods:"
if command -v pod &> /dev/null; then
    echo "  ✅ $(pod --version)"
else
    echo "  ❌ Not found (will be installed automatically)"
fi
echo ""

# Check Watchman
echo "👁️  Watchman:"
if command -v watchman &> /dev/null; then
    echo "  ✅ $(watchman --version)"
else
    echo "  ⚠️  Not found (recommended but optional)"
    echo "     👉 Install with: brew install watchman"
fi
echo ""

# Check iOS Simulators
echo "📱 iOS Simulators:"
if command -v xcrun &> /dev/null; then
    SIM_COUNT=$(xcrun simctl list devices available 2>/dev/null | grep "iPhone" | wc -l)
    if [ $SIM_COUNT -gt 0 ]; then
        echo "  ✅ $SIM_COUNT iPhone simulators found"
    else
        echo "  ⚠️  No simulators found"
    fi
else
    echo "  ❌ xcrun not available (need Xcode)"
fi
echo ""

# Check project files
echo "📄 Project Files:"
if [ -f "index.js" ]; then
    echo "  ✅ index.js"
else
    echo "  ❌ index.js missing"
fi

if [ -f "App.tsx" ]; then
    echo "  ✅ App.tsx"
else
    echo "  ❌ App.tsx missing"
fi

if [ -f "babel.config.js" ]; then
    echo "  ✅ babel.config.js"
else
    echo "  ❌ babel.config.js missing"
fi

if [ -f "app.json" ]; then
    echo "  ✅ app.json"
else
    echo "  ❌ app.json missing"
fi

if [ -d "node_modules" ]; then
    echo "  ✅ node_modules"
else
    echo "  ❌ node_modules (run: npm install)"
fi
echo ""

# Summary
echo "=================================="
echo "📋 SUMMARY"
echo "=================================="

if [ ! -d "/Applications/Xcode.app" ]; then
    echo "❌ BLOCKER: Full Xcode required"
    echo "   Install from App Store, then run:"
    echo "   sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer"
    echo ""
elif [[ "$XCODE_PATH" == *"CommandLineTools"* ]]; then
    echo "⚠️  WARNING: Using Command Line Tools only"
    echo "   Switch to full Xcode with:"
    echo "   sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer"
    echo ""
else
    echo "✅ Environment looks good!"
    echo ""
    echo "Next steps:"
    echo "  1. npx expo prebuild --clean"
    echo "  2. npx expo run:ios"
    echo ""
fi

