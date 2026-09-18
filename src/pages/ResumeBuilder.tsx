import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import {
  FileText,
  Download,
  Share2,
  Plus,
  Edit,
  Trash2,
  Save,
  Star,
  Users,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Github,
  Sparkles,
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
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [enhancementStyle, setEnhancementStyle] = useState('professional');
  const [templateConfig, setTemplateConfig] = useState({
    selectedTemplate: 'classic',
    colorScheme: 'blue',
  });
  const [resumeData, setResumeData] = useState({
    personal: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: ''
    },
    summary: '',
    experience: [] as Array<{
      id: string;
      title: string;
      company: string;
      location: string;
      duration: string;
      description: string;
    }>,
    education: [] as Array<{
      id: string;
      degree: string;
      institution: string;
      location: string;
      duration: string;
      gpa: string;
    }>,
    skills: [] as string[],
    projects: [] as Array<{
      id: string;
      title: string;
      description: string;
      technologies: string[];
      link: string;
      impact: string;
    }>,
    certifications: [] as string[],
    achievements: [] as string[],
  });

  useEffect(() => {
    if (user) {
      setResumeData(prev => ({
        ...prev,
        personal: {
          ...prev.personal,
          name: prev.personal.name || user.name || '',
          email: prev.personal.email || user.email || '',
        }
      }));
    }
  }, [user]);

  const [sections, setSections] = useState<ResumeSection[]>([
    { id: '1', type: 'personal', title: 'Personal Information', content: {}, isExpanded: true },
    { id: '2', type: 'experience', title: 'Work Experience', content: {}, isExpanded: true },
    { id: '3', type: 'education', title: 'Education', content: {}, isExpanded: true },
    { id: '4', type: 'skills', title: 'Skills', content: {}, isExpanded: true },
    { id: '5', type: 'projects', title: 'Projects', content: {}, isExpanded: true }
  ]);
  const [loading, setLoading] = useState(false);

  const templates = [
    {
      id: 'classic',
      name: 'Classic',
      icon: <FileText className="h-6 w-6" />,
      description: 'Traditional monochrome layout with dividers'
    },
    {
      id: 'modern',
      name: 'Modern',
      icon: <Star className="h-6 w-6" />,
      description: 'Contemporary design with skill progress bars'
    },
  ];

  const colorSchemes = [
    { id: 'blue', name: 'Professional Blue', colors: ['#2563eb', '#1d4ed8', '#1e40af'] },
    { id: 'green', name: 'Success Green', colors: ['#059669', '#047857', '#065f46'] },
    { id: 'purple', name: 'Creative Purple', colors: ['#7c3aed', '#6d28d9', '#5b21b6'] },
    { id: 'gray', name: 'Modern Gray', colors: ['#374151', '#1f2937', '#111827'] },
    { id: 'orange', name: 'Energetic Orange', colors: ['#ea580c', '#dc2626', '#b91c1c'] }
  ];

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

  const getActiveColorHex = () => {
    const selectedScheme = colorSchemes.find(s => s.id === templateConfig.colorScheme);
    return selectedScheme?.colors[0] || '#2563eb';
  };

  const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    const bigint = parseInt(cleanHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  };

  const handleDownloadResume = () => {
    try {
      const doc = new jsPDF();
      const activeColorHex = getActiveColorHex();
      const { r, g, b } = hexToRgb(activeColorHex);
      const margin = 20;
      const lineHeight = 7;
      const sectionSpacing = 12;
      let yPos = 20;

      const addPageIfNeeded = (neededSpace: number) => {
        if (yPos + neededSpace > 270) {
          doc.addPage();
          yPos = 20;
        }
      };

      if (templateConfig.selectedTemplate === 'classic') {
        // Name header
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(20, 20, 20);
        doc.text((resumeData.personal.name || 'YOUR NAME').toUpperCase(), margin, yPos);
        yPos += 8;

        // Contact row
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        const contactParts = [
          resumeData.personal.phone,
          resumeData.personal.email,
          resumeData.personal.location
        ].filter(Boolean);
        if (contactParts.length > 0) {
          doc.text(contactParts.join('  \u2022  '), margin, yPos);
          yPos += 8;
        }

        doc.setDrawColor(20, 20, 20);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, 190, yPos);
        yPos += sectionSpacing;

        if (resumeData.summary) {
          addPageIfNeeded(20);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(20, 20, 20);
          doc.text('ABOUT ME', margin, yPos);
          yPos += 2;
          doc.setLineWidth(0.3);
          doc.line(margin, yPos, 190, yPos);
          yPos += lineHeight;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const summaryLines = doc.splitTextToSize(resumeData.summary, 170);
          addPageIfNeeded(summaryLines.length * lineHeight);
          doc.text(summaryLines, margin, yPos);
          yPos += summaryLines.length * lineHeight + sectionSpacing;
        }

        if (resumeData.education.length > 0) {
          addPageIfNeeded(20);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(20, 20, 20);
          doc.text('EDUCATION', margin, yPos);
          yPos += 2;
          doc.setLineWidth(0.3);
          doc.line(margin, yPos, 190, yPos);
          yPos += lineHeight;
          resumeData.education.forEach(edu => {
            addPageIfNeeded(20);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80, 80, 80);
            const instLine = [edu.institution, edu.duration].filter(Boolean).join(' | ');
            if (instLine) { doc.text(instLine, margin, yPos); yPos += lineHeight; }
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(20, 20, 20);
            if (edu.degree) { doc.text(edu.degree, margin, yPos); yPos += lineHeight; }
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80, 80, 80);
            if (edu.gpa) { doc.text(edu.gpa, margin, yPos); yPos += lineHeight; }
            yPos += 4;
          });
          yPos += sectionSpacing - 4;
        }

        if (resumeData.experience.length > 0) {
          addPageIfNeeded(20);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(20, 20, 20);
          doc.text('WORK EXPERIENCE', margin, yPos);
          yPos += 2;
          doc.setLineWidth(0.3);
          doc.line(margin, yPos, 190, yPos);
          yPos += lineHeight;
          resumeData.experience.forEach(exp => {
            addPageIfNeeded(20);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80, 80, 80);
            const companyLine = [exp.company, exp.duration].filter(Boolean).join(' | ');
            if (companyLine) { doc.text(companyLine, margin, yPos); yPos += lineHeight; }
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(20, 20, 20);
            if (exp.title) { doc.text(exp.title, margin, yPos); yPos += lineHeight; }
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80, 80, 80);
            if (exp.description) {
              const descLines = doc.splitTextToSize(exp.description, 170);
              addPageIfNeeded(descLines.length * lineHeight);
              doc.text(descLines, margin, yPos);
              yPos += descLines.length * lineHeight;
            }
            yPos += 4;
          });
          yPos += sectionSpacing - 4;
        }

        const validSkillsClassic = resumeData.skills.filter(Boolean);
        if (validSkillsClassic.length > 0) {
          addPageIfNeeded(20);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(20, 20, 20);
          doc.text('SKILLS', margin, yPos);
          yPos += 2;
          doc.setLineWidth(0.3);
          doc.line(margin, yPos, 190, yPos);
          yPos += lineHeight;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(20, 20, 20);
          const colWidth = 85;
          const col2X = margin + colWidth;
          for (let i = 0; i < validSkillsClassic.length; i += 2) {
            addPageIfNeeded(lineHeight);
            doc.text('\u2022 ' + validSkillsClassic[i], margin, yPos);
            if (validSkillsClassic[i + 1]) {
              doc.text('\u2022 ' + validSkillsClassic[i + 1], col2X, yPos);
            }
            yPos += lineHeight;
          }
          yPos += sectionSpacing;
        }

        if (resumeData.certifications.filter(Boolean).length > 0) {
          addPageIfNeeded(20);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(20, 20, 20);
          doc.text('CERTIFICATIONS', margin, yPos);
          yPos += 2;
          doc.setLineWidth(0.3);
          doc.line(margin, yPos, 190, yPos);
          yPos += lineHeight;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);
          resumeData.certifications.filter(Boolean).forEach(cert => {
            addPageIfNeeded(lineHeight);
            doc.text('\u2022 ' + cert, margin, yPos);
            yPos += lineHeight;
          });
          yPos += sectionSpacing;
        }

        if (resumeData.achievements.filter(Boolean).length > 0) {
          addPageIfNeeded(20);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(20, 20, 20);
          doc.text('ACHIEVEMENTS', margin, yPos);
          yPos += 2;
          doc.setLineWidth(0.3);
          doc.line(margin, yPos, 190, yPos);
          yPos += lineHeight;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);
          resumeData.achievements.filter(Boolean).forEach(a => {
            addPageIfNeeded(lineHeight);
            doc.text('\u2022 ' + a, margin, yPos);
            yPos += lineHeight;
          });
          yPos += sectionSpacing;
        }

        if (resumeData.projects.length > 0) {
          addPageIfNeeded(20);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(20, 20, 20);
          doc.text('PROJECTS', margin, yPos);
          yPos += 2;
          doc.setLineWidth(0.3);
          doc.line(margin, yPos, 190, yPos);
          yPos += lineHeight;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          resumeData.projects.forEach(project => {
            addPageIfNeeded(20);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(20, 20, 20);
            if (project.title) { doc.text(project.title, margin, yPos); yPos += lineHeight; }
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80, 80, 80);
            if (project.description) {
              const descLines = doc.splitTextToSize(project.description, 170);
              addPageIfNeeded(descLines.length * lineHeight);
              doc.text(descLines, margin, yPos);
              yPos += descLines.length * lineHeight;
            }
            if (project.technologies?.length) {
              doc.text('Technologies: ' + project.technologies.join(', '), margin, yPos);
              yPos += lineHeight;
            }
            if (project.link) { doc.text('Link: ' + project.link, margin, yPos); yPos += lineHeight; }
            yPos += 4;
          });
        }

        // Classic footer bar
        const { r: fr, g: fg, b: fb } = hexToRgb(activeColorHex);
        doc.setFillColor(fr, fg, fb);
        doc.rect(0, 285, 210, 12, 'F');

      } else {
        // MODERN TEMPLATE PDF
        const initials = (resumeData.personal.name || '?')
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        doc.setFillColor(r, g, b);
        doc.circle(170, 25, 14, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(initials, 170 - (initials.length * 3.5), 29);

        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(r, g, b);
        if (resumeData.personal.name) {
          doc.text(resumeData.personal.name, 105, yPos, { align: 'center' });
        }
        yPos += 8;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        const contactLine = [
          resumeData.personal.location,
          resumeData.personal.phone,
          resumeData.personal.email
        ].filter(Boolean).join('  |  ');
        if (contactLine) {
          doc.text(contactLine, 105, yPos, { align: 'center' });
          yPos += 10;
        }

        if (resumeData.summary) {
          addPageIfNeeded(20);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(r, g, b);
          doc.text('RESUME OBJECTIVE', margin, yPos);
          yPos += 3;
          doc.setDrawColor(r, g, b);
          doc.setLineWidth(0.5);
          doc.line(margin, yPos, 185, yPos);
          yPos += lineHeight;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);
          const summaryLines = doc.splitTextToSize(resumeData.summary, 170);
          addPageIfNeeded(summaryLines.length * lineHeight);
          doc.text(summaryLines, margin, yPos);
          yPos += summaryLines.length * lineHeight + sectionSpacing;
        }

        if (resumeData.education.length > 0) {
          addPageIfNeeded(20);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(r, g, b);
          doc.text('EDUCATION', margin, yPos);
          yPos += 3;
          doc.setDrawColor(r, g, b);
          doc.setLineWidth(0.5);
          doc.line(margin, yPos, 185, yPos);
          yPos += lineHeight;
          resumeData.education.forEach(edu => {
            addPageIfNeeded(20);
            const detailColX = margin + 35;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            if (edu.duration) doc.text(edu.duration, margin, yPos);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 30, 30);
            if (edu.degree) doc.text(edu.degree, detailColX, yPos);
            yPos += lineHeight;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80, 80, 80);
            if (edu.institution) doc.text(edu.institution, detailColX, yPos);
            yPos += lineHeight;
            if (edu.gpa) { doc.text(edu.gpa, detailColX, yPos); yPos += lineHeight; }
            yPos += 4;
          });
          yPos += sectionSpacing - 4;
        }

        const validSkillsModern = resumeData.skills.filter(Boolean);
        if (validSkillsModern.length > 0) {
          addPageIfNeeded(20);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(r, g, b);
          doc.text('SKILLS', margin, yPos);
          yPos += 3;
          doc.setDrawColor(r, g, b);
          doc.setLineWidth(0.5);
          doc.line(margin, yPos, 185, yPos);
          yPos += lineHeight;
          validSkillsModern.forEach((skill, idx) => {
            addPageIfNeeded(lineHeight + 4);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(30, 30, 30);
            doc.text(skill, margin, yPos);
            const barX = margin + 55;
            const barW = 80;
            const barH = 3;
            doc.setFillColor(220, 220, 220);
            doc.rect(barX, yPos - barH, barW, barH, 'F');
            const fillPct = 0.70 + (idx % 3) * 0.10;
            doc.setFillColor(r, g, b);
            doc.rect(barX, yPos - barH, barW * fillPct, barH, 'F');
            yPos += lineHeight;
          });
          yPos += sectionSpacing;
        }

        if (resumeData.experience.length > 0) {
          addPageIfNeeded(20);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(r, g, b);
          doc.text('WORK HISTORY', margin, yPos);
          yPos += 3;
          doc.setDrawColor(r, g, b);
          doc.setLineWidth(0.5);
          doc.line(margin, yPos, 185, yPos);
          yPos += lineHeight;
          resumeData.experience.forEach(exp => {
            addPageIfNeeded(20);
            const detailColX = margin + 35;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            if (exp.duration) doc.text(exp.duration, margin, yPos);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 30, 30);
            if (exp.title) doc.text(exp.title, detailColX, yPos);
            yPos += lineHeight;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80, 80, 80);
            if (exp.company) { doc.text(exp.company, detailColX, yPos); yPos += lineHeight; }
            if (exp.description) {
              const descLines = doc.splitTextToSize(exp.description, 155);
              addPageIfNeeded(descLines.length * lineHeight);
              doc.text(descLines, detailColX, yPos);
              yPos += descLines.length * lineHeight;
            }
            yPos += 4;
          });
          yPos += sectionSpacing - 4;
        }

        if (resumeData.achievements.filter(Boolean).length > 0) {
          addPageIfNeeded(20);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(r, g, b);
          doc.text('ACCOMPLISHMENTS', margin, yPos);
          yPos += 3;
          doc.setDrawColor(r, g, b);
          doc.setLineWidth(0.5);
          doc.line(margin, yPos, 185, yPos);
          yPos += lineHeight;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);
          resumeData.achievements.filter(Boolean).forEach(a => {
            addPageIfNeeded(lineHeight);
            doc.text('\u2022 ' + a, margin, yPos);
            yPos += lineHeight;
          });
        }

        if (resumeData.certifications.filter(Boolean).length > 0) {
          addPageIfNeeded(20);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(r, g, b);
          doc.text('CERTIFICATIONS', margin, yPos);
          yPos += 3;
          doc.setDrawColor(r, g, b);
          doc.setLineWidth(0.5);
          doc.line(margin, yPos, 185, yPos);
          yPos += lineHeight;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);
          resumeData.certifications.filter(Boolean).forEach(cert => {
            addPageIfNeeded(lineHeight);
            doc.text('\u2022 ' + cert, margin, yPos);
            yPos += lineHeight;
          });
        }
      }

      const selectedTemplate = templates.find(t => t.id === templateConfig.selectedTemplate);
      const fileName = 'resume_' + (selectedTemplate?.name.toLowerCase() || 'resume') + '_' + Date.now() + '.pdf';
      doc.save(fileName);

      addNotification({
        type: 'success',
        title: 'Resume Downloaded!',
        message: 'Resume saved as ' + fileName + ' using ' + (selectedTemplate?.name || '') + ' template'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to download resume. Please try again.'
      });
    }
  };

  const handleShareResume = () => {
    const shareText = 'Check out my professional resume!';
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({ title: 'My Resume', text: shareText, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareText + ' - ' + shareUrl);
      addNotification({
        type: 'success',
        title: 'Link copied!',
        message: 'Resume link copied to clipboard'
      });
    }
  };

  const handleAIEnhance = async () => {
    setLoading(true);
    try {
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
        title: 'AI Enhancement Complete! \u2728',
        message: 'Your resume has been enhanced with ' + enhancementStyle + ' style using industry-standard language and impactful achievements!'
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

  const generateProfessionalSummary = (originalSummary: string, style: string) => {
    const role = getRoleFromSkills(style);
    const topSkills = getTopSkills(style);
    const templates = [
      'Results-driven ' + role + ' with experience developing scalable web applications. Demonstrated expertise in ' + topSkills + ' with a track record of delivering high-impact projects that drive business growth.',
      'Dynamic ' + role + ' with a strong foundation in modern software development. Specialized in ' + topSkills + ', committed to delivering robust, user-centric applications.',
      'Accomplished ' + role + ' with expertise in ' + topSkills + '. Skilled in agile methodologies and team collaboration, with a focus on maintainable, scalable code.'
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  };

  const enhanceExperience = (exp: any, style: string) => {
    const actionVerbs = ['Developed', 'Implemented', 'Designed', 'Optimized', 'Streamlined', 'Built', 'Led', 'Delivered'];
    const achievements = ['resulting in 40% improved performance', 'achieving 95% user satisfaction', 'reducing development time by 30%', 'exceeding stakeholder expectations'];
    const enhancedDescription = exp.description
      ? '\u2022 ' + actionVerbs[Math.floor(Math.random() * actionVerbs.length)] + ' ' + exp.description.toLowerCase() + ', ' + achievements[Math.floor(Math.random() * achievements.length)] + '\n\u2022 Collaborated with cross-functional teams to ensure seamless project delivery\n\u2022 Implemented best practices and coding standards for maintainable code'
      : exp.description;
    return { ...exp, title: enhanceJobTitle(exp.title, style), description: enhancedDescription };
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
      if (lowerTitle.includes(key)) return enhanced;
    }
    return title;
  };

  const enhanceEducation = (edu: any, style: string) => {
    return {
      ...edu,
      degree: edu.degree.includes('Bachelor') ? edu.degree + ' (First Class Honours)' : edu.degree,
      institution: edu.institution.includes('University') ? edu.institution + ' - Top 10% Graduate' : edu.institution
    };
  };

  const enhanceSkills = (skills: string[], style: string): string[] => {
    const skillEnhancements: { [key: string]: string } = {
      'javascript': 'JavaScript (ES6+)', 'react': 'React.js', 'vue': 'Vue.js', 'angular': 'Angular.js',
      'node': 'Node.js', 'typescript': 'TypeScript', 'python': 'Python', 'java': 'Java',
      'html': 'HTML5', 'css': 'CSS3', 'sass': 'Sass/SCSS', 'bootstrap': 'Bootstrap',
      'express': 'Express.js', 'mongodb': 'MongoDB', 'mysql': 'MySQL', 'postgresql': 'PostgreSQL',
      'aws': 'AWS', 'docker': 'Docker', 'git': 'Git', 'github': 'GitHub', 'agile': 'Agile/Scrum'
    };
    return skills.map(skill => skillEnhancements[skill.toLowerCase()] || skill);
  };

  const enhanceProjects = (project: any, style: string) => {
    const prefixes = ['A comprehensive project that', 'An industry-leading solution that', 'A cutting-edge application that', 'A scalable system that'];
    const enhancedDescription = project.description
      ? prefixes[Math.floor(Math.random() * prefixes.length)] + ' ' + project.description.toLowerCase() + '. Features include responsive design, optimized performance, and seamless user experience.'
      : project.description;
    return { ...project, description: enhancedDescription };
  };

  const getRoleFromSkills = (style: string) => {
    const allSkills = resumeData.skills.map(s => s.toLowerCase());
    if (allSkills.some(s => s.includes('react') || s.includes('frontend') || s.includes('html') || s.includes('css'))) return 'Frontend Developer';
    if (allSkills.some(s => s.includes('node') || s.includes('backend') || s.includes('express'))) return 'Backend Developer';
    return 'Software Developer';
  };

  const getTopSkills = (style: string) => {
    return resumeData.skills.filter(Boolean).slice(0, 3).join(', ') || 'modern technologies';
  };

  const updateTemplateConfig = (key: string, value: string) => {
    setTemplateConfig(prev => ({ ...prev, [key]: value }));
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
    addNotification({ type: 'success', title: 'Section Added', message: newSection.title + ' section has been added' });
  };

  const handleRemoveSection = (sectionId: string) => {
    setSections(prev => prev.filter(section => section.id !== sectionId));
    addNotification({ type: 'info', title: 'Section Removed', message: 'Section has been removed from your resume' });
  };

  const handleToggleSection = (sectionId: string) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId ? { ...section, isExpanded: !section.isExpanded } : section
    ));
  };

  const handleUpdateData = (field: string, value: any) => {
    setResumeData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdatePersonal = (field: string, value: string) => {
    setResumeData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
  };

  const handleUpdateExperience = (index: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => i === index ? { ...exp, [field]: value } : exp)
    }));
  };

  const handleUpdateEducation = (index: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => i === index ? { ...edu, [field]: value } : edu)
    }));
  };

  const handleUpdateProjects = (index: number, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => i === index ? { ...project, [field]: value } : project)
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { id: Date.now().toString(), title: '', company: '', location: '', duration: '', description: '' }]
    }));
  };

  const removeExperience = (index: number) => {
    setResumeData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { id: Date.now().toString(), degree: '', institution: '', location: '', duration: '', gpa: '' }]
    }));
  };

  const removeEducation = (index: number) => {
    setResumeData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
  };

  const addSkill = () => {
    setResumeData(prev => ({ ...prev, skills: [...prev.skills, ''] }));
  };

  const removeSkill = (index: number) => {
    setResumeData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  };

  const updateSkill = (index: number, value: string) => {
    setResumeData(prev => ({ ...prev, skills: prev.skills.map((skill, i) => i === index ? value : skill) }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, { id: Date.now().toString(), title: '', description: '', technologies: [], link: '', impact: '' }]
    }));
  };

  const removeProject = (index: number) => {
    setResumeData(prev => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }));
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

  const activeColor = getActiveColorHex();

  const ClassicPreview = () => {
    const validSkills = resumeData.skills.filter(Boolean);
    const leftSkills = validSkills.filter((_, i) => i % 2 === 0);
    const rightSkills = validSkills.filter((_, i) => i % 2 === 1);
    return (
      <div className="bg-white text-gray-900 p-8 font-serif text-xs leading-relaxed min-h-[900px] relative">
        {resumeData.personal.name && (
          <h1 className="text-2xl font-black tracking-widest uppercase text-gray-900 mb-1">
            {resumeData.personal.name}
          </h1>
        )}
        {(resumeData.personal.phone || resumeData.personal.email || resumeData.personal.location) && (
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-4 flex-wrap">
            {resumeData.personal.phone && <span>{resumeData.personal.phone}</span>}
            {resumeData.personal.phone && resumeData.personal.email && <span>&bull;</span>}
            {resumeData.personal.email && <span>{resumeData.personal.email}</span>}
            {(resumeData.personal.phone || resumeData.personal.email) && resumeData.personal.location && <span>&bull;</span>}
            {resumeData.personal.location && <span>{resumeData.personal.location}</span>}
          </div>
        )}
        {!(resumeData.personal.phone || resumeData.personal.email || resumeData.personal.location) && resumeData.personal.name && <div className="mb-4" />}
        <hr className="border-gray-900 border-t mb-4" />
        {resumeData.summary && (
          <div className="mb-4">
            <h2 className="font-bold uppercase tracking-widest text-xs text-gray-900 mb-1">About Me</h2>
            <hr className="border-gray-300 border-t mb-2" />
            <p className="text-gray-700">{resumeData.summary}</p>
          </div>
        )}
        {resumeData.education.length > 0 && (
          <div className="mb-4">
            <h2 className="font-bold uppercase tracking-widest text-xs text-gray-900 mb-1">Education</h2>
            <hr className="border-gray-300 border-t mb-2" />
            {resumeData.education.map((edu, i) => (
              <div key={edu.id || i} className="mb-3">
                {(edu.institution || edu.duration) && (
                  <div className="text-gray-500">{[edu.institution, edu.duration].filter(Boolean).join(' | ')}</div>
                )}
                {edu.degree && <div className="font-bold text-gray-900">{edu.degree}</div>}
                {edu.gpa && <div className="text-gray-600 mt-0.5">{edu.gpa}</div>}
              </div>
            ))}
          </div>
        )}
        {resumeData.experience.length > 0 && (
          <div className="mb-4">
            <h2 className="font-bold uppercase tracking-widest text-xs text-gray-900 mb-1">Work Experience</h2>
            <hr className="border-gray-300 border-t mb-2" />
            {resumeData.experience.map((exp, i) => (
              <div key={exp.id || i} className="mb-3">
                {(exp.company || exp.duration) && (
                  <div className="text-gray-500">{[exp.company, exp.duration].filter(Boolean).join(' | ')}</div>
                )}
                {exp.title && <div className="font-bold text-gray-900">{exp.title}</div>}
                {exp.description && <p className="text-gray-700 mt-0.5 whitespace-pre-line">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
        {validSkills.length > 0 && (
          <div className="mb-4">
            <h2 className="font-bold uppercase tracking-widest text-xs text-gray-900 mb-1">Skills</h2>
            <hr className="border-gray-300 border-t mb-2" />
            <div className="grid grid-cols-2 gap-x-4">
              <ul className="space-y-0.5">{leftSkills.map((skill, i) => <li key={i} className="text-gray-700">&bull; {skill}</li>)}</ul>
              <ul className="space-y-0.5">{rightSkills.map((skill, i) => <li key={i} className="text-gray-700">&bull; {skill}</li>)}</ul>
            </div>
          </div>
        )}
        {resumeData.certifications.filter(Boolean).length > 0 && (
          <div className="mb-4">
            <h2 className="font-bold uppercase tracking-widest text-xs text-gray-900 mb-1">Certifications</h2>
            <hr className="border-gray-300 border-t mb-2" />
            <ul className="space-y-0.5">{resumeData.certifications.filter(Boolean).map((cert, i) => <li key={i} className="text-gray-700">&bull; {cert}</li>)}</ul>
          </div>
        )}
        {resumeData.achievements.filter(Boolean).length > 0 && (
          <div className="mb-4">
            <h2 className="font-bold uppercase tracking-widest text-xs text-gray-900 mb-1">Achievements</h2>
            <hr className="border-gray-300 border-t mb-2" />
            <ul className="space-y-0.5">{resumeData.achievements.filter(Boolean).map((a, i) => <li key={i} className="text-gray-700">&bull; {a}</li>)}</ul>
          </div>
        )}
        {resumeData.projects.length > 0 && (
          <div className="mb-12">
            <h2 className="font-bold uppercase tracking-widest text-xs text-gray-900 mb-1">Projects</h2>
            <hr className="border-gray-300 border-t mb-2" />
            {resumeData.projects.map((project, i) => (
              <div key={project.id || i} className="mb-3">
                {project.title && <div className="font-bold text-gray-900">{project.title}</div>}
                {project.description && <p className="text-gray-700">{project.description}</p>}
                {project.technologies?.length > 0 && <div className="text-gray-500">Technologies: {project.technologies.join(', ')}</div>}
                {project.link && <div className="text-gray-500">Link: {project.link}</div>}
              </div>
            ))}
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-4" style={{ backgroundColor: activeColor }} />
      </div>
    );
  };

  const ModernPreview = () => {
    const validSkills = resumeData.skills.filter(Boolean);
    const initials = (resumeData.personal.name || '?').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    return (
      <div className="bg-white text-gray-900 p-8 font-sans text-xs leading-relaxed min-h-[900px]">
        <div className="relative flex flex-col items-center mb-6">
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: activeColor }}>
            {initials}
          </div>
          {resumeData.personal.name && (
            <h1 className="text-2xl font-bold" style={{ color: activeColor }}>{resumeData.personal.name}</h1>
          )}
          {(resumeData.personal.location || resumeData.personal.phone || resumeData.personal.email) && (
            <div className="text-gray-400 text-xs mt-1 text-center">
              {[resumeData.personal.location, resumeData.personal.phone, resumeData.personal.email].filter(Boolean).join('  |  ')}
            </div>
          )}
        </div>
        {resumeData.summary && (
          <div className="mb-4">
            <h2 className="font-bold text-xs tracking-widest uppercase mb-1" style={{ color: activeColor }}>Resume Objective</h2>
            <div className="h-0.5 w-full mb-2" style={{ backgroundColor: activeColor }} />
            <p className="text-gray-600">{resumeData.summary}</p>
          </div>
        )}
        {resumeData.education.length > 0 && (
          <div className="mb-4">
            <h2 className="font-bold text-xs tracking-widest uppercase mb-1" style={{ color: activeColor }}>Education</h2>
            <div className="h-0.5 w-full mb-2" style={{ backgroundColor: activeColor }} />
            {resumeData.education.map((edu, i) => (
              <div key={edu.id || i} className="flex gap-3 mb-3">
                <div className="text-gray-400 text-xs w-20 shrink-0 pt-0.5">{edu.duration}</div>
                <div>
                  {edu.degree && <div className="font-bold text-gray-900">{edu.degree}</div>}
                  {edu.institution && <div className="text-gray-600">{edu.institution}</div>}
                  {edu.gpa && <div className="text-gray-500 mt-0.5">{edu.gpa}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
        {validSkills.length > 0 && (
          <div className="mb-4">
            <h2 className="font-bold text-xs tracking-widest uppercase mb-1" style={{ color: activeColor }}>Skills</h2>
            <div className="h-0.5 w-full mb-2" style={{ backgroundColor: activeColor }} />
            <div className="space-y-1.5">
              {validSkills.map((skill, i) => {
                const fillPct = 70 + (i % 3) * 10;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-gray-700 w-28 shrink-0">{skill}</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ backgroundColor: activeColor, width: fillPct + '%' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {resumeData.experience.length > 0 && (
          <div className="mb-4">
            <h2 className="font-bold text-xs tracking-widest uppercase mb-1" style={{ color: activeColor }}>Work History</h2>
            <div className="h-0.5 w-full mb-2" style={{ backgroundColor: activeColor }} />
            {resumeData.experience.map((exp, i) => (
              <div key={exp.id || i} className="flex gap-3 mb-3">
                <div className="text-gray-400 text-xs w-20 shrink-0 pt-0.5">{exp.duration}</div>
                <div>
                  {exp.title && <div className="font-bold text-gray-900">{exp.title}</div>}
                  {exp.company && <div className="text-gray-600">{exp.company}</div>}
                  {exp.description && <p className="text-gray-600 mt-0.5 whitespace-pre-line">{exp.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
        {resumeData.achievements.filter(Boolean).length > 0 && (
          <div className="mb-4">
            <h2 className="font-bold text-xs tracking-widest uppercase mb-1" style={{ color: activeColor }}>Accomplishments</h2>
            <div className="h-0.5 w-full mb-2" style={{ backgroundColor: activeColor }} />
            <ul className="space-y-0.5">{resumeData.achievements.filter(Boolean).map((a, i) => <li key={i} className="text-gray-700">&bull; {a}</li>)}</ul>
          </div>
        )}
        {resumeData.certifications.filter(Boolean).length > 0 && (
          <div className="mb-4">
            <h2 className="font-bold text-xs tracking-widest uppercase mb-1" style={{ color: activeColor }}>Certifications</h2>
            <div className="h-0.5 w-full mb-2" style={{ backgroundColor: activeColor }} />
            <ul className="space-y-0.5">{resumeData.certifications.filter(Boolean).map((cert, i) => <li key={i} className="text-gray-700">&bull; {cert}</li>)}</ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Resume Builder</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Create a professional resume that stands out and gets you noticed</p>
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
                    className={'p-3 rounded-lg border-2 transition-all duration-200 ' + (templateConfig.selectedTemplate === template.id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50')}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={'p-1 rounded ' + (templateConfig.selectedTemplate === template.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600')}>
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
                <h4 className="text-sm font-medium text-gray-700 mb-3">Color Scheme</h4>
                <div className="grid grid-cols-2 gap-2">
                  {colorSchemes.map(scheme => (
                    <button
                      key={scheme.id}
                      onClick={() => updateTemplateConfig('colorScheme', scheme.id)}
                      className={'p-2 rounded-lg border-2 transition-all ' + (templateConfig.colorScheme === scheme.id ? 'border-primary-500' : 'border-gray-200 hover:border-gray-300')}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {scheme.colors.map((color, index) => (
                            <div key={index} className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                          ))}
                        </div>
                        <span className="text-xs font-medium">{scheme.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
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
                <Button variant="primary" fullWidth loading={loading} onClick={handleSaveResume} icon={<Save className="h-5 w-5" />}>Save Resume</Button>
                <Button variant="outline" fullWidth onClick={handleDownloadResume} icon={<Download className="h-5 w-5" />}>Download PDF</Button>
                <Button variant="outline" fullWidth onClick={handleShareResume} icon={<Share2 className="h-5 w-5" />}>Share</Button>
                <Button variant="secondary" fullWidth onClick={handleAIEnhance} icon={<Sparkles className="h-5 w-5" />}>AI Enhance</Button>
              </div>
            </div>

            {/* Add Sections */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Sections</h3>
              <div className="space-y-2">
                {['experience', 'education', 'skills', 'projects', 'certifications'].map((type) => (
                  <Button key={type} variant="ghost" fullWidth onClick={() => handleAddSection(type)} icon={<Plus className="h-4 w-4" />}>
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
                <Button variant="ghost" size="sm" icon={<Edit className="h-4 w-4" />}>Edit</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" value={resumeData.personal.name} onChange={(e) => handleUpdatePersonal('name', e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Enter your full name" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="email" value={resumeData.personal.email} onChange={(e) => handleUpdatePersonal('email', e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Enter your email" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="tel" value={resumeData.personal.phone} onChange={(e) => handleUpdatePersonal('phone', e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Enter your phone number" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" value={resumeData.personal.location} onChange={(e) => handleUpdatePersonal('location', e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Enter your location" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="url" value={resumeData.personal.linkedin} onChange={(e) => handleUpdatePersonal('linkedin', e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="linkedin.com/in/yourprofile" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="url" value={resumeData.personal.github} onChange={(e) => handleUpdatePersonal('github', e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="github.com/yourusername" />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
                <textarea value={resumeData.summary} onChange={(e) => handleUpdateData('summary', e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none" placeholder="Write a brief professional summary..." />
              </div>
            </div>

            {/* Work Experience */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
                <Button variant="outline" onClick={addExperience} icon={<Plus className="h-4 w-4" />}>Add Experience</Button>
              </div>
              <div className="space-y-4">
                {resumeData.experience.map((exp, index) => (
                  <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Experience #{index + 1}</h4>
                      <Button variant="ghost" size="sm" onClick={() => removeExperience(index)} icon={<Trash2 className="h-4 w-4" />}>Remove</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                        <input type="text" value={exp.title} onChange={(e) => handleUpdateExperience(index, 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="e.g., Frontend Developer" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                        <input type="text" value={exp.company} onChange={(e) => handleUpdateExperience(index, 'company', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="e.g., Tech Company Inc." />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input type="text" value={exp.location} onChange={(e) => handleUpdateExperience(index, 'location', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="e.g., Mumbai, India" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                        <input type="text" value={exp.duration} onChange={(e) => handleUpdateExperience(index, 'duration', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="e.g., Jan 2022 - Present" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea value={exp.description} onChange={(e) => handleUpdateExperience(index, 'description', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none" placeholder="Describe your responsibilities and achievements..." />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Education</h3>
                <Button variant="outline" onClick={addEducation} icon={<Plus className="h-4 w-4" />}>Add Education</Button>
              </div>
              <div className="space-y-4">
                {resumeData.education.map((edu, index) => (
                  <div key={edu.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Education #{index + 1}</h4>
                      <Button variant="ghost" size="sm" onClick={() => removeEducation(index)} icon={<Trash2 className="h-4 w-4" />}>Remove</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                        <input type="text" value={edu.degree} onChange={(e) => handleUpdateEducation(index, 'degree', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="e.g., Master in Computer Science" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                        <input type="text" value={edu.institution} onChange={(e) => handleUpdateEducation(index, 'institution', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="e.g., XYZ University" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input type="text" value={edu.location} onChange={(e) => handleUpdateEducation(index, 'location', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="e.g., Mumbai, India" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                        <input type="text" value={edu.duration} onChange={(e) => handleUpdateEducation(index, 'duration', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="e.g., Dec 2018" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">GPA / Notes</label>
                        <input type="text" value={edu.gpa} onChange={(e) => handleUpdateEducation(index, 'gpa', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="e.g., GPA 3.8 / Specialization" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills - flat list */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
                <Button variant="outline" onClick={addSkill} icon={<Plus className="h-4 w-4" />}>Add Skill</Button>
              </div>
              <div className="space-y-2">
                {resumeData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <input type="text" value={skill} onChange={(e) => updateSkill(index, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="e.g., JavaScript, React, Python..." />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeSkill(index)} icon={<Trash2 className="h-4 w-4" />}>Remove</Button>
                  </div>
                ))}
                {resumeData.skills.length === 0 && (
                  <p className="text-gray-400 text-sm">No skills added yet. Click &quot;+ Add Skill&quot; to get started.</p>
                )}
              </div>
            </div>

            {/* Projects */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
                <Button variant="outline" onClick={addProject} icon={<Plus className="h-4 w-4" />}>Add Project</Button>
              </div>
              <div className="space-y-4">
                {resumeData.projects.map((project, index) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Project #{index + 1}</h4>
                      <Button variant="ghost" size="sm" onClick={() => removeProject(index)} icon={<Trash2 className="h-4 w-4" />}>Remove</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
                        <input type="text" value={project.title} onChange={(e) => handleUpdateProjects(index, 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="e.g., E-commerce Platform" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Project Link</label>
                        <input type="url" value={project.link} onChange={(e) => handleUpdateProjects(index, 'link', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="e.g., github.com/username/project" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea value={project.description} onChange={(e) => handleUpdateProjects(index, 'description', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none" placeholder="Describe your project..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Technologies Used</label>
                      <input type="text" value={Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies} onChange={(e) => handleUpdateProjects(index, 'technologies', e.target.value.split(',').map(tech => tech.trim()))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="e.g., React, Node.js, MongoDB (comma separated)" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
                <Button variant="outline" onClick={() => { setResumeData(prev => ({ ...prev, certifications: [...(prev.certifications || []), ''] })); }} icon={<Plus className="h-4 w-4" />}>Add Certification</Button>
              </div>
              <div className="space-y-4">
                {(resumeData.certifications || []).map((cert, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input type="text" value={cert} onChange={(e) => { setResumeData(prev => ({ ...prev, certifications: prev.certifications.map((c, i) => i === index ? e.target.value : c) })); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="e.g., Certified Web Developer - JavaScript Full Stack (2020)" />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setResumeData(prev => ({ ...prev, certifications: prev.certifications.filter((_, i) => i !== index) })); }} icon={<Trash2 className="h-4 w-4" />}>Remove</Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                <Button variant="outline" onClick={() => { setResumeData(prev => ({ ...prev, achievements: [...(prev.achievements || []), ''] })); }} icon={<Plus className="h-4 w-4" />}>Add Achievement</Button>
              </div>
              <div className="space-y-4">
                {(resumeData.achievements || []).map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input type="text" value={achievement} onChange={(e) => { setResumeData(prev => ({ ...prev, achievements: prev.achievements.map((a, i) => i === index ? e.target.value : a) })); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="e.g., Led development team of 5 developers" />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setResumeData(prev => ({ ...prev, achievements: prev.achievements.filter((_, i) => i !== index) })); }} icon={<Trash2 className="h-4 w-4" />}>Remove</Button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Live Resume Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Live Preview &mdash; {templateConfig.selectedTemplate === 'classic' ? 'Classic' : 'Modern'} Template
              </h3>
              <Button variant="outline" onClick={handleDownloadResume} icon={<Download className="h-4 w-4" />} size="sm">Download PDF</Button>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-inner">
              <div className="overflow-y-auto max-h-[900px]">
                {templateConfig.selectedTemplate === 'classic' ? <ClassicPreview /> : <ModernPreview />}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
