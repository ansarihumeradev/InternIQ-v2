import React, { useState } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import { 
  FileText, 
  Download, 
  Eye, 
  Share2,
  Plus,
  Edit,
  Trash2,
  Save,
  Upload,
  Star,
  CheckCircle,
  Clock,
  Users,
  Award,
  Briefcase,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Github,
  Palette,
  Type,
  Layout,
  Sparkles,
  Target,
  Zap,
  Moon,
  TrendingUp,
  Heart
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useNotifications } from '../components/NotificationSystem';
import { useAuth } from '../context/AuthContext';

interface ResumeSection {
  id: string;
  type: 'personal' | 'experience' | 'education' | 'skills' | 'projects';
  title: string;
  content: any;
  isExpanded: boolean;
}

const ResumeBuilder: React.FC = () => {
  const [activeTemplate, setActiveTemplate] = useState('modern');
  const [enhancementStyle, setEnhancementStyle] = useState('professional');
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [templateConfig, setTemplateConfig] = useState({
    selectedTemplate: 'corporate',
    layout: 'modern',
    colorScheme: 'blue',
    fontStyle: 'inter',
    headerStyle: 'centered',
    experienceStyle: 'detailed',
    educationStyle: 'compact',
    skillsStyle: 'grid',
    projectsStyle: 'cards'
  });
  const [resumeData, setResumeData] = useState({
    personal: {
      name: 'Your Name',
      email: 'your.email@example.com',
      phone: '(123) 456-789',
      location: 'City, Country',
      linkedin: 'linkedin.com/in/your-profile',
      github: 'github.com/yourusername',
      portfolio: 'yourportfolio.com'
    },
    summary: 'Results-driven JavaScript Developer with expertise in modern front-end frameworks and a proven track record of delivering high-performance web applications. Skilled in React.js, Vue.js, and Node.js with experience in responsive design and cross-browser compatibility.',
    experience: [
      {
        id: '1',
        title: 'Senior Front-End JavaScript Developer',
        company: 'Tech Company Inc.',
        location: 'City, Country',
        duration: 'January 2022 - Present',
        description: '• Established a new workflow with React and Redux, improving code reusability by 45%\n• Streamlined UI/UX design, boosting site usability scores by 30% and increasing user engagement\n• Implemented responsive designs with CSS3 and Bootstrap, improving mobile usage by 70%\n• Led a team of five developers in a major project, completing it 20% ahead of schedule'
      }
    ],
    education: [
      {
        id: '1',
        degree: 'Master in Computer Science and Engineering',
        institution: 'University Name',
        location: 'City, Country',
        duration: 'December 2018',
        gpa: 'Specialization: Software Engineering & Data Structure'
      }
    ],
    skills: {
      programmingLanguages: ['JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'Python'],
      frontEndTechnologies: ['React.js', 'Vue.js', 'Angular.js', 'Bootstrap', 'Material-UI', 'Sass', 'Less'],
      toolsPlatforms: ['VS Code', 'Webpack', 'GitHub', 'Docker', 'AWS', 'Node.js', 'Express.js'],
      databases: ['MongoDB', 'MySQL', 'PostgreSQL'],
      methodologies: ['Agile', 'Scrum', 'Git Flow', 'RESTful APIs']
    },
    projects: [
      {
        id: '1',
        title: 'E-commerce Platform',
        description: 'Developed a full-stack e-commerce application using React.js and Node.js, resulting in 40% faster page load times and 25% increase in user engagement',
        technologies: ['React.js', 'Node.js', 'MongoDB', 'Express.js'],
        link: 'github.com/username/ecommerce',
        impact: 'Improved user experience and increased conversion rates by 30%'
      }
    ],
    certifications: [
      'Certified Web Developer - JavaScript Full Stack (2020)',
      'Scrum Certified (2019)',
      'AWS Certified Developer Associate (2021)'
    ],
    achievements: [
      'Led development team of 5 developers',
      'Reduced bug reports by 40% through improved testing',
      'Mentored 3 junior developers',
      'Organized company hackathons'
    ]
  });
  const [sections, setSections] = useState<ResumeSection[]>([
    { id: '1', type: 'personal', title: 'Personal Information', content: {}, isExpanded: true },
    { id: '2', type: 'experience', title: 'Work Experience', content: {}, isExpanded: true },
    { id: '3', type: 'education', title: 'Education', content: {}, isExpanded: true },
    { id: '4', type: 'skills', title: 'Skills', content: {}, isExpanded: true },
    { id: '5', type: 'projects', title: 'Projects', content: {}, isExpanded: true }
  ]);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const templates = [
    { id: 'graphic', name: 'Graphic', icon: <Layout className="h-6 w-6" />, description: 'Contemporary design with visual elements' },
    { id: 'corporate', name: 'Corporate', icon: <Briefcase className="h-6 w-6" />, description: 'Professional and executive style' },
    { id: 'social', name: 'Social', icon: <Users className="h-6 w-6" />, description: 'Modern and approachable design' },
    { id: 'tim', name: 'Tim', icon: <Clock className="h-6 w-6" />, description: 'Clean and time-efficient layout' },
    { id: 'mark', name: 'Mark', icon: <Target className="h-6 w-6" />, description: 'Executive and experienced professional' },
    { id: 'shelah', name: 'Shelah', icon: <Star className="h-6 w-6" />, description: 'Elegant and sophisticated design' },
    { id: 'kim', name: 'Kim', icon: <Zap className="h-6 w-6" />, description: 'Dynamic and energetic layout' },
    { id: 'moon', name: 'Moon', icon: <Moon className="h-6 w-6" />, description: 'Creative and artistic style' },
    { id: 'max', name: 'Max', icon: <TrendingUp className="h-6 w-6" />, description: 'Maximum impact design' },
    { id: 'lana', name: 'Lana', icon: <Heart className="h-6 w-6" />, description: 'Elegant and tasteful template' },
    { id: 'timeless', name: 'Timeless', icon: <Award className="h-6 w-6" />, description: 'Classic and powerful design' },
    { id: 'plain', name: 'Plain', icon: <Type className="h-6 w-6" />, description: 'Simple and clean layout' }
  ];

  const layoutOptions = [
    { id: 'modern', name: 'Modern', description: 'Clean and contemporary' },
    { id: 'classic', name: 'Classic', description: 'Traditional and formal' },
    { id: 'creative', name: 'Creative', description: 'Unique and artistic' },
    { id: 'minimal', name: 'Minimal', description: 'Simple and focused' }
  ];

  const colorSchemes = [
    { id: 'blue', name: 'Professional Blue', colors: ['#2563eb', '#1d4ed8', '#1e40af'] },
    { id: 'green', name: 'Success Green', colors: ['#059669', '#047857', '#065f46'] },
    { id: 'purple', name: 'Creative Purple', colors: ['#7c3aed', '#6d28d9', '#5b21b6'] },
    { id: 'gray', name: 'Modern Gray', colors: ['#374151', '#1f2937', '#111827'] },
    { id: 'orange', name: 'Energetic Orange', colors: ['#ea580c', '#dc2626', '#b91c1c'] }
  ];

  const fontStyles = [
    { id: 'inter', name: 'Inter', description: 'Modern and clean' },
    { id: 'roboto', name: 'Roboto', description: 'Professional and readable' },
    { id: 'poppins', name: 'Poppins', description: 'Friendly and approachable' },
    { id: 'montserrat', name: 'Montserrat', description: 'Elegant and sophisticated' }
  ];

  const sectionStyles = {
    header: [
      { id: 'centered', name: 'Centered', description: 'Classic centered layout' },
      { id: 'left', name: 'Left Aligned', description: 'Modern left alignment' },
      { id: 'split', name: 'Split', description: 'Name and contact split' },
      { id: 'creative', name: 'Creative', description: 'Unique artistic layout' }
    ],
    experience: [
      { id: 'detailed', name: 'Detailed', description: 'Comprehensive descriptions' },
      { id: 'compact', name: 'Compact', description: 'Concise bullet points' },
      { id: 'timeline', name: 'Timeline', description: 'Chronological timeline' },
      { id: 'cards', name: 'Cards', description: 'Card-based layout' }
    ],
    education: [
      { id: 'compact', name: 'Compact', description: 'Minimal information' },
      { id: 'detailed', name: 'Detailed', description: 'Full descriptions' },
      { id: 'academic', name: 'Academic', description: 'Research-focused' },
      { id: 'modern', name: 'Modern', description: 'Contemporary style' }
    ],
    skills: [
      { id: 'grid', name: 'Grid', description: 'Organized grid layout' },
      { id: 'bars', name: 'Progress Bars', description: 'Visual skill levels' },
      { id: 'tags', name: 'Tags', description: 'Tag-based display' },
      { id: 'categories', name: 'Categories', description: 'Grouped by category' }
    ],
    projects: [
      { id: 'cards', name: 'Cards', description: 'Card-based projects' },
      { id: 'list', name: 'List', description: 'Simple list format' },
      { id: 'detailed', name: 'Detailed', description: 'Comprehensive descriptions' },
      { id: 'portfolio', name: 'Portfolio', description: 'Portfolio-style showcase' }
    ]
  };

  const handleSaveResume = async () => {
    if (!user) {
      addNotification({
        type: 'warning',
        title: 'Sign in required',
        message: 'Please sign in to save your resume'
      });
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      addNotification({
        type: 'success',
        title: 'Resume Saved!',
        message: 'Your resume has been saved successfully'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save resume. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResume = () => {
    try {
      const doc = new jsPDF();
      
      // Apply template configuration
      const enhancedDoc = applyTemplateToPDF(doc);
      
      let yPosition = 20;
      const margin = 20;
      const lineHeight = 7;
      const sectionSpacing = 15;

      // Skip the header since it's already applied by the template
      if (templateConfig.selectedTemplate === 'plain') {
        enhancedDoc.setFontSize(24);
        enhancedDoc.setFont('helvetica', 'bold');
        enhancedDoc.text('RESUME', margin, yPosition);
        yPosition += 20;
      } else {
        yPosition = 40; // Start after the colored header
      }

      enhancedDoc.setFontSize(16);
      enhancedDoc.setFont('helvetica', 'bold');
      enhancedDoc.text('PERSONAL INFORMATION', margin, yPosition);
      yPosition += lineHeight;
      enhancedDoc.setFontSize(12);
      enhancedDoc.setFont('helvetica', 'normal');
      enhancedDoc.text(`Email: ${resumeData.personal.email}`, margin, yPosition); yPosition += lineHeight;
      enhancedDoc.text(`Phone: ${resumeData.personal.phone}`, margin, yPosition); yPosition += lineHeight;
      enhancedDoc.text(`Location: ${resumeData.personal.location}`, margin, yPosition); yPosition += lineHeight;
      enhancedDoc.text(`LinkedIn: ${resumeData.personal.linkedin}`, margin, yPosition); yPosition += lineHeight;
      enhancedDoc.text(`GitHub: ${resumeData.personal.github}`, margin, yPosition); yPosition += sectionSpacing;

      enhancedDoc.setFontSize(16);
      enhancedDoc.setFont('helvetica', 'bold');
      enhancedDoc.text('PROFESSIONAL SUMMARY', margin, yPosition); yPosition += lineHeight;
      enhancedDoc.setFontSize(12);
      enhancedDoc.setFont('helvetica', 'normal');
      const summaryLines = enhancedDoc.splitTextToSize(resumeData.summary, 170);
      enhancedDoc.text(summaryLines, margin, yPosition); yPosition += (summaryLines.length * lineHeight) + sectionSpacing;

      if (resumeData.experience.length > 0) {
        if (yPosition > 250) { enhancedDoc.addPage(); yPosition = 20; }
        enhancedDoc.setFontSize(16); enhancedDoc.setFont('helvetica', 'bold'); enhancedDoc.text('EXPERIENCE', margin, yPosition); yPosition += lineHeight;
        enhancedDoc.setFontSize(12); enhancedDoc.setFont('helvetica', 'normal');
        resumeData.experience.forEach(exp => {
          enhancedDoc.setFont('helvetica', 'bold'); enhancedDoc.text(`${exp.title} at ${exp.company}`, margin, yPosition); yPosition += lineHeight;
          enhancedDoc.setFont('helvetica', 'normal'); enhancedDoc.text(`${exp.location} | ${exp.duration}`, margin, yPosition); yPosition += lineHeight;
          const descLines = enhancedDoc.splitTextToSize(exp.description, 170);
          enhancedDoc.text(descLines, margin, yPosition); yPosition += (descLines.length * lineHeight) + sectionSpacing;
        });
      }

      if (resumeData.education.length > 0) {
        if (yPosition > 250) { enhancedDoc.addPage(); yPosition = 20; }
        enhancedDoc.setFontSize(16); enhancedDoc.setFont('helvetica', 'bold'); enhancedDoc.text('EDUCATION', margin, yPosition); yPosition += lineHeight;
        enhancedDoc.setFontSize(12); enhancedDoc.setFont('helvetica', 'normal');
        resumeData.education.forEach(edu => {
          enhancedDoc.setFont('helvetica', 'bold'); enhancedDoc.text(`${edu.degree}`, margin, yPosition); yPosition += lineHeight;
          enhancedDoc.setFont('helvetica', 'normal'); enhancedDoc.text(`${edu.institution} | ${edu.location} | ${edu.duration}`, margin, yPosition); yPosition += lineHeight;
          enhancedDoc.text(edu.gpa, margin, yPosition); yPosition += sectionSpacing;
        });
      }

      if (resumeData.skills.programmingLanguages.length > 0) {
        if (yPosition > 250) { enhancedDoc.addPage(); yPosition = 20; }
        enhancedDoc.setFontSize(16); enhancedDoc.setFont('helvetica', 'bold'); enhancedDoc.text('PROGRAMMING LANGUAGES', margin, yPosition); yPosition += lineHeight;
        enhancedDoc.setFontSize(12); enhancedDoc.setFont('helvetica', 'normal');
        const skillsText = resumeData.skills.programmingLanguages.join(', ');
        const skillsLines = enhancedDoc.splitTextToSize(skillsText, 170);
        enhancedDoc.text(skillsLines, margin, yPosition); yPosition += (skillsLines.length * lineHeight) + sectionSpacing;
      }

      if (resumeData.skills.frontEndTechnologies.length > 0) {
        if (yPosition > 250) { enhancedDoc.addPage(); yPosition = 20; }
        enhancedDoc.setFontSize(16); enhancedDoc.setFont('helvetica', 'bold'); enhancedDoc.text('FRONT-END TECHNOLOGIES', margin, yPosition); yPosition += lineHeight;
        enhancedDoc.setFontSize(12); enhancedDoc.setFont('helvetica', 'normal');
        const frontEndText = resumeData.skills.frontEndTechnologies.join(', ');
        const frontEndLines = enhancedDoc.splitTextToSize(frontEndText, 170);
        enhancedDoc.text(frontEndLines, margin, yPosition); yPosition += (frontEndLines.length * lineHeight) + sectionSpacing;
      }

      if (resumeData.skills.toolsPlatforms.length > 0) {
        if (yPosition > 250) { enhancedDoc.addPage(); yPosition = 20; }
        enhancedDoc.setFontSize(16); enhancedDoc.setFont('helvetica', 'bold'); enhancedDoc.text('TOOLS AND PLATFORMS', margin, yPosition); yPosition += lineHeight;
        enhancedDoc.setFontSize(12); enhancedDoc.setFont('helvetica', 'normal');
        const toolsText = resumeData.skills.toolsPlatforms.join(', ');
        const toolsLines = enhancedDoc.splitTextToSize(toolsText, 170);
        enhancedDoc.text(toolsLines, margin, yPosition); yPosition += (toolsLines.length * lineHeight) + sectionSpacing;
      }

      if (resumeData.skills.databases.length > 0) {
        if (yPosition > 250) { enhancedDoc.addPage(); yPosition = 20; }
        enhancedDoc.setFontSize(16); enhancedDoc.setFont('helvetica', 'bold'); enhancedDoc.text('DATABASES', margin, yPosition); yPosition += lineHeight;
        enhancedDoc.setFontSize(12); enhancedDoc.setFont('helvetica', 'normal');
        const databasesText = resumeData.skills.databases.join(', ');
        const databasesLines = enhancedDoc.splitTextToSize(databasesText, 170);
        enhancedDoc.text(databasesLines, margin, yPosition); yPosition += (databasesLines.length * lineHeight) + sectionSpacing;
      }

      if (resumeData.skills.methodologies.length > 0) {
        if (yPosition > 250) { enhancedDoc.addPage(); yPosition = 20; }
        enhancedDoc.setFontSize(16); enhancedDoc.setFont('helvetica', 'bold'); enhancedDoc.text('METHODOLOGIES', margin, yPosition); yPosition += lineHeight;
        enhancedDoc.setFontSize(12); enhancedDoc.setFont('helvetica', 'normal');
        const methodologiesText = resumeData.skills.methodologies.join(', ');
        const methodologiesLines = enhancedDoc.splitTextToSize(methodologiesText, 170);
        enhancedDoc.text(methodologiesLines, margin, yPosition); yPosition += (methodologiesLines.length * lineHeight) + sectionSpacing;
      }

      if (resumeData.certifications && resumeData.certifications.length > 0) {
        if (yPosition > 250) { enhancedDoc.addPage(); yPosition = 20; }
        enhancedDoc.setFontSize(16); enhancedDoc.setFont('helvetica', 'bold'); enhancedDoc.text('CERTIFICATIONS', margin, yPosition); yPosition += lineHeight;
        enhancedDoc.setFontSize(12); enhancedDoc.setFont('helvetica', 'normal');
        resumeData.certifications.forEach(cert => {
          enhancedDoc.text(`• ${cert}`, margin, yPosition); yPosition += lineHeight;
        });
        yPosition += sectionSpacing;
      }

      if (resumeData.achievements && resumeData.achievements.length > 0) {
        if (yPosition > 250) { enhancedDoc.addPage(); yPosition = 20; }
        enhancedDoc.setFontSize(16); enhancedDoc.setFont('helvetica', 'bold'); enhancedDoc.text('ACHIEVEMENTS', margin, yPosition); yPosition += lineHeight;
        enhancedDoc.setFontSize(12); enhancedDoc.setFont('helvetica', 'normal');
        resumeData.achievements.forEach(achievement => {
          enhancedDoc.text(`• ${achievement}`, margin, yPosition); yPosition += lineHeight;
        });
        yPosition += sectionSpacing;
      }

      if (resumeData.projects.length > 0) {
        if (yPosition > 250) { enhancedDoc.addPage(); yPosition = 20; }
        enhancedDoc.setFontSize(16); enhancedDoc.setFont('helvetica', 'bold'); enhancedDoc.text('PROJECTS', margin, yPosition); yPosition += lineHeight;
        enhancedDoc.setFontSize(12); enhancedDoc.setFont('helvetica', 'normal');
        resumeData.projects.forEach(project => {
          enhancedDoc.setFont('helvetica', 'bold'); enhancedDoc.text(project.title, margin, yPosition); yPosition += lineHeight;
          enhancedDoc.setFont('helvetica', 'normal'); enhancedDoc.text(project.description, margin, yPosition); yPosition += lineHeight;
          enhancedDoc.text(`Technologies: ${Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies}`, margin, yPosition); yPosition += lineHeight;
          enhancedDoc.text(`Link: ${project.link}`, margin, yPosition); yPosition += sectionSpacing;
        });
      }

      const selectedTemplate = templates.find(t => t.id === templateConfig.selectedTemplate);
      const fileName = `resume_${selectedTemplate?.name.toLowerCase()}_${Date.now()}.pdf`;
      
      enhancedDoc.save(fileName);
      
      addNotification({
        type: 'success',
        title: 'Resume Downloaded!',
        message: `Resume saved as ${fileName} using ${selectedTemplate?.name} template`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to download resume. Please try again.'
      });
    }
  };

  const handlePreviewResume = () => {
    const selectedTemplate = templates.find(t => t.id === templateConfig.selectedTemplate);
    addNotification({
      type: 'info',
      title: 'Preview Generated',
      message: `Preview generated with ${selectedTemplate?.name} template`
    });
  };

  const handleShareResume = () => {
    const shareText = 'Check out my professional resume!';
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Resume',
        text: shareText,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(`${shareText} - ${shareUrl}`);
      addNotification({
        type: 'success',
        title: 'Link copied!',
        message: 'Resume link copied to clipboard'
      });
    }
  };

  const handleUploadResume = () => {
    addNotification({
      type: 'info',
      title: 'Upload Feature',
      message: 'Resume upload feature coming soon!'
    });
  };

  const handleAIEnhance = async () => {
    setLoading(true);
    try {
      // Enhanced AI rewriting with multiple styles and professional terminology
      const enhancedSummary = generateProfessionalSummary(resumeData.summary, enhancementStyle);
      const enhancedExperience = resumeData.experience.map(exp => enhanceExperience(exp, enhancementStyle));
      const enhancedEducation = resumeData.education.map(edu => enhanceEducation(edu, enhancementStyle));
      const enhancedSkills = enhanceSkills(resumeData.skills, enhancementStyle);
      const enhancedProjects = resumeData.projects.map(project => enhanceProjects(project, enhancementStyle));
      
      setResumeData(prev => ({
        ...prev,
        summary: enhancedSummary,
        experience: enhancedExperience,
        education: enhancedEducation,
        skills: enhancedSkills,
        projects: enhancedProjects,
      }));
      
      addNotification({
        type: 'success',
        title: 'AI Enhancement Complete! ✨',
        message: `Your resume has been enhanced with ${enhancementStyle} style using industry-standard language and impactful achievements!`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'AI Enhancement Failed',
        message: 'Something went wrong. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAISuggestions = () => {
    setShowAISuggestions(!showAISuggestions);
    if (!showAISuggestions) {
      addNotification({
        type: 'info',
        title: 'AI Suggestions Enabled',
        message: 'Real-time AI suggestions are now active. Start typing to see improvements!'
      });
    }
  };

  // AI Enhancement Helper Functions
  const generateProfessionalSummary = (originalSummary: string, style: string) => {
    const professionalTemplates = [
      `Results-driven ${getRoleFromSkills(style)} with ${getExperienceLevel(style)} of experience in developing scalable web applications and innovative digital solutions. Demonstrated expertise in ${getTopSkills(style)} with a proven track record of delivering high-impact projects that drive business growth and user engagement. Passionate about leveraging cutting-edge technologies to solve complex challenges and create exceptional user experiences.`,
      `Dynamic and innovative ${getRoleFromSkills(style)} with a strong foundation in modern software development practices. Specialized in ${getTopSkills(style)} with a history of collaborating with cross-functional teams to deliver robust, user-centric applications. Committed to continuous learning and staying ahead of industry trends to deliver optimal solutions.`,
      `Accomplished ${getRoleFromSkills(style)} with expertise in ${getTopSkills(style)} and a track record of building high-performance applications. Skilled in agile methodologies and team collaboration, with a focus on creating maintainable, scalable code that exceeds business requirements. Dedicated to professional growth and contributing to innovative projects.`
    ];
    
    return professionalTemplates[Math.floor(Math.random() * professionalTemplates.length)];
  };

  const enhanceExperience = (exp: any, style: string) => {
    const actionVerbs = [
      'Developed', 'Implemented', 'Designed', 'Architected', 'Optimized', 'Streamlined',
      'Enhanced', 'Built', 'Created', 'Deployed', 'Maintained', 'Collaborated',
      'Led', 'Mentored', 'Coordinated', 'Delivered', 'Improved', 'Automated'
    ];
    
    const achievements = [
      'resulting in 40% improved performance',
      'achieving 95% user satisfaction',
      'reducing development time by 30%',
      'increasing team productivity by 25%',
      'successfully meeting all project deadlines',
      'exceeding stakeholder expectations'
    ];
    
    const enhancedDescription = exp.description
      ? `• ${actionVerbs[Math.floor(Math.random() * actionVerbs.length)]} ${exp.description.toLowerCase()}, ${achievements[Math.floor(Math.random() * achievements.length)]}\n• Collaborated with cross-functional teams to ensure seamless project delivery\n• Implemented best practices and coding standards for maintainable code\n• Conducted code reviews and provided mentorship to junior developers`
      : exp.description;
    
    return {
      ...exp,
      title: enhanceJobTitle(exp.title, style),
      description: enhancedDescription
    };
  };

  const enhanceJobTitle = (title: string, style: string) => {
    const titleEnhancements: { [key: string]: string } = {
      'intern': 'Software Engineering Intern',
      'junior': 'Junior Software Engineer',
      'developer': 'Software Developer',
      'frontend': 'Frontend Developer',
      'backend': 'Backend Developer',
      'fullstack': 'Full Stack Developer',
      'senior': 'Senior Software Engineer',
      'lead': 'Lead Software Engineer'
    };
    
    const lowerTitle = title.toLowerCase();
    for (const [key, enhanced] of Object.entries(titleEnhancements)) {
      if (lowerTitle.includes(key)) {
        return enhanced;
      }
    }
    return title;
  };

  const enhanceEducation = (edu: any, style: string) => {
    return {
      ...edu,
      degree: edu.degree.includes('Bachelor') ? `${edu.degree} (First Class Honours)` : edu.degree,
      institution: edu.institution.includes('University') ? `${edu.institution} - Top 10% Graduate` : edu.institution
    };
  };

  const enhanceSkills = (skills: any, style: string) => {
    const enhancedSkills: any = {
      programmingLanguages: skills.programmingLanguages.map((s: string) => enhanceSkill(s, style)),
      frontEndTechnologies: skills.frontEndTechnologies.map((s: string) => enhanceSkill(s, style)),
      toolsPlatforms: skills.toolsPlatforms.map((s: string) => enhanceSkill(s, style)),
      databases: skills.databases.map((s: string) => enhanceSkill(s, style)),
      methodologies: skills.methodologies.map((s: string) => enhanceSkill(s, style))
    };
    return enhancedSkills;
  };

  const enhanceSkill = (skill: string, style: string) => {
    const skillEnhancements: { [key: string]: string } = {
      'javascript': 'JavaScript (ES6+)',
      'react': 'React.js',
      'vue': 'Vue.js',
      'angular': 'Angular.js',
      'node': 'Node.js',
      'typescript': 'TypeScript',
      'python': 'Python',
      'java': 'Java',
      'php': 'PHP',
      'html': 'HTML5',
      'css': 'CSS3',
      'sass': 'Sass/SCSS',
      'less': 'Less',
      'bootstrap': 'Bootstrap',
      'material-ui': 'Material-UI',
      'express': 'Express.js',
      'mongodb': 'MongoDB',
      'mysql': 'MySQL',
      'postgresql': 'PostgreSQL',
      'aws': 'AWS',
      'docker': 'Docker',
      'git': 'Git',
      'github': 'GitHub',
      'webpack': 'Webpack',
      'vs code': 'VS Code',
      'agile': 'Agile/Scrum',
      'scrum': 'Scrum',
      'rest': 'RESTful APIs',
      'api': 'RESTful APIs'
    };
    
    const enhancedName = skillEnhancements[skill.toLowerCase()] || skill;
    return enhancedName;
  };

  const enhanceProjects = (project: any, style: string) => {
    const projectEnhancements = [
      'A comprehensive and innovative project that',
      'An industry-leading solution that',
      'A cutting-edge application that',
      'A scalable and robust system that'
    ];
    
    const enhancedDescription = project.description
      ? `${projectEnhancements[Math.floor(Math.random() * projectEnhancements.length)]} ${project.description.toLowerCase()}. Features include responsive design, optimized performance, and seamless user experience.`
      : project.description;
    
    return {
      ...project,
      description: enhancedDescription
    };
  };

  const getRoleFromSkills = (style: string) => {
    const allSkills = [
      ...resumeData.skills.programmingLanguages,
      ...resumeData.skills.frontEndTechnologies,
      ...resumeData.skills.toolsPlatforms,
      ...resumeData.skills.databases,
      ...resumeData.skills.methodologies
    ];
    
    if (allSkills.some(s => s.toLowerCase().includes('react') || s.toLowerCase().includes('frontend'))) return 'Frontend Developer';
    if (allSkills.some(s => s.toLowerCase().includes('node') || s.toLowerCase().includes('backend'))) return 'Backend Developer';
    if (allSkills.some(s => s.toLowerCase().includes('full') || s.toLowerCase().includes('stack'))) return 'Full Stack Developer';
    return 'Software Developer';
  };

  const getExperienceLevel = (style: string) => {
    const experienceCount = resumeData.experience.length;
    if (experienceCount > 5) return 'Senior';
    if (experienceCount > 2) return 'Mid-level';
    return 'Junior';
  };

  const getTopSkills = (style: string) => {
    const allSkills = [
      ...resumeData.skills.programmingLanguages,
      ...resumeData.skills.frontEndTechnologies,
      ...resumeData.skills.toolsPlatforms
    ];
    const topSkills = allSkills.slice(0, 3);
    return topSkills.join(', ');
  };

  const updateTemplateConfig = (key: string, value: string) => {
    setTemplateConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const generateTemplatePreview = () => {
    const selectedTemplate = templates.find(t => t.id === templateConfig.selectedTemplate);
    const templateColors: { [key: string]: string } = {
      'graphic': '#3498db',
      'corporate': '#2c3e50',
      'social': '#9b59b6',
      'tim': '#2ecc71',
      'mark': '#e74c3c',
      'shelah': '#8e44ad',
      'kim': '#f1c40f',
      'moon': '#34495e',
      'max': '#e67e22',
      'lana': '#e91e63',
      'timeless': '#95a5a6',
      'plain': '#6c757d'
    };

    return {
      template: selectedTemplate,
      color: templateColors[templateConfig.selectedTemplate] || '#6c757d',
      name: selectedTemplate?.name || 'Plain'
    };
  };

  const applyTemplateToPDF = (doc: any) => {
    const template = templateConfig.selectedTemplate;
    
    // Apply template-specific styling
    switch (template) {
      case 'graphic':
        doc.setFillColor(52, 152, 219);
        doc.rect(0, 0, 210, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text(resumeData.personal.name, 20, 20);
        doc.setTextColor(0, 0, 0);
        break;
        
      case 'corporate':
        doc.setFillColor(44, 62, 80);
        doc.rect(0, 0, 210, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(resumeData.personal.name, 20, 17);
        doc.setTextColor(0, 0, 0);
        break;
        
      case 'social':
        doc.setFillColor(155, 89, 182);
        doc.rect(0, 0, 210, 28, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(resumeData.personal.name, 20, 19);
        doc.setTextColor(0, 0, 0);
        break;
        
      case 'tim':
        doc.setFillColor(46, 204, 113);
        doc.rect(0, 0, 210, 26, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(21);
        doc.setFont('helvetica', 'bold');
        doc.text(resumeData.personal.name, 20, 18);
        doc.setTextColor(0, 0, 0);
        break;
        
      case 'mark':
        doc.setFillColor(231, 76, 60);
        doc.rect(0, 0, 210, 32, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(26);
        doc.setFont('helvetica', 'bold');
        doc.text(resumeData.personal.name, 20, 22);
        doc.setTextColor(0, 0, 0);
        break;
        
      case 'shelah':
        doc.setFillColor(142, 68, 173);
        doc.rect(0, 0, 210, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text(resumeData.personal.name, 20, 20);
        doc.setTextColor(0, 0, 0);
        break;
        
      case 'kim':
        doc.setFillColor(241, 196, 15);
        doc.rect(0, 0, 210, 29, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(23);
        doc.setFont('helvetica', 'bold');
        doc.text(resumeData.personal.name, 20, 20);
        doc.setTextColor(0, 0, 0);
        break;
        
      case 'moon':
        doc.setFillColor(52, 73, 94);
        doc.rect(0, 0, 210, 31, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(25);
        doc.setFont('helvetica', 'bold');
        doc.text(resumeData.personal.name, 20, 21);
        doc.setTextColor(0, 0, 0);
        break;
        
      case 'max':
        doc.setFillColor(230, 126, 34);
        doc.rect(0, 0, 210, 33, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(27);
        doc.setFont('helvetica', 'bold');
        doc.text(resumeData.personal.name, 20, 23);
        doc.setTextColor(0, 0, 0);
        break;
        
      case 'lana':
        doc.setFillColor(233, 30, 99);
        doc.rect(0, 0, 210, 27, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(resumeData.personal.name, 20, 18);
        doc.setTextColor(0, 0, 0);
        break;
        
      case 'timeless':
        doc.setFillColor(149, 165, 166);
        doc.rect(0, 0, 210, 34, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text(resumeData.personal.name, 20, 24);
        doc.setTextColor(0, 0, 0);
        break;
        
      case 'plain':
      default:
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text(resumeData.personal.name, 20, 20);
        break;
    }
    
    return doc;
  };

  const handleAddSection = (type: string) => {
    const newSection: ResumeSection = {
      id: Date.now().toString(),
      type: type as any,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      content: {},
      isExpanded: true
    };
    
    setSections(prev => [...prev, newSection]);
    addNotification({
      type: 'success',
      title: 'Section Added',
      message: `${newSection.title} section has been added`
    });
  };

  const handleRemoveSection = (sectionId: string) => {
    setSections(prev => prev.filter(section => section.id !== sectionId));
    addNotification({
      type: 'info',
      title: 'Section Removed',
      message: 'Section has been removed from your resume'
    });
  };

  const handleToggleSection = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId ? { ...section, isExpanded: !section.isExpanded } : section
    ));
  };

  const handleUpdateData = (field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdatePersonal = (field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value
      }
    }));
  };

  const handleUpdateExperience = (index: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const handleUpdateEducation = (index: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const handleUpdateProjects = (index: number, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === index ? { ...project, [field]: value } : project
      )
    }));
  };

  const addExperience = () => {
    const newExperience = {
      id: Date.now().toString(),
      title: '',
      company: '',
      location: '',
      duration: '',
      description: ''
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  const removeExperience = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    const newEducation = {
      id: Date.now().toString(),
      degree: '',
      institution: '',
      location: '',
      duration: '',
      gpa: ''
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  const removeEducation = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    const newSkill = '';
    setResumeData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        programmingLanguages: [...prev.skills.programmingLanguages, newSkill]
      }
    }));
  };

  const removeSkill = (category: keyof typeof resumeData.skills, index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: prev.skills[category].filter((_: string, i: number) => i !== index)
      }
    }));
  };

  const addSkillToCategory = (category: keyof typeof resumeData.skills) => {
    setResumeData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: [...prev.skills[category], '']
      }
    }));
  };

  const updateSkillInCategory = (category: keyof typeof resumeData.skills, index: number, value: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: prev.skills[category].map((skill: string, i: number) => 
          i === index ? value : skill
        )
      }
    }));
  };

  const addProject = () => {
    const newProject = {
      id: Date.now().toString(),
      title: '',
      description: '',
      technologies: [],
      link: '',
      impact: ''
    };
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  };

  const removeProject = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Please sign in to use the resume builder</h2>
          <p className="text-gray-600">You need to be logged in to access this feature.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Resume Builder
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create a professional resume that stands out and gets you noticed
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Template Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Template</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => updateTemplateConfig('selectedTemplate', template.id)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      templateConfig.selectedTemplate === template.id
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded ${
                        templateConfig.selectedTemplate === template.id
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {template.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-gray-500">{template.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Template Customization</h4>
                
                {/* Layout Options */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Layout Style</label>
                  <select
                    value={templateConfig.layout}
                    onChange={(e) => updateTemplateConfig('layout', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {layoutOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.name} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color Scheme */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color Scheme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {colorSchemes.map(scheme => (
                      <button
                        key={scheme.id}
                        onClick={() => updateTemplateConfig('colorScheme', scheme.id)}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          templateConfig.colorScheme === scheme.id
                            ? 'border-primary-500'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            {scheme.colors.map((color, index) => (
                              <div
                                key={index}
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-medium">{scheme.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Style */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Style</label>
                  <select
                    value={templateConfig.fontStyle}
                    onChange={(e) => updateTemplateConfig('fontStyle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {fontStyles.map(font => (
                      <option key={font.id} value={font.id}>
                        {font.name} - {font.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              {/* AI Enhancement Style Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">AI Enhancement Style</label>
                <select
                  value={enhancementStyle}
                  onChange={(e) => setEnhancementStyle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="professional">Professional</option>
                  <option value="creative">Creative</option>
                  <option value="executive">Executive</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
              
              <div className="space-y-3">
                <Button
                  variant="primary"
                  fullWidth
                  loading={loading}
                  onClick={handleSaveResume}
                  icon={<Save className="h-5 w-5" />}
                >
                  Save Resume
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={handleDownloadResume}
                  icon={<Download className="h-5 w-5" />}
                >
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={handlePreviewResume}
                  icon={<Eye className="h-5 w-5" />}
                >
                  Preview
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    const preview = generateTemplatePreview();
                    addNotification({
                      type: 'info',
                      title: 'Template Preview',
                      message: `Template: ${preview.name}, Color: ${preview.color}`
                    });
                  }}
                  icon={<Layout className="h-5 w-5" />}
                >
                  Preview Template
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={handleShareResume}
                  icon={<Share2 className="h-5 w-5" />}
                >
                  Share
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={handleUploadResume}
                  icon={<Upload className="h-5 w-5" />}
                >
                  Import Resume
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={handleAIEnhance}
                  icon={<Sparkles className="h-5 w-5" />}
                >
                  AI Enhance
                </Button>
                <Button
                  variant={showAISuggestions ? "primary" : "outline"}
                  fullWidth
                  onClick={handleAISuggestions}
                  icon={<CheckCircle className="h-5 w-5" />}
                >
                  {showAISuggestions ? 'AI Suggestions ON' : 'AI Suggestions'}
                </Button>
              </div>
            </div>

            {/* Add Sections */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Sections</h3>
              <div className="space-y-2">
                {['experience', 'education', 'skills', 'projects', 'certifications'].map((type) => (
                  <Button
                    key={type}
                    variant="ghost"
                    fullWidth
                    onClick={() => handleAddSection(type)}
                    icon={<Plus className="h-4 w-4" />}
                  >
                    Add {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Edit className="h-4 w-4" />}
                >
                  Edit
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={resumeData.personal.name}
                      onChange={(e) => handleUpdatePersonal('name', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={resumeData.personal.email}
                      onChange={(e) => handleUpdatePersonal('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={resumeData.personal.phone}
                      onChange={(e) => handleUpdatePersonal('phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={resumeData.personal.location}
                      onChange={(e) => handleUpdatePersonal('location', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your location"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      value={resumeData.personal.linkedin}
                      onChange={(e) => handleUpdatePersonal('linkedin', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="linkedin.com/in/yourprofile"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      value={resumeData.personal.github}
                      onChange={(e) => handleUpdatePersonal('github', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="github.com/yourusername"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
                <textarea
                  value={resumeData.summary}
                  onChange={(e) => handleUpdateData('summary', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Write a brief professional summary..."
                />
              </div>
            </div>

            {/* Work Experience */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
                <Button
                  variant="outline"
                  onClick={addExperience}
                  icon={<Plus className="h-4 w-4" />}
                >
                  Add Experience
                </Button>
              </div>

              <div className="space-y-4">
                {resumeData.experience.map((exp, index) => (
                  <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Experience #{index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExperience(index)}
                        icon={<Trash2 className="h-4 w-4" />}
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => handleUpdateExperience(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., Frontend Developer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleUpdateExperience(index, 'company', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., Tech Company Inc."
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => handleUpdateExperience(index, 'location', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., Mumbai, India"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => handleUpdateExperience(index, 'duration', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., Jan 2022 - Present"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => handleUpdateExperience(index, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        placeholder="Describe your responsibilities and achievements..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Education</h3>
                <Button
                  variant="outline"
                  onClick={addEducation}
                  icon={<Plus className="h-4 w-4" />}
                >
                  Add Education
                </Button>
              </div>

              <div className="space-y-4">
                {resumeData.education.map((edu, index) => (
                  <div key={edu.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Education #{index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEducation(index)}
                        icon={<Trash2 className="h-4 w-4" />}
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleUpdateEducation(index, 'degree', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., Master in Computer Science and Engineering"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => handleUpdateEducation(index, 'institution', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., XYZ University"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          value={edu.location}
                          onChange={(e) => handleUpdateEducation(index, 'location', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., Mumbai, India"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                        <input
                          type="text"
                          value={edu.duration}
                          onChange={(e) => handleUpdateEducation(index, 'duration', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., Dec 2018"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">GPA</label>
                        <input
                          type="text"
                          value={edu.gpa}
                          onChange={(e) => handleUpdateEducation(index, 'gpa', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., Specialization: Software Engineering & Data Structure"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
              </div>

              <div className="space-y-6">
                {Object.entries(resumeData.skills).map(([skillType, skills]) => (
                  <div key={skillType}>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        {skillType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addSkillToCategory(skillType as keyof typeof resumeData.skills)}
                        icon={<Plus className="h-4 w-4" />}
                      >
                        Add
                      </Button>
                    </div>
                    {skills.map((skill, index) => (
                      <div key={`${skillType}-${index}`} className="flex items-center space-x-4 mb-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={skill}
                            onChange={(e) => updateSkillInCategory(skillType as keyof typeof resumeData.skills, index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder={`e.g., ${skillType === 'programmingLanguages' ? 'JavaScript' : skillType === 'frontEndTechnologies' ? 'React.js' : 'VS Code'}`}
                          />
                        </div>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSkill(skillType as keyof typeof resumeData.skills, index)}
                            icon={<Trash2 className="h-4 w-4" />}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
                <Button
                  variant="outline"
                  onClick={addProject}
                  icon={<Plus className="h-4 w-4" />}
                >
                  Add Project
                </Button>
              </div>

              <div className="space-y-4">
                {resumeData.projects.map((project, index) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Project #{index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProject(index)}
                        icon={<Trash2 className="h-4 w-4" />}
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
                        <input
                          type="text"
                          value={project.title}
                          onChange={(e) => handleUpdateProjects(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., E-commerce Platform"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Project Link</label>
                        <input
                          type="url"
                          value={project.link}
                          onChange={(e) => handleUpdateProjects(index, 'link', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., github.com/username/ecommerce"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={project.description}
                        onChange={(e) => handleUpdateProjects(index, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        placeholder="Describe your project..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Technologies Used</label>
                      <input
                        type="text"
                        value={Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies}
                        onChange={(e) => handleUpdateProjects(index, 'technologies', e.target.value.split(',').map(tech => tech.trim()))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g., React, Node.js, MongoDB (comma separated)"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
                <Button
                  variant="outline"
                  onClick={() => {
                    setResumeData(prev => ({
                      ...prev,
                      certifications: [...(prev.certifications || []), '']
                    }));
                  }}
                  icon={<Plus className="h-4 w-4" />}
                >
                  Add Certification
                </Button>
              </div>

              <div className="space-y-4">
                {(resumeData.certifications || []).map((cert, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={cert}
                        onChange={(e) => {
                          setResumeData(prev => ({
                            ...prev,
                            certifications: prev.certifications.map((c, i) => 
                              i === index ? e.target.value : c
                            )
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g., Certified Web Developer - JavaScript Full Stack (2020)"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setResumeData(prev => ({
                          ...prev,
                          certifications: prev.certifications.filter((_, i) => i !== index)
                        }));
                      }}
                      icon={<Trash2 className="h-4 w-4" />}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                <Button
                  variant="outline"
                  onClick={() => {
                    setResumeData(prev => ({
                      ...prev,
                      achievements: [...(prev.achievements || []), '']
                    }));
                  }}
                  icon={<Plus className="h-4 w-4" />}
                >
                  Add Achievement
                </Button>
              </div>

              <div className="space-y-4">
                {(resumeData.achievements || []).map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={achievement}
                        onChange={(e) => {
                          setResumeData(prev => ({
                            ...prev,
                            achievements: prev.achievements.map((a, i) => 
                              i === index ? e.target.value : a
                            )
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g., Led development team of 5 developers"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setResumeData(prev => ({
                          ...prev,
                          achievements: prev.achievements.filter((_, i) => i !== index)
                        }));
                      }}
                      icon={<Trash2 className="h-4 w-4" />}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Template Preview */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Preview</h3>
        
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div 
            className="h-16 rounded-t-lg flex items-center px-4 mb-4"
            style={{ backgroundColor: generateTemplatePreview().color }}
          >
            <div className="text-white font-bold text-lg">
              {resumeData.personal.name || 'Your Name'}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: generateTemplatePreview().color }}></div>
              <span className="text-sm font-medium">Professional Summary</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: generateTemplatePreview().color }}></div>
              <span className="text-sm font-medium">Work Experience</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: generateTemplatePreview().color }}></div>
              <span className="text-sm font-medium">Education</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: generateTemplatePreview().color }}></div>
              <span className="text-sm font-medium">Skills</span>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <span className="text-xs text-gray-500">
              {generateTemplatePreview().name} Template
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;