import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ========================================
  // 1. USERS
  // ========================================
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@projectnova.internal' },
    update: {},
    create: { email: 'admin@projectnova.internal', password: hashedPassword, name: 'System Administrator', role: 'ADMIN', emailVerified: true },
  });
  const moderator = await prisma.user.upsert({
    where: { email: 'moderator@projectnova.internal' },
    update: {},
    create: { email: 'moderator@projectnova.internal', password: hashedPassword, name: 'Project Moderator', role: 'MODERATOR', emailVerified: true },
  });
  const manager1 = await prisma.user.upsert({
    where: { email: 'manager.web@projectnova.internal' },
    update: {},
    create: { email: 'manager.web@projectnova.internal', password: hashedPassword, name: 'Rajesh Kumar', role: 'MANAGER', emailVerified: true },
  });
  const manager2 = await prisma.user.upsert({
    where: { email: 'manager.ai@projectnova.internal' },
    update: {},
    create: { email: 'manager.ai@projectnova.internal', password: hashedPassword, name: 'Priya Sharma', role: 'MANAGER', emailVerified: true },
  });
  const employee1 = await prisma.user.upsert({
    where: { email: 'emp.frontend@projectnova.internal' },
    update: {},
    create: { email: 'emp.frontend@projectnova.internal', password: hashedPassword, name: 'Amit Verma', role: 'EMPLOYEE', emailVerified: true, managerId: manager1.id },
  });
  const employee2 = await prisma.user.upsert({
    where: { email: 'emp.backend@projectnova.internal' },
    update: {},
    create: { email: 'emp.backend@projectnova.internal', password: hashedPassword, name: 'Sneha Patel', role: 'EMPLOYEE', emailVerified: true, managerId: manager1.id },
  });
  const employee3 = await prisma.user.upsert({
    where: { email: 'emp.fullstack@projectnova.internal' },
    update: {},
    create: { email: 'emp.fullstack@projectnova.internal', password: hashedPassword, name: 'Vikram Singh', role: 'EMPLOYEE', emailVerified: true, managerId: manager1.id },
  });
  const employee4 = await prisma.user.upsert({
    where: { email: 'emp.ml@projectnova.internal' },
    update: {},
    create: { email: 'emp.ml@projectnova.internal', password: hashedPassword, name: 'Ananya Reddy', role: 'EMPLOYEE', emailVerified: true, managerId: manager2.id },
  });
  const employee5 = await prisma.user.upsert({
    where: { email: 'emp.ai@projectnova.internal' },
    update: {},
    create: { email: 'emp.ai@projectnova.internal', password: hashedPassword, name: 'Rahul Joshi', role: 'EMPLOYEE', emailVerified: true, managerId: manager2.id },
  });
  await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: { email: 'customer@example.com', password: hashedPassword, name: 'Test Customer', role: 'USER', emailVerified: true },
  });

  console.log('✅ Created 10 users\n');

  // ========================================
  // 2. PROJECTS (18 total)
  // ========================================
  console.log('📁 Creating projects...\n');

  const projects = [
    // ─── WEB ─────────────────────────────────────────────
    {
      slug: 'ecommerce-mern-platform',
      title: 'E-Commerce MERN Stack Platform',
      description: 'Full-featured e-commerce platform with user authentication, product catalog, shopping cart, Razorpay payment gateway, order management, and an admin dashboard. Ideal final-year project with complete documentation and viva Q&A.',
      category: 'WEB' as const,
      techStack: ['MongoDB', 'Express.js', 'React', 'Node.js', 'Redux', 'Razorpay'],
      features: ['JWT Authentication', 'Product Search & Filters', 'Shopping Cart', 'Razorpay Payments', 'Order Tracking', 'Admin Dashboard', 'Product Reviews', 'Wishlist', 'Email Notifications'],
      tier1Price: 999, tier2Price: 1999, tier3Price: 2999,
      tier1Key: 'e-commerce-mern', popularity: 95, views: 420,
      image: '/projects/web-ecommerce.svg',
    },
    {
      slug: 'nextjs-job-portal',
      title: 'Next.js Full-Stack Job Portal',
      description: 'Production-grade job portal with role-based access (Admin, Recruiter, Candidate), resumé uploads, advanced job search, email notifications, and a recruiter analytics dashboard. Built with Next.js 14 and PostgreSQL.',
      category: 'WEB' as const,
      techStack: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Tailwind CSS', 'AWS S3'],
      features: ['NextAuth (Google + Email)', 'Role-Based Access', 'Job Posting Editor', 'Resume Upload (S3)', 'Advanced Search', 'Application Tracking', 'Email Notifications', 'Recruiter Analytics'],
      tier1Price: 1199, tier2Price: 2199, tier3Price: 3299,
      tier1Key: 'job-portal', popularity: 65, views: 142,
      image: '/projects/web-portal.svg',
    },
    {
      slug: 'hospital-management-system',
      title: 'Hospital Management System',
      description: 'Comprehensive hospital management system covering patient registration, appointment scheduling, doctor dashboards, billing, prescription management, and lab reports. Built in PHP + MySQL with a clean Bootstrap UI.',
      category: 'WEB' as const,
      techStack: ['PHP', 'MySQL', 'Bootstrap', 'jQuery', 'Ajax'],
      features: ['Patient Registration', 'Appointment Booking', 'Doctor Dashboard', 'Billing & Invoicing', 'Lab Reports', 'Prescription Management', 'Inventory Management', 'Admin Panel'],
      tier1Price: 799, tier2Price: 1599, tier3Price: 2499,
      tier1Key: 'hospital-mgmt', popularity: 82, views: 291,
      image: '/projects/web-hospital.svg',
    },
    {
      slug: 'online-learning-platform',
      title: 'Online Learning Platform (LMS)',
      description: 'Full-stack Learning Management System with course creation, video lessons, quizzes, progress tracking, certificate generation, and Stripe payments. Built with Django and React.',
      category: 'WEB' as const,
      techStack: ['Django', 'Django REST Framework', 'React', 'PostgreSQL', 'Stripe', 'Celery'],
      features: ['Course Creation', 'Video Lessons', 'Quiz Engine', 'Progress Tracking', 'Certificate Generation', 'Stripe Payments', 'Analytics Dashboard', 'Discussion Forums'],
      tier1Price: 1299, tier2Price: 2499, tier3Price: 3799,
      tier1Key: 'lms', popularity: 76, views: 215,
      image: '/projects/web-lms.svg',
    },
    {
      slug: 'social-media-app-react',
      title: 'Social Media App (Facebook Clone)',
      description: 'Feature-rich social media application with real-time posts, comments, friend requests, private messaging, story uploads, and notifications. Built with React, Node.js, and Socket.io.',
      category: 'WEB' as const,
      techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Socket.io', 'Firebase Storage'],
      features: ['User Profiles', 'News Feed', 'Friend Requests', 'Real-time Chat (Socket.io)', 'Story Uploads', 'Post Reactions', 'Notifications', 'Search'],
      tier1Price: 1099, tier2Price: 2099, tier3Price: 3199,
      tier1Key: 'social-app', popularity: 70, views: 187,
      image: '/projects/web-social.svg',
    },
    // ─── AI ──────────────────────────────────────────────
    {
      slug: 'ai-disease-prediction',
      title: 'AI-Powered Disease Prediction System',
      description: 'ML system predicting diseases from symptoms using SVM, Random Forest, and KNN. Built with Python and Flask. Includes model training pipeline, web UI, accuracy comparison charts, and a patient history tracker.',
      category: 'AI' as const,
      techStack: ['Python', 'Flask', 'scikit-learn', 'Pandas', 'NumPy', 'TensorFlow'],
      features: ['Symptom-Based Prediction', 'Multi-Algorithm (SVM, RF, KNN)', 'Accuracy Comparison', 'Web UI', 'Patient History', 'PDF Report Export', 'Model Retraining'],
      tier1Price: 1499, tier2Price: 2499, tier3Price: 3499,
      tier1Key: 'ai-disease', popularity: 88, views: 310,
      image: '/projects/ai-prediction.svg',
    },
    {
      slug: 'ai-chatbot-nlp',
      title: 'AI Customer Support Chatbot (NLP)',
      description: 'Intelligent chatbot using NLP and a transformer-based model (BERT) for intent classification. Handles FAQs, order tracking queries, and escalates complex issues. Integrates with a React web widget.',
      category: 'AI' as const,
      techStack: ['Python', 'Transformers (BERT)', 'FastAPI', 'React', 'Redis', 'PostgreSQL'],
      features: ['Intent Classification (BERT)', 'Entity Extraction', 'Multi-Turn Conversation', 'React Chat Widget', 'Admin Training Panel', 'Chat History', 'Fallback Escalation'],
      tier1Price: 1899, tier2Price: 2999, tier3Price: 4499,
      tier1Key: 'ai-chatbot', popularity: 78, views: 203,
      image: '/projects/ai-chatbot.svg',
    },
    {
      slug: 'face-recognition-attendance',
      title: 'Face Recognition Attendance System',
      description: 'Automated attendance system using OpenCV and DeepFace for real-time face detection and recognition. Integrates with a web dashboard showing attendance reports, late entries, and analytics.',
      category: 'AI' as const,
      techStack: ['Python', 'OpenCV', 'DeepFace', 'Flask', 'React', 'SQLite'],
      features: ['Real-Time Face Detection', 'Face Enrollment', 'Attendance Logging', 'Late Entry Alerts', 'Web Dashboard', 'Excel Report Export', 'Admin Panel'],
      tier1Price: 1399, tier2Price: 2399, tier3Price: 3499,
      tier1Key: 'face-attendance', popularity: 85, views: 264,
      image: '/projects/ai-face.svg',
    },
    // ─── ML ──────────────────────────────────────────────
    {
      slug: 'stock-price-prediction-lstm',
      title: 'Stock Price Prediction with LSTM',
      description: 'Deep learning model using LSTM networks to predict stock prices. Trained on historical data from Yahoo Finance API. Includes a Streamlit dashboard with candlestick charts, buy/sell signals, and accuracy metrics.',
      category: 'ML' as const,
      techStack: ['Python', 'TensorFlow/Keras', 'LSTM', 'Streamlit', 'Plotly', 'yfinance'],
      features: ['LSTM Price Forecasting', 'Real-Time Yahoo Finance Data', 'Candlestick Charts', 'Buy/Sell Signal Generator', 'Prediction Accuracy Metrics', 'Multi-Stock Support'],
      tier1Price: 1299, tier2Price: 2299, tier3Price: 3399,
      tier1Key: 'stock-lstm', popularity: 72, views: 198,
      image: '/projects/ml-stock.svg',
    },
    {
      slug: 'sentiment-analysis-twitter',
      title: 'Twitter Sentiment Analysis Dashboard',
      description: 'Real-time sentiment analysis of Twitter/X data using VADER and a fine-tuned BERT model. Supports keyword tracking, sentiment trends over time, geographic sentiment maps, and word clouds.',
      category: 'ML' as const,
      techStack: ['Python', 'Tweepy', 'VADER', 'BERT', 'Streamlit', 'Plotly', 'MongoDB'],
      features: ['Real-Time Tweet Fetching', 'VADER + BERT Sentiment', 'Trend Analysis Charts', 'Geographic Heatmap', 'Word Cloud', 'Keyword Alerts', 'Historical Data Export'],
      tier1Price: 999, tier2Price: 1999, tier3Price: 2999,
      tier1Key: 'sentiment', popularity: 63, views: 145,
      image: '/projects/ml-sentiment.svg',
    },
    // ─── IOT ─────────────────────────────────────────────
    {
      slug: 'smart-home-iot-system',
      title: 'Smart Home Automation with IoT',
      description: 'Voice-controlled smart home system using Arduino + Raspberry Pi. Controls lights, fans, AC, and cameras via a mobile app. Features real-time sensor monitoring, automated schedules, Firebase cloud sync, and offline fallback.',
      category: 'IOT' as const,
      techStack: ['Arduino', 'Raspberry Pi', 'Node.js', 'React', 'MQTT', 'Firebase'],
      features: ['Voice Commands (Google Assistant)', 'Mobile App', 'Real-Time Sensor Data', 'Automated Schedules', 'Camera Integration', 'Energy Analytics', 'Offline Mode'],
      tier1Price: 1299, tier2Price: 2299, tier3Price: 3499,
      tier1Key: 'smart-home', popularity: 80, views: 258,
      image: '/projects/iot-smarthome.svg',
    },
    {
      slug: 'iot-agriculture-monitoring',
      title: 'Smart Agriculture IoT Monitoring',
      description: 'IoT-based precision agriculture system monitoring soil moisture, temperature, humidity, and pH. Sends SMS alerts for anomalies, automates irrigation based on sensor data, and provides a farmer-friendly Bengali/Hindi UI.',
      category: 'IOT' as const,
      techStack: ['Arduino', 'ESP8266', 'Python', 'Flask', 'ThingSpeak', 'Twilio'],
      features: ['Soil Moisture Monitoring', 'Temperature & Humidity', 'pH Sensor Integration', 'Automated Irrigation', 'SMS Alerts (Twilio)', 'ThingSpeak Dashboard', 'Historical Graphs'],
      tier1Price: 999, tier2Price: 1899, tier3Price: 2999,
      tier1Key: 'agri-iot', popularity: 68, views: 174,
      image: '/projects/iot-agriculture.svg',
    },
    // ─── BLOCKCHAIN ───────────────────────────────────────
    {
      slug: 'blockchain-voting-system',
      title: 'Decentralized Blockchain Voting System',
      description: 'Tamper-proof e-voting system on Ethereum using Solidity smart contracts. Voter auth via Aadhaar OTP simulation, real-time tallying, and full on-chain audit trail. Deployed on Ganache and Goerli testnet.',
      category: 'BLOCKCHAIN' as const,
      techStack: ['Solidity', 'Ethereum', 'Web3.js', 'React', 'Truffle', 'MetaMask'],
      features: ['Smart Contract Voting', 'OTP Voter Auth', 'One-Vote Enforcement', 'Real-Time Results', 'On-Chain Audit Trail', 'Admin Election Panel', 'Testnet Deployment'],
      tier1Price: 1799, tier2Price: 2999, tier3Price: 4499,
      tier1Key: 'blockchain-voting', popularity: 72, views: 195,
      image: '/projects/blockchain-voting.svg',
    },
    {
      slug: 'nft-marketplace',
      title: 'NFT Marketplace (Ethereum)',
      description: 'Full-stack NFT marketplace where users can mint, list, buy, and auction digital assets on Ethereum. Built with Hardhat, ERC-721, OpenSea-style lazy minting, and IPFS for metadata storage.',
      category: 'BLOCKCHAIN' as const,
      techStack: ['Solidity', 'Hardhat', 'ERC-721', 'React', 'ethers.js', 'IPFS', 'Pinata'],
      features: ['NFT Minting (ERC-721)', 'Listing & Buying', 'Auction System', 'IPFS Metadata', 'Wallet Connect', 'Royalty System', 'Collection Dashboard'],
      tier1Price: 2499, tier2Price: 3999, tier3Price: 5999,
      tier1Key: 'nft-marketplace', popularity: 60, views: 142,
      image: '/projects/blockchain-nft.svg',
    },
    // ─── DATA ─────────────────────────────────────────────
    {
      slug: 'python-data-analytics-dashboard',
      title: 'Python Data Analytics Dashboard',
      description: 'Interactive data analytics dashboard built with Streamlit and Plotly. Supports CSV/Excel uploads, automated EDA, ML model comparison across 10+ algorithms, correlation heatmaps, and PDF report export.',
      category: 'DATA' as const,
      techStack: ['Python', 'Streamlit', 'Plotly', 'Pandas', 'scikit-learn', 'ReportLab'],
      features: ['CSV/Excel Upload', 'Auto EDA', 'Interactive Charts', 'Heatmaps', 'ML Model Comparison', 'Feature Importance', 'PNG Export', 'PDF Reports'],
      tier1Price: 899, tier2Price: 1799, tier3Price: 2799,
      tier1Key: 'data-analytics', popularity: 58, views: 120,
      image: '/projects/data-analytics.svg',
    },
    // ─── MOBILE ───────────────────────────────────────────
    {
      slug: 'flutter-food-delivery-app',
      title: 'Flutter Food Delivery App',
      description: 'Cross-platform food delivery app (iOS & Android) built with Flutter and Firebase. Includes real-time order tracking on Google Maps, Stripe payments, restaurant dashboards, push notifications, and a delivery partner app.',
      category: 'MOBILE' as const,
      techStack: ['Flutter', 'Dart', 'Firebase', 'Google Maps API', 'Stripe', 'FCM'],
      features: ['GPS Order Tracking', 'Real-Time Map', 'Stripe Payments', 'Restaurant Dashboard', 'Push Notifications', 'Delivery Partner App', 'Order History', 'Rating & Reviews'],
      tier1Price: 1499, tier2Price: 2699, tier3Price: 3999,
      tier1Key: 'flutter-food', popularity: 74, views: 208,
      image: '/projects/mobile-flutter.svg',
    },
    // ─── CYBERSECURITY ────────────────────────────────────
    {
      slug: 'network-intrusion-detection',
      title: 'Network Intrusion Detection System (IDS)',
      description: 'ML-based network intrusion detection system trained on the NSL-KDD dataset. Classifies network traffic as normal or attack (DoS, Probe, R2L, U2R). Includes a live packet capture module and a real-time alert dashboard.',
      category: 'CYBERSECURITY' as const,
      techStack: ['Python', 'scikit-learn', 'Scapy', 'Flask', 'React', 'Chart.js'],
      features: ['NSL-KDD Training', '4-Class Attack Detection', 'Live Packet Capture (Scapy)', 'Real-Time Alert Dashboard', 'Traffic Log History', 'Model Accuracy Comparison', 'PDF Reports'],
      tier1Price: 1699, tier2Price: 2799, tier3Price: 3999,
      tier1Key: 'ids', popularity: 55, views: 112,
      image: '/projects/cybersecurity-ids.svg',
    },
    // ─── DBMS ─────────────────────────────────────────────
    {
      slug: 'inventory-management-system',
      title: 'Inventory Management System',
      description: 'Full-featured inventory and warehouse management system built with Java (Spring Boot) and MySQL. Tracks stock levels, purchase orders, supplier management, barcode scanning, and low-stock alerts.',
      category: 'DBMS' as const,
      techStack: ['Java', 'Spring Boot', 'MySQL', 'Thymeleaf', 'JasperReports', 'Hibernate'],
      features: ['Stock Tracking', 'Purchase Orders', 'Supplier Management', 'Barcode Scanning', 'Low-Stock Alerts', 'Sales Reports', 'Multi-Warehouse', 'Invoice Generation'],
      tier1Price: 799, tier2Price: 1599, tier3Price: 2499,
      tier1Key: 'inventory', popularity: 50, views: 98,
      image: '/projects/dbms-inventory.svg',
    },
  ];

  for (const p of projects) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        category: p.category as any,
        techStack: p.techStack,
        features: p.features,
        tier1Price: p.tier1Price,
        tier1Features: ['Complete source code', 'Basic documentation', 'Database schema / setup guide'],
        tier1Files: { driveId: 'https://drive.google.com/drive/folders/1_dummy_drive_id_tier1', type: 'folder' },
        tier2Price: p.tier2Price,
        tier2Features: ['Everything in Tier 1', 'Video tutorials', 'Installation & deployment guide', 'Troubleshooting guide'],
        tier2Files: { driveId: 'https://drive.google.com/drive/folders/1_dummy_drive_id_tier2', type: 'folder' },
        tier3Price: p.tier3Price,
        tier3Features: ['Everything in Tier 2', 'Viva Q&A (40–60 questions)', '30-day WhatsApp support', 'Project report', 'PPT template'],
        tier3Files: { driveId: 'https://drive.google.com/drive/folders/1_dummy_drive_id_tier3', type: 'folder' },
        images: [p.image],
        thumbnailUrl: p.image,
        modulesBreakdown: p.techStack.map((t) => t),
        vivaQA: `Q: Explain the overall architecture of this project. A: The project uses a layered architecture where the frontend communicates with the backend through RESTful APIs. The backend handles business logic and database operations. Q: What were the major challenges you faced? A: Integrating the various modules and ensuring data consistency across the system were the primary challenges, resolved through careful API design and thorough testing.`,
        isPublished: true,
        popularity: p.popularity,
        views: p.views,
      },
    });
    console.log(`✅ ${p.title}`);
  }

  console.log(`\n📁 Created ${projects.length} projects\n`);

  // ========================================
  // 3. PROJECT ASSIGNMENTS
  // ========================================
  const assignments = [
    { userId: manager1.id,  projectId: (await prisma.project.findUnique({ where: { slug: 'ecommerce-mern-platform' } }))!.id, role: 'Project Lead' },
    { userId: employee1.id, projectId: (await prisma.project.findUnique({ where: { slug: 'ecommerce-mern-platform' } }))!.id, role: 'Frontend Developer' },
    { userId: employee2.id, projectId: (await prisma.project.findUnique({ where: { slug: 'ecommerce-mern-platform' } }))!.id, role: 'Backend Developer' },
    { userId: manager2.id,  projectId: (await prisma.project.findUnique({ where: { slug: 'ai-disease-prediction' } }))!.id, role: 'Project Lead' },
    { userId: employee4.id, projectId: (await prisma.project.findUnique({ where: { slug: 'ai-disease-prediction' } }))!.id, role: 'ML Engineer' },
    { userId: employee5.id, projectId: (await prisma.project.findUnique({ where: { slug: 'ai-disease-prediction' } }))!.id, role: 'AI Specialist' },
    { userId: manager1.id,  projectId: (await prisma.project.findUnique({ where: { slug: 'smart-home-iot-system' } }))!.id, role: 'Project Lead' },
    { userId: employee3.id, projectId: (await prisma.project.findUnique({ where: { slug: 'smart-home-iot-system' } }))!.id, role: 'Full Stack Developer' },
  ];

  for (const a of assignments) {
    await prisma.projectAssignment.upsert({
      where: { userId_projectId: { userId: a.userId, projectId: a.projectId } },
      update: {},
      create: { userId: a.userId, projectId: a.projectId, role: a.role, isActive: true },
    });
  }
  console.log('✅ Created 8 project assignments\n');

  console.log('✨ Database seeding completed!\n');
  console.log('📝 Login credentials (password: password123):');
  console.log('   ADMIN:     admin@projectnova.internal');
  console.log('   MODERATOR: moderator@projectnova.internal');
  console.log('   MANAGERS:  manager.web / manager.ai @projectnova.internal');
  console.log('   EMPLOYEES: emp.frontend / emp.backend / emp.fullstack / emp.ml / emp.ai @projectnova.internal');
  console.log('   CUSTOMER:  customer@example.com');
  console.log('\n🖥️  Browse projects at http://localhost:3000/projects\n');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
