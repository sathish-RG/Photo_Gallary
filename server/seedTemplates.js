const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Template Seeder Script
 * Run with: node seedTemplates.js
 * 
 * This script populates the database with 4 advanced pre-built template designs
 */

const Template = require('./models/Template');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Template Data
const templates = [
  {
    name: 'Neon Party',
    description: 'Bold and vibrant design perfect for celebrations with neon colors and modern aesthetics',
    category: 'party',
    thumbnailUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
    styleConfig: {
      backgroundColor: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      backgroundImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&h=1080&fit=crop&blur=20',
      fontFamily: "'Montserrat', 'Arial Black', sans-serif",
      textColor: '#ffffff',
      animationType: 'zoom-in',
      containerStyle: {
        borderRadius: '24px',
        border: '3px solid transparent',
        backgroundImage: 'linear-gradient(135deg, #ff006e, #8338ec, #3a86ff)',
        backgroundClip: 'padding-box, border-box',
        backgroundOrigin: 'padding-box, border-box',
        boxShadow: '0 20px 60px rgba(255, 0, 110, 0.4), 0 0 40px rgba(131, 56, 236, 0.3)',
        backdropFilter: 'blur(10px)',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden'
      }
    },
    layoutConfig: {
      themeColor: '#ff006e',
      title: 'Party Time! 🎉',
      message: 'Get ready to celebrate in style with this vibrant neon design!'
    }
  },
  {
    name: 'Elegant Wedding',
    description: 'Sophisticated and timeless design with gold accents, perfect for weddings and formal events',
    category: 'wedding',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop',
    styleConfig: {
      backgroundColor: 'linear-gradient(135deg, #fdfbf7 0%, #f8f4ea 100%)',
      backgroundImageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1920&h=1080&fit=crop&blur=30',
      fontFamily: "'Playfair Display', 'Georgia', serif",
      textColor: '#8b7355',
      animationType: 'fade-in',
      containerStyle: {
        borderRadius: '16px',
        border: '2px solid #d4af37',
        boxShadow: '0 10px 40px rgba(212, 175, 55, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(253, 251, 247, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        padding: '50px',
        position: 'relative'
      }
    },
    layoutConfig: {
      themeColor: '#d4af37',
      title: 'Forever & Always',
      message: 'Celebrating love, elegance, and timeless moments together.'
    }
  },
  {
    name: 'Retro Polaroid',
    description: 'Vintage-inspired design with nostalgic polaroid aesthetics and typewriter fonts',
    category: 'retro',
    thumbnailUrl: 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=800&h=600&fit=crop',
    styleConfig: {
      backgroundColor: '#f5e6d3',
      backgroundImageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=1080&fit=crop&blur=15',
      fontFamily: "'Courier Prime', 'Courier New', monospace",
      textColor: '#3d3d3d',
      animationType: 'slide-up',
      containerStyle: {
        borderRadius: '8px',
        border: '12px solid #ffffff',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2), 0 5px 15px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(0, 0, 0, 0.1)',
        background: '#ffffff',
        padding: '30px',
        transform: 'rotate(-2deg)',
        position: 'relative',
        filter: 'sepia(0.15) contrast(1.1)',
        '::before': {
          content: '""',
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.03) 0px, rgba(0, 0, 0, 0.03) 1px, transparent 1px, transparent 2px)',
          pointerEvents: 'none'
        }
      }
    },
    layoutConfig: {
      themeColor: '#d4a574',
      title: 'Memories Forever',
      message: 'Capturing moments that last a lifetime, one snapshot at a time.'
    }
  },
  {
    name: 'Glassmorphism',
    description: 'Modern frosted glass effect with blur and transparency for a sleek, contemporary look',
    category: 'modern',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&h=600&fit=crop',
    styleConfig: {
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      backgroundImageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&h=1080&fit=crop',
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      textColor: '#ffffff',
      animationType: 'fade-in',
      containerStyle: {
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)',
        padding: '45px',
        position: 'relative',
        overflow: 'hidden'
      }
    },
    layoutConfig: {
      themeColor: '#667eea',
      title: 'Modern Elegance',
      message: 'Experience the future of design with sleek glassmorphism aesthetics.'
    }
  }
];

// Seed Function
const seedTemplates = async () => {
  try {
    // Clear existing templates
    await Template.deleteMany({});
    console.log('🗑️  Cleared existing templates');

    // Insert new templates
    const createdTemplates = await Template.insertMany(templates);
    console.log(`✨ Successfully created ${createdTemplates.length} templates:`);
    
    createdTemplates.forEach((template, index) => {
      console.log(`   ${index + 1}. ${template.name} (${template.category})`);
    });

    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    process.exit(1);
  }
};

// Run the seeder
const run = async () => {
  await connectDB();
  await seedTemplates();
};

run();
