// Generate placeholder PNG assets for Expo
const sharp = require('sharp');
const fs = require('fs');

async function generateAssets() {
  const size = 1024;
  
  // Create icon (green with "D" logo)
  const iconSvg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#4CAF50"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="400" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">D</text>
    </svg>
  `;
  
  // Create splash (white background)
  const splashSvg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#ffffff"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="200" fill="#4CAF50" text-anchor="middle" dominant-baseline="middle">Doloop</text>
    </svg>
  `;
  
  try {
    // Generate icon
    await sharp(Buffer.from(iconSvg))
      .png()
      .resize(size, size)
      .toFile('./assets/icon.png');
    console.log('✓ Created assets/icon.png');
    
    // Generate splash
    await sharp(Buffer.from(splashSvg))
      .png()
      .resize(size, size)
      .toFile('./assets/splash.png');
    console.log('✓ Created assets/splash.png');
    
    console.log('\n⚠️  NOTE: These are placeholder assets. Replace with proper 1024x1024 PNG images before production.');
  } catch (error) {
    console.error('Error generating assets:', error);
    process.exit(1);
  }
}

generateAssets();

