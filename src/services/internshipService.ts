import { supabase } from './supabase';

export interface InternshipListing {
  id: string;
  recruiterId?: string;
  companyName: string;
  title: string;
  type: string;
  location: string;
  stipend: string;
  stipendAmount: number;
  duration: string;
  description: string;
  requirements: string[];
  skills: string[];
  benefits: string[];
  tags: string[];
  remote: boolean;
  urgent: boolean;
  education: string;
  experience: string;
  companyLogo?: string;
  status: 'active' | 'closed' | 'flagged';
  createdAt: string;
  deadline: string;
  matchScore?: number;
  applicantCount?: number;
}

export interface Application {
  id: string;
  listingId: string;
  studentId: string;
  status: 'applied' | 'shortlisted' | 'interviewed' | 'rejected' | 'selected';
  coverLetter: string;
  resumeUrl?: string;
  appliedAt: string;
  updatedAt: string;
  listing?: InternshipListing;
  student?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    skills: string[];
    education?: string;
    phone?: string;
  };
}

// Fallback seed data if DB is empty or during offline testing & rich curated catalog
const FALLBACK_LISTINGS: InternshipListing[] = [
  {
    id: 'f1010000-0000-0000-0000-000000000101',
    companyName: 'TechCorp Solutions',
    title: 'Frontend Developer Intern',
    type: 'Internship',
    location: 'Remote',
    stipend: '₹25,000/month',
    stipendAmount: 25000,
    duration: '3 months',
    description: 'Join our dynamic frontend team to build modern React applications. You will collaborate with senior developers and UI designers.',
    requirements: ['Solid understanding of React and JavaScript', 'Familiarity with HTML/CSS & Tailwind', 'Good problem solving skills'],
    skills: ['React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Git'],
    benefits: ['Certificate of Completion', 'Letter of Recommendation', 'Flexible Work Hours', 'Pre-placement Offer Potential'],
    tags: ['React', 'Frontend', 'Remote'],
    remote: true,
    urgent: true,
    education: 'B.Tech / BE (CS/IT/ECE)',
    experience: 'Fresher',
    companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop&crop=faces',
    status: 'active',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'f1010000-0000-0000-0000-000000000102',
    companyName: 'DataFlow Systems',
    title: 'Backend Engineering Intern',
    type: 'Internship',
    location: 'Bangalore, India',
    stipend: '₹30,000/month',
    stipendAmount: 30000,
    duration: '6 months',
    description: 'Work on building scalable microservices and database optimizations using Node.js, Python, and PostgreSQL.',
    requirements: ['Proficiency in Node.js or Python', 'Basic knowledge of SQL databases', 'Understanding of RESTful APIs'],
    skills: ['Node.js', 'Python', 'PostgreSQL', 'Docker', 'Git'],
    benefits: ['Competitive Stipend', 'Mentorship Program', 'Free Lunch & Snacks', 'PPO Opportunity'],
    tags: ['Backend', 'Node.js', 'PostgreSQL'],
    remote: false,
    urgent: false,
    education: 'B.Tech / BE / MCA',
    experience: 'Fresher',
    companyLogo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop&crop=faces',
    status: 'active',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'f1010000-0000-0000-0000-000000000103',
    companyName: 'Analytics Pro',
    title: 'Data Science & ML Intern',
    type: 'Internship',
    location: 'Hyderabad, India',
    stipend: '₹28,000/month',
    stipendAmount: 28000,
    duration: '6 months',
    description: 'Extract insights from massive datasets and develop predictive models using Python, Pandas, and Machine Learning algorithms.',
    requirements: ['Strong Python programming', 'Knowledge of Pandas, NumPy, Scikit-learn', 'Basic statistics background'],
    skills: ['Python', 'Pandas', 'Machine Learning', 'PostgreSQL'],
    benefits: ['Hands-on project experience', 'Industry publication opportunities', 'Mentorship'],
    tags: ['Data Science', 'Python', 'ML'],
    remote: true,
    urgent: true,
    education: 'B.Tech / M.Tech / Data Science specialization',
    experience: 'Fresher',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop&crop=faces',
    status: 'active',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'f1010000-0000-0000-0000-000000000104',
    companyName: 'Meesho',
    title: 'Growth Marketing & Performance Analytics Intern',
    type: 'Internship',
    location: 'Bangalore, India',
    stipend: '₹30,000/month',
    stipendAmount: 30000,
    duration: '4 months',
    description: 'Drive user acquisition and retention campaigns through data-driven performance marketing, A/B testing, and SEO/SEM optimizations for Meeshos social commerce platform.',
    requirements: ['Strong analytical mindset with proficiency in Google Analytics or similar tools', 'Familiarity with Meta Ads, Google Ads, or affiliate marketing platforms', 'Basic SQL and Excel/Sheets skills'],
    skills: ['Digital Marketing', 'Google Analytics', 'SQL', 'A/B Testing', 'SEO', 'Excel'],
    benefits: ['PPO Opportunity', 'Fast-paced startup exposure', 'Performance bonuses', 'Flexible work hours'],
    tags: ['Meesho', 'Marketing', 'Growth', 'Analytics', 'E-commerce'],
    remote: true,
    urgent: true,
    education: 'Any Graduate / MBA (Pursuing) / BBA',
    experience: 'Fresher',
    companyLogo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop&crop=faces',
    status: 'active',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'f1010000-0000-0000-0000-000000000105',
    companyName: 'Unacademy',
    title: 'EdTech Product & Content Engineering Intern',
    type: 'Internship',
    location: 'Remote',
    stipend: '₹22,000/month',
    stipendAmount: 22000,
    duration: '3 months',
    description: 'Help build interactive learning tools, video delivery pipelines, and adaptive quiz engines for Unacademys 50M+ learner base across K-12 and competitive exam verticals.',
    requirements: ['Experience with React or Vue.js', 'Interest in education technology and user engagement', 'Understanding of REST APIs and content delivery systems'],
    skills: ['React', 'JavaScript', 'REST API', 'Firebase', 'Git', 'Node.js'],
    benefits: ['Free Unacademy Plus subscription', 'PPO Opportunity', 'Fully remote', 'Certificate of completion'],
    tags: ['Unacademy', 'EdTech', 'React', 'Remote', 'Content'],
    remote: true,
    urgent: false,
    education: 'B.Tech / BCA / Any Engineering degree',
    experience: 'Fresher',
    companyLogo: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=100&h=100&fit=crop&crop=faces',
    status: 'active',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'f1010000-0000-0000-0000-000000000106',
    companyName: 'Ola Electric',
    title: 'Embedded Systems & EV Firmware Intern',
    type: 'Internship',
    location: 'Bangalore, India',
    stipend: '₹40,000/month',
    stipendAmount: 40000,
    duration: '6 months',
    description: 'Work on firmware development for next-gen EV battery management systems, motor controllers, and CAN bus communication protocols in Olas Futurefactory.',
    requirements: ['Solid foundation in C/C++ for embedded systems', 'Experience with RTOS (FreeRTOS, Zephyr) is a strong plus', 'Familiarity with CAN, UART, SPI, I2C communication protocols'],
    skills: ['C', 'C++', 'Embedded Systems', 'RTOS', 'CAN Bus', 'Python'],
    benefits: ['Work on real EVs shipped to customers', 'PPO opportunity', 'Cutting-edge hardware access', 'Meal & transport allowance'],
    tags: ['Ola Electric', 'Embedded', 'EV', 'Hardware', 'Firmware'],
    remote: false,
    urgent: true,
    education: 'B.Tech / BE in ECE / EEE / CS',
    experience: 'Fresher',
    companyLogo: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=100&h=100&fit=crop&crop=faces',
    status: 'active',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'f1010000-0000-0000-0000-000000000107',
    companyName: 'Darwinbox',
    title: 'HR Tech SaaS Frontend Intern',
    type: 'Internship',
    location: 'Hyderabad, India',
    stipend: '₹28,000/month',
    stipendAmount: 28000,
    duration: '6 months',
    description: 'Build intuitive HR management dashboards, employee journey flows, and payroll UI components for Darwinboxs enterprise HRMS platform used by 850+ companies.',
    requirements: ['Proficiency in React and modern JavaScript (ES6+)', 'Eye for design with Figma-to-code implementation skills', 'Understanding of RESTful API integration'],
    skills: ['React', 'TypeScript', 'CSS', 'Figma', 'REST API', 'Git'],
    benefits: ['Mentorship by senior engineers', 'PPO consideration', 'Flexible working', 'Exposure to enterprise SaaS'],
    tags: ['Darwinbox', 'HR Tech', 'React', 'SaaS', 'Frontend'],
    remote: false,
    urgent: false,
    education: 'B.Tech / BE / BCA / MCA (CS/IT)',
    experience: 'Fresher',
    companyLogo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop&crop=faces',
    status: 'active',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'f1010000-0000-0000-0000-000000000108',
    companyName: 'Myntra',
    title: 'AI-Powered Fashion Recommendation Intern',
    type: 'Internship',
    location: 'Bangalore, India',
    stipend: '₹45,000/month',
    stipendAmount: 45000,
    duration: '6 months',
    description: 'Build personalized fashion recommendation engines using collaborative filtering, visual deep learning, and real-time user behavior signals for Myntras 40M active shoppers.',
    requirements: ['Python and ML fundamentals (Scikit-learn, PyTorch)', 'Understanding of recommendation systems and collaborative filtering', 'Experience with image classification or CNNs is a big plus'],
    skills: ['Python', 'PyTorch', 'Recommendation Systems', 'SQL', 'Pandas', 'Computer Vision'],
    benefits: ['PPO opportunity', 'Employee discount on Myntra', 'State-of-the-art GPU cluster access', 'Free meals & cab'],
    tags: ['Myntra', 'AI', 'Fashion Tech', 'ML', 'Recommendation'],
    remote: false,
    urgent: true,
    education: 'B.Tech / M.Tech / M.Sc in CS / Data Science / Statistics',
    experience: 'Fresher',
    companyLogo: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=100&h=100&fit=crop&crop=faces',
    status: 'active',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'f1010000-0000-0000-0000-000000000109',
    companyName: 'Slice (SuperApp)',
    title: 'FinTech Mobile App Developer Intern',
    type: 'Internship',
    location: 'Bangalore, India',
    stipend: '₹35,000/month',
    stipendAmount: 35000,
    duration: '5 months',
    description: 'Build delightful micro-interaction features, payment UX flows, and onboarding screens for Slices Gen-Z first credit card and super-app experience.',
    requirements: ['Experience in Android (Kotlin) or iOS (Swift) development', 'Knowledge of Jetpack Compose or SwiftUI is preferred', 'Good sense of mobile UX design and performance'],
    skills: ['Kotlin', 'Android', 'Swift', 'iOS', 'Jetpack Compose', 'Firebase'],
    benefits: ['Slice super-app subscription perks', 'PPO offer', 'Mentorship from senior mobile engineers', 'Flexible timings'],
    tags: ['Slice', 'FinTech', 'Mobile', 'Android', 'iOS'],
    remote: false,
    urgent: false,
    education: 'B.Tech / BE (CS/IT/ECE)',
    experience: 'Fresher',
    companyLogo: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=100&h=100&fit=crop&crop=faces',
    status: 'active',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'f1010000-0000-0000-0000-000000000110',
    companyName: 'Nazara Technologies',
    title: 'Game Developer Intern (Unity / Unreal)',
    type: 'Internship',
    location: 'Mumbai, India',
    stipend: '₹25,000/month',
    stipendAmount: 25000,
    duration: '4 months',
    description: 'Develop engaging gameplay mechanics, UI systems, and multiplayer netcode for Nazaras mobile gaming portfolio targeting 100M+ players across South Asia and Africa.',
    requirements: ['Hands-on experience with Unity 3D or Unreal Engine 5', 'Knowledge of C# (Unity) or C++ (Unreal)', 'Passion for mobile games and game physics'],
    skills: ['Unity', 'C#', 'Unreal Engine', 'C++', 'Game Design', 'Mobile Gaming'],
    benefits: ['Game testing on live products', 'PPO consideration', 'Access to gaming lab', 'Certificate'],
    tags: ['Nazara', 'Gaming', 'Unity', 'Mobile', 'Game Dev'],
    remote: true,
    urgent: false,
    education: 'Any Degree / B.Tech / Self-taught Game Developer',
    experience: 'Fresher',
    companyLogo: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=100&h=100&fit=crop&crop=faces',
    status: 'active',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'f1010000-0000-0000-0000-000000000111',
    companyName: 'ClimateAI',
    title: 'Climate Tech & Geospatial Data Science Intern',
    type: 'Internship',
    location: 'Remote',
    stipend: '₹32,000/month',
    stipendAmount: 32000,
    duration: '4 months',
    description: 'Build predictive climate risk models using satellite imagery, GIS datasets, and deep learning to help agricultural enterprises adapt to extreme weather events.',
    requirements: ['Python with geospatial libraries (GeoPandas, Rasterio, Shapely)', 'Familiarity with satellite data sources (Google Earth Engine, Sentinel, Landsat)', 'ML fundamentals with PyTorch or TensorFlow'],
    skills: ['Python', 'GIS', 'Machine Learning', 'GeoPandas', 'PyTorch', 'Remote Sensing'],
    benefits: ['100% remote', 'Meaningful climate impact work', 'Research publication support', 'Flexible hours'],
    tags: ['ClimateAI', 'Climate Tech', 'GIS', 'Python', 'Remote', 'Sustainability'],
    remote: true,
    urgent: true,
    education: 'B.Tech / M.Sc in CS / Geography / Environmental Science / Statistics',
    experience: 'Fresher',
    companyLogo: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=100&h=100&fit=crop&crop=faces',
    status: 'active',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'f1010000-0000-0000-0000-000000000112',
    companyName: 'InMobi',
    title: 'AdTech & Programmatic Advertising Intern',
    type: 'Internship',
    location: 'Bangalore, India',
    stipend: '₹38,000/month',
    stipendAmount: 38000,
    duration: '6 months',
    description: 'Work on real-time bidding (RTB) systems, audience segmentation algorithms, and ML-powered creative optimization for InMobis global mobile advertising platform.',
    requirements: ['Strong Java or Python backend development skills', 'Understanding of REST APIs and distributed data processing', 'Interest in AdTech concepts (RTB, DSP/SSP, CPM/CPC)'],
    skills: ['Java', 'Python', 'Kafka', 'Spark', 'SQL', 'Machine Learning'],
    benefits: ['PPO opportunity', 'Global exposure across 200+ markets', 'Mentorship by AdTech experts', 'Meal allowance'],
    tags: ['InMobi', 'AdTech', 'Java', 'Programmatic', 'Machine Learning'],
    remote: false,
    urgent: false,
    education: 'B.Tech / BE in CS / IT',
    experience: 'Fresher',
    companyLogo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&h=100&fit=crop&crop=faces',
    status: 'active',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'f1010000-0000-0000-0000-000000000113',
    companyName: 'Magicpin',
    title: 'Supply Chain & Logistics Tech Intern',
    type: 'Internship',
    location: 'Delhi NCR, India',
    stipend: '₹20,000/month',
    stipendAmount: 20000,
    duration: '3 months',
    description: 'Build optimization algorithms for last-mile delivery routing, inventory forecasting models, and warehouse management dashboards for hyperlocal commerce.',
    requirements: ['Strong Python and data manipulation skills', 'Familiarity with optimization techniques (linear programming, greedy algorithms)', 'Interest in logistics, supply chain, or operations research'],
    skills: ['Python', 'SQL', 'Optimization', 'Pandas', 'Data Visualization', 'Excel'],
    benefits: ['Real-world logistics problem exposure', 'Certificate', 'Mentorship', 'Hybrid work option'],
    tags: ['Magicpin', 'Supply Chain', 'Logistics', 'Python', 'Optimization'],
    remote: false,
    urgent: false,
    education: 'B.Tech / BE / BBA / MBA (Operations)',
    experience: 'Fresher',
    companyLogo: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=100&h=100&fit=crop&crop=faces',
    status: 'active',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'f1010000-0000-0000-0000-000000000114',
    companyName: 'Niramai Health',
    title: 'Medical AI & Healthcare ML Intern',
    type: 'Internship',
    location: 'Bangalore, India',
    stipend: '₹30,000/month',
    stipendAmount: 30000,
    duration: '6 months',
    description: 'Apply deep learning and computer vision to build non-invasive early breast cancer screening models using thermal imaging — directly saving lives through AI.',
    requirements: ['Strong Python with PyTorch or TensorFlow', 'Knowledge of image segmentation and classification (CNNs, U-Net)', 'Interest in medical imaging and healthcare AI applications'],
    skills: ['Python', 'PyTorch', 'Computer Vision', 'Medical Imaging', 'Deep Learning', 'OpenCV'],
    benefits: ['Meaningful life-saving impact work', 'Research paper publication support', 'PPO opportunity', 'Mentorship by PhDs'],
    tags: ['Niramai', 'Healthcare AI', 'Medical Imaging', 'Deep Learning', 'Biotech'],
    remote: false,
    urgent: true,
    education: 'B.Tech / M.Tech / M.Sc in CS / Biomedical Engineering / AI',
    experience: 'Fresher',
    companyLogo: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=100&h=100&fit=crop&crop=faces',
    status: 'active',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'f1010000-0000-0000-0000-000000000115',
    companyName: 'SpotDraft',
    title: 'Legal Tech & Contract AI Intern',
    type: 'Internship',
    location: 'Remote',
    stipend: '₹26,000/month',
    stipendAmount: 26000,
    duration: '3 months',
    description: 'Build NLP-powered contract analysis tools, automated legal clause extraction pipelines, and intelligent document review workflows for SpotDrafts AI-first legal platform.',
    requirements: ['Python with NLP libraries (spaCy, HuggingFace Transformers)', 'Interest in legal technology or document AI', 'Good understanding of regex and text processing pipelines'],
    skills: ['Python', 'NLP', 'Transformers', 'spaCy', 'REST API', 'Git'],
    benefits: ['100% remote work', 'Exposure to cutting-edge legal AI', 'PPO opportunity', 'Flexible hours'],
    tags: ['SpotDraft', 'Legal Tech', 'NLP', 'AI', 'Remote', 'Contract AI'],
    remote: true,
    urgent: false,
    education: 'B.Tech / M.Tech / LLB with CS background / Any CS Graduate',
    experience: 'Fresher',
    companyLogo: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=100&h=100&fit=crop&crop=faces',
    status: 'active',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'f1010000-0000-0000-0000-000000000116',
    companyName: 'CRED',
    title: 'High-Throughput Backend & Payment Rails Intern',
    type: 'Internship',
    location: 'Bangalore, India',
    stipend: '₹50,000/month',
    stipendAmount: 50000,
    duration: '6 months',
    description: 'Work alongside CREDs platform engineering team building low-latency payment processing pipelines, transaction fraud detection, and distributed cache layers handling billions of rupees in credit transactions.',
    requirements: ['Proficiency in Golang, Java, or Node.js', 'Solid understanding of distributed systems, concurrency, and DB indexing', 'Familiarity with Kafka, Redis, or PostgreSQL'],
    skills: ['Go', 'Java', 'PostgreSQL', 'Kafka', 'Redis', 'Distributed Systems'],
    benefits: ['Highest tier stipend ₹50,000/mo', 'Full-time PPO package potential ₹25LPA+', 'Catered gourmet meals & gym', 'Apple MacBook Pro provided'],
    tags: ['CRED', 'FinTech', 'Backend', 'Go', 'High Throughput'],
    remote: false,
    urgent: true,
    education: 'B.Tech / BE in CS / IT',
    experience: 'Fresher',
    companyLogo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&h=100&fit=crop&crop=faces',
    status: 'active',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'f1010000-0000-0000-0000-000000000117',
    companyName: 'Swiggy',
    title: 'Instamart Quick-Commerce Operations & Tech Intern',
    type: 'Internship',
    location: 'Bangalore, India',
    stipend: '₹32,000/month',
    stipendAmount: 32000,
    duration: '4 months',
    description: 'Optimize 10-minute dark store picker algorithms, inventory stockout predictors, and real-time delivery slot dispatch systems across 500+ Swiggy Instamart pods.',
    requirements: ['Python, SQL, and data analysis capability', 'Experience with building dashboards in Metabase or Tableau is a plus', 'Strong problem solving and operational intuition'],
    skills: ['Python', 'SQL', 'Data Analytics', 'Operations Research', 'Supply Chain'],
    benefits: ['Swiggy One membership & meal coupons', 'Direct impact on millions of daily grocery orders', 'PPO consideration'],
    tags: ['Swiggy', 'Instamart', 'Quick Commerce', 'Analytics', 'Supply Chain'],
    remote: false,
    urgent: false,
    education: 'Any Graduate / B.Tech / MBA (Operations)',
    experience: 'Fresher',
    companyLogo: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=100&h=100&fit=crop&crop=faces',
    status: 'active',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'f1010000-0000-0000-0000-000000000118',
    companyName: 'Razorpay',
    title: 'Developer Platform & API Systems Intern',
    type: 'Internship',
    location: 'Bangalore, India',
    stipend: '₹42,000/month',
    stipendAmount: 42000,
    duration: '6 months',
    description: 'Design developer SDKs, webhook delivery infrastructure, and interactive API documentation for Razorpay payment gateway powering 8M+ businesses across India and Southeast Asia.',
    requirements: ['Strong coding foundation in Node.js, Python, or Go', 'Understanding of REST, Webhooks, and API security (OAuth, HMAC)', 'Empathy for developer experience and documentation'],
    skills: ['Node.js', 'REST API', 'Webhooks', 'Go', 'API Design', 'Git'],
    benefits: ['PPO Opportunity', 'Mentorship from India top FinTech architects', 'Medical insurance & wellness stipends', 'Hybrid flexibility'],
    tags: ['Razorpay', 'API', 'Developer Experience', 'FinTech', 'Payments'],
    remote: false,
    urgent: true,
    education: 'B.Tech / BE (CS / IT / ECE)',
    experience: 'Fresher',
    companyLogo: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=100&h=100&fit=crop&crop=faces',
    status: 'active',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'f1010000-0000-0000-0000-000000000119',
    companyName: 'Zomato',
    title: 'Restaurant Partner Growth & Performance Intern',
    type: 'Internship',
    location: 'Gurgaon, India',
    stipend: '₹28,000/month',
    stipendAmount: 28000,
    duration: '3 months',
    description: 'Analyze merchant menu conversion funnels, price elasticity, and ad campaigns for Zomatos dining and food delivery ecosystem spanning 300+ Indian cities.',
    requirements: ['Proficiency in SQL and MS Excel / Google Sheets', 'Strong communication and merchant relationship skills', 'Data-driven curiosity for consumer internet businesses'],
    skills: ['SQL', 'Excel', 'Data Analysis', 'Growth', 'Business Development'],
    benefits: ['Zomato Gold subscription', 'PPO opportunity', 'Vibrant campus culture & free meals', 'Certificate'],
    tags: ['Zomato', 'FoodTech', 'Growth', 'Analytics', 'Business'],
    remote: false,
    urgent: false,
    education: 'B.Com / BBA / B.Tech / Any Graduate',
    experience: 'Fresher',
    companyLogo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&h=100&fit=crop&crop=faces',
    status: 'active',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export class InternshipService {
  /**
   * Fetch active listings with optional filtering, search & pagination.
   * Merges database listings from Supabase, local recruiter custom listings,
   * and curated realistic listings so all opportunities are discoverable.
   */
  public static async fetchListings(params?: {
    search?: string;
    location?: string;
    minStipend?: number;
    skill?: string;
    remoteOnly?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ listings: InternshipListing[]; total: number }> {
    const page = params?.page || 1;
    const limit = params?.limit || 100;
    const from = (page - 1) * limit;

    let dbListings: InternshipListing[] = [];
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        dbListings = data.map(item => ({
          id: item.id,
          recruiterId: item.recruiter_id,
          companyName: item.company_name,
          title: item.title,
          type: item.type || 'Internship',
          location: item.location || 'Remote',
          stipend: item.stipend || '₹20,000/month',
          stipendAmount: Number(item.stipend_amount || 0),
          duration: item.duration || '3 months',
          description: item.description || '',
          requirements: item.requirements || [],
          skills: item.skills || [],
          benefits: item.benefits || [],
          tags: item.tags || [],
          remote: item.remote ?? true,
          urgent: item.urgent ?? false,
          education: item.education || 'Any degree',
          experience: item.experience || 'Fresher',
          companyLogo: item.company_logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop&crop=faces',
          status: item.status || 'active',
          createdAt: item.created_at,
          deadline: item.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch listings note:', err);
    }

    // Load any custom listings created by recruiters in local storage
    let customListings: InternshipListing[] = [];
    try {
      const customRaw = localStorage.getItem('interniq_custom_listings');
      if (customRaw) {
        customListings = JSON.parse(customRaw);
      }
    } catch (e) {}

    // Unified listing map keyed by listing ID to eliminate duplicates
    const listingMap = new Map<string, InternshipListing>();

    // 1. Add all curated/fallback realistic listings
    for (const item of FALLBACK_LISTINGS) {
      listingMap.set(item.id, item);
    }

    // 2. Add local custom listings
    for (const item of customListings) {
      listingMap.set(item.id, item);
    }

    // 3. Add Supabase database listings (they take precedence on ID collision)
    for (const item of dbListings) {
      listingMap.set(item.id, item);
    }

    let allListings = Array.from(listingMap.values());

    // Apply Filters Across Complete Unified Dataset
    if (params?.search && params.search.trim() !== '') {
      const s = params.search.toLowerCase().trim();
      allListings = allListings.filter(l => 
        l.title.toLowerCase().includes(s) || 
        l.companyName.toLowerCase().includes(s) || 
        l.description.toLowerCase().includes(s) ||
        l.skills.some(sk => sk.toLowerCase().includes(s)) ||
        l.tags.some(tag => tag.toLowerCase().includes(s))
      );
    }

    if (params?.location && params.location.trim() !== '') {
      const loc = params.location.toLowerCase().trim();
      allListings = allListings.filter(l => l.location.toLowerCase().includes(loc));
    }

    if (params?.remoteOnly) {
      allListings = allListings.filter(l => l.remote);
    }

    if (params?.minStipend && params.minStipend > 0) {
      allListings = allListings.filter(l => l.stipendAmount >= params.minStipend!);
    }

    if (params?.skill && params.skill.trim() !== '') {
      const skQuery = params.skill.toLowerCase().trim();
      allListings = allListings.filter(l => l.skills.some(sk => sk.toLowerCase().includes(skQuery)));
    }

    return {
      listings: allListings.slice(from, from + limit),
      total: allListings.length
    };
  }

  /**
   * Create a new internship listing (Recruiter action)
   */
  public static async createListing(listing: Partial<InternshipListing>): Promise<InternshipListing> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Must be logged in as a recruiter to post an internship.');
    }

    const newRow = {
      recruiter_id: session.user.id,
      company_name: listing.companyName,
      title: listing.title,
      type: listing.type || 'Internship',
      location: listing.location || 'Remote',
      stipend: listing.stipend || '₹20,000/month',
      stipend_amount: listing.stipendAmount || 20000,
      duration: listing.duration || '3 months',
      description: listing.description || '',
      requirements: listing.requirements || [],
      skills: listing.skills || [],
      benefits: listing.benefits || [],
      tags: listing.tags || [],
      remote: listing.remote ?? true,
      urgent: listing.urgent ?? false,
      education: listing.education || 'Any degree',
      experience: listing.experience || 'Fresher',
      company_logo: listing.companyLogo || '',
      status: 'active'
    };

    const { data, error } = await supabase
      .from('listings')
      .insert(newRow)
      .select()
      .single();

    if (error) {
      console.error('Error creating listing:', error);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      recruiterId: data.recruiter_id,
      companyName: data.company_name,
      title: data.title,
      type: data.type,
      location: data.location,
      stipend: data.stipend,
      stipendAmount: Number(data.stipend_amount),
      duration: data.duration,
      description: data.description,
      requirements: data.requirements,
      skills: data.skills,
      benefits: data.benefits,
      tags: data.tags,
      remote: data.remote,
      urgent: data.urgent,
      education: data.education,
      experience: data.experience,
      companyLogo: data.company_logo,
      status: data.status,
      createdAt: data.created_at,
      deadline: data.deadline
    };
  }

  /**
   * Submit student application (Strict RLS checked)
   */
  public static async applyToListing(listingId: string, coverLetter: string = '', resumeUrl: string = ''): Promise<Application> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Unauthenticated users cannot submit applications. Please log in first.');
    }

    const studentId = session.user.id;
    const userEmail = session.user.email || '';

    // Check local storage for duplicate
    const localAppsRaw = localStorage.getItem('interniq_all_applications');
    let localApps: Application[] = [];
    if (localAppsRaw) {
      try { localApps = JSON.parse(localAppsRaw); } catch (e) {}
    }

    const alreadyAppliedLocal = localApps.some(a => a.listingId === listingId && a.studentId === studentId);

    // Check existing application in Supabase
    try {
      const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('listing_id', listingId)
        .eq('student_id', studentId)
        .maybeSingle();

      if (existing || alreadyAppliedLocal) {
        throw new Error('You have already submitted an application for this internship.');
      }
    } catch (err: any) {
      if (err.message && err.message.includes('already submitted')) {
        throw err;
      }
    }

    let createdApp: Application | null = null;

    // Try Supabase insert
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          listing_id: listingId,
          student_id: studentId,
          status: 'applied',
          cover_letter: coverLetter,
          resume_url: resumeUrl
        })
        .select()
        .single();

      if (!error && data) {
        createdApp = {
          id: data.id,
          listingId: data.listing_id,
          studentId: data.student_id,
          status: data.status,
          coverLetter: data.cover_letter,
          resumeUrl: data.resume_url,
          appliedAt: data.applied_at,
          updatedAt: data.updated_at
        };
      } else if (error) {
        console.warn('Supabase application insert note:', error.message);
      }
    } catch (e) {
      console.warn('Supabase application exception note:', e);
    }

    // If Supabase insert failed (e.g. foreign key constraint for curated listings), create robust local record
    if (!createdApp) {
      const appId = `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      createdApp = {
        id: appId,
        listingId,
        studentId,
        status: 'applied',
        coverLetter,
        resumeUrl,
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    // Attach student profile info and persist in local storage cache
    try {
      let studentDetails: any = {
        id: studentId,
        name: session.user.user_metadata?.name || userEmail.split('@')[0] || 'Student',
        email: userEmail,
        skills: session.user.user_metadata?.skills || [],
        phone: session.user.user_metadata?.phone || ''
      };

      try {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', studentId).maybeSingle();
        if (prof) {
          studentDetails = {
            id: prof.id,
            name: prof.name || studentDetails.name,
            email: prof.email || studentDetails.email,
            avatarUrl: prof.avatar_url,
            skills: prof.skills || [],
            education: prof.education,
            phone: prof.phone
          };
        }
      } catch (e) {}

      createdApp.student = studentDetails;

      const updatedLocal = [...localApps.filter(a => a.id !== createdApp!.id), createdApp];
      localStorage.setItem('interniq_all_applications', JSON.stringify(updatedLocal));
    } catch (e) {}

    return createdApp;
  }

  /**
   * Fetch applications for student dashboard
   */
  public static async fetchStudentApplications(studentId: string): Promise<Application[]> {
    let dbApps: Application[] = [];
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          listing_id,
          student_id,
          status,
          cover_letter,
          resume_url,
          applied_at,
          updated_at,
          listings (*)
        `)
        .eq('student_id', studentId)
        .order('applied_at', { ascending: false });

      if (!error && data) {
        dbApps = data.map((item: any) => ({
          id: item.id,
          listingId: item.listing_id,
          studentId: item.student_id,
          status: item.status,
          coverLetter: item.cover_letter,
          resumeUrl: item.resume_url,
          appliedAt: item.applied_at,
          updatedAt: item.updated_at,
          listing: item.listings ? {
            id: item.listings.id,
            companyName: item.listings.company_name,
            title: item.listings.title,
            type: item.listings.type,
            location: item.listings.location,
            stipend: item.listings.stipend,
            stipendAmount: Number(item.listings.stipend_amount),
            duration: item.listings.duration,
            description: item.listings.description,
            requirements: item.listings.requirements || [],
            skills: item.listings.skills || [],
            benefits: item.listings.benefits || [],
            tags: item.listings.tags || [],
            remote: item.listings.remote,
            urgent: item.listings.urgent,
            education: item.listings.education,
            experience: item.listings.experience,
            companyLogo: item.listings.company_logo,
            status: item.listings.status,
            createdAt: item.listings.created_at,
            deadline: item.listings.deadline
          } : undefined
        }));
      }
    } catch (e) {}

    // Load local applications
    let localApps: Application[] = [];
    try {
      const raw = localStorage.getItem('interniq_all_applications');
      if (raw) {
        const all: Application[] = JSON.parse(raw);
        localApps = all.filter(a => a.studentId === studentId);
      }
    } catch (e) {}

    const appMap = new Map<string, Application>();
    for (const a of localApps) appMap.set(a.id, a);
    for (const a of dbApps) appMap.set(a.id, a);

    return Array.from(appMap.values());
  }

  /**
   * Fetch listings created by recruiter for recruiter dashboard
   */
  public static async fetchRecruiterListings(recruiterId: string): Promise<InternshipListing[]> {
    let dbListings: InternshipListing[] = [];
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          applications (id, status)
        `)
        .eq('recruiter_id', recruiterId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbListings = data.map((item: any) => ({
          id: item.id,
          recruiterId: item.recruiter_id,
          companyName: item.company_name,
          title: item.title,
          type: item.type,
          location: item.location,
          stipend: item.stipend,
          stipendAmount: Number(item.stipend_amount),
          duration: item.duration,
          description: item.description,
          requirements: item.requirements || [],
          skills: item.skills || [],
          benefits: item.benefits || [],
          tags: item.tags || [],
          remote: item.remote,
          urgent: item.urgent,
          education: item.education,
          experience: item.experience,
          companyLogo: item.company_logo,
          status: item.status,
          createdAt: item.created_at,
          deadline: item.deadline,
          applicantCount: Array.isArray(item.applications) ? item.applications.length : 0
        }));
      }
    } catch (err) {
      console.error('Error fetching recruiter listings:', err);
    }

    // Merge with local storage custom listings if any
    let customListings: InternshipListing[] = [];
    try {
      const raw = localStorage.getItem('interniq_custom_listings');
      if (raw) {
        const all: InternshipListing[] = JSON.parse(raw);
        customListings = all.filter(l => l.recruiterId === recruiterId);
      }
    } catch (e) {}

    // Attach local applicant counts if necessary
    let localApps: Application[] = [];
    try {
      const rawApps = localStorage.getItem('interniq_all_applications');
      if (rawApps) localApps = JSON.parse(rawApps);
    } catch (e) {}

    const map = new Map<string, InternshipListing>();
    for (const l of customListings) {
      const apps = localApps.filter(a => a.listingId === l.id);
      map.set(l.id, { ...l, applicantCount: apps.length });
    }
    for (const l of dbListings) {
      // Check if there are also local apps for this listing
      const localCount = localApps.filter(a => a.listingId === l.id).length;
      const count = Math.max(l.applicantCount || 0, localCount);
      map.set(l.id, { ...l, applicantCount: count });
    }

    return Array.from(map.values());
  }

  /**
   * Fetch applicants for a recruiter listing
   */
  public static async fetchApplicationsForListing(listingId: string): Promise<Application[]> {
    let dbApps: Application[] = [];
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          listing_id,
          student_id,
          status,
          cover_letter,
          resume_url,
          applied_at,
          updated_at,
          profiles (id, name, email, avatar_url, skills, education, phone)
        `)
        .eq('listing_id', listingId)
        .order('applied_at', { ascending: false });

      if (!error && data) {
        dbApps = data.map((item: any) => ({
          id: item.id,
          listingId: item.listing_id,
          studentId: item.student_id,
          status: item.status,
          coverLetter: item.cover_letter,
          resumeUrl: item.resume_url,
          appliedAt: item.applied_at,
          updatedAt: item.updated_at,
          student: item.profiles ? {
            id: item.profiles.id,
            name: item.profiles.name || 'Anonymous Student',
            email: item.profiles.email,
            avatarUrl: item.profiles.avatar_url,
            skills: item.profiles.skills || [],
            education: item.profiles.education,
            phone: item.profiles.phone
          } : undefined
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch applications note:', e);
    }

    // Merge with local storage applications
    let localApps: Application[] = [];
    try {
      const raw = localStorage.getItem('interniq_all_applications');
      if (raw) {
        const all: Application[] = JSON.parse(raw);
        localApps = all.filter(a => a.listingId === listingId);
      }
    } catch (e) {}

    const appMap = new Map<string, Application>();
    for (const a of localApps) appMap.set(a.id, a);
    for (const a of dbApps) appMap.set(a.id, a);

    return Array.from(appMap.values());
  }

  /**
   * Update application status (Recruiter action: applied / shortlisted / interviewed / rejected / selected)
   */
  public static async updateApplicationStatus(
    applicationId: string, 
    status: 'applied' | 'shortlisted' | 'interviewed' | 'rejected' | 'selected'
  ): Promise<void> {
    // Try Supabase update
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', applicationId);

      if (error) {
        console.warn('Supabase update application status note:', error.message);
      }
    } catch (e) {
      console.warn('Supabase application update exception:', e);
    }

    // Also update local storage fallback if application exists locally
    try {
      const raw = localStorage.getItem('interniq_all_applications');
      if (raw) {
        const all: Application[] = JSON.parse(raw);
        const updated = all.map(a => a.id === applicationId ? { ...a, status, updatedAt: new Date().toISOString() } : a);
        localStorage.setItem('interniq_all_applications', JSON.stringify(updated));
      }
    } catch (e) {}
  }

  /**
   * Update existing internship listing (Recruiter action)
   */
  public static async updateListing(listingId: string, updates: Partial<InternshipListing>): Promise<void> {
    const payload: any = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.companyName !== undefined) payload.company_name = updates.companyName;
    if (updates.location !== undefined) payload.location = updates.location;
    if (updates.stipend !== undefined) payload.stipend = updates.stipend;
    if (updates.stipendAmount !== undefined) payload.stipend_amount = updates.stipendAmount;
    if (updates.duration !== undefined) payload.duration = updates.duration;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.skills !== undefined) payload.skills = updates.skills;
    if (updates.requirements !== undefined) payload.requirements = updates.requirements;
    if (updates.status !== undefined) payload.status = updates.status;

    try {
      const { error } = await supabase
        .from('listings')
        .update(payload)
        .eq('id', listingId);

      if (error) {
        console.warn('Supabase update listing note:', error.message);
      }
    } catch (e) {}

    // Update local storage custom listings if present
    try {
      const raw = localStorage.getItem('interniq_custom_listings');
      if (raw) {
        const all: InternshipListing[] = JSON.parse(raw);
        const updated = all.map(l => l.id === listingId ? { ...l, ...updates } : l);
        localStorage.setItem('interniq_custom_listings', JSON.stringify(updated));
      }
    } catch (e) {}
  }

  /**
   * Toggle or update listing status (active / closed / flagged)
   */
  public static async updateListingStatus(listingId: string, status: 'active' | 'closed' | 'flagged'): Promise<void> {
    await this.updateListing(listingId, { status });
  }

  /**
   * Fetch Real Counts for Recruiter Top Stats Row
   */
  public static async fetchRecruiterStats(recruiterId: string): Promise<{
    activeListings: number;
    totalApplicants: number;
    shortlistedCandidates: number;
    positionsFilled: number;
  }> {
    const listings = await this.fetchRecruiterListings(recruiterId);
    const activeListings = listings.filter(l => l.status === 'active').length;

    let totalApplicants = 0;
    let shortlistedCandidates = 0;
    let positionsFilled = 0;

    for (const listing of listings) {
      const apps = await this.fetchApplicationsForListing(listing.id);
      totalApplicants += apps.length;
      for (const app of apps) {
        if (app.status === 'shortlisted' || app.status === 'interviewed') {
          shortlistedCandidates++;
        } else if (app.status === 'selected') {
          positionsFilled++;
        }
      }
    }

    return {
      activeListings,
      totalApplicants,
      shortlistedCandidates,
      positionsFilled
    };
  }
}

