import { supabase } from './supabase';

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface StudentSkill {
  id?: string;
  studentId: string;
  skillId: string;
  skillName?: string;
  confidenceScore: number;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
  source: 'self' | 'github' | 'resume' | 'assessment';
  evidence?: Record<string, any>;
  lastUpdated?: string;
}

export interface SkillEdge {
  fromSkillId: string;
  toSkillId: string;
  relation: string;
}

export interface RoleRequirement {
  id?: string;
  roleId: string;
  skillId: string;
  minProficiency: 'beginner' | 'intermediate' | 'advanced';
  weight: number;
}

export interface SkillSuggestion {
  skillId: string;
  skillName: string;
  category: string;
  source: 'github' | 'resume' | 'self' | 'assessment';
  confidenceScore: number;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
  evidence: string;
}

export interface CourseRecommendation {
  skillId: string;
  skillName: string;
  courseTitle: string;
  platform: string;
  url: string;
  level: string;
  estimatedHours: number;
}

// Static course recommendations library for skill gap bridging
const COURSE_LIBRARY: Record<string, CourseRecommendation> = {
  java: {
    skillId: 'java',
    skillName: 'Java',
    courseTitle: 'Java Programming Masterclass updated for Java 17/21',
    platform: 'Udemy / Coursera',
    url: 'https://www.coursera.org/specializations/java-programming',
    level: 'Beginner to Intermediate',
    estimatedHours: 35
  },
  php: {
    skillId: 'php',
    skillName: 'PHP',
    courseTitle: 'PHP with Laravel for Beginners - Become a Master in PHP',
    platform: 'freeCodeCamp / Udemy',
    url: 'https://www.php.net/manual/en/tutorial.php',
    level: 'Beginner to Intermediate',
    estimatedHours: 25
  },
  react: {
    skillId: 'react',
    skillName: 'React',
    courseTitle: 'React - The Complete Guide (incl. Next.js & Redux)',
    platform: 'Udemy / Coursera',
    url: 'https://www.coursera.org/learn/react-basics',
    level: 'Intermediate',
    estimatedHours: 25
  },
  javascript: {
    skillId: 'javascript',
    skillName: 'JavaScript',
    courseTitle: 'Modern JavaScript from the Beginning',
    platform: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
    level: 'Beginner',
    estimatedHours: 30
  },
  typescript: {
    skillId: 'typescript',
    skillName: 'TypeScript',
    courseTitle: 'Understanding TypeScript - 2026 Edition',
    platform: 'ExecuteProgram / Udemy',
    url: 'https://www.typescriptlang.org/docs/handbook/',
    level: 'Intermediate',
    estimatedHours: 15
  },
  python: {
    skillId: 'python',
    skillName: 'Python',
    courseTitle: 'Python for Everybody Specialization',
    platform: 'Coursera / edX',
    url: 'https://www.coursera.org/specializations/python',
    level: 'Beginner',
    estimatedHours: 40
  },
  java: {
    skillId: 'java',
    skillName: 'Java',
    courseTitle: 'Java Programming and Software Engineering Fundamentals',
    platform: 'Coursera (Duke University)',
    url: 'https://www.coursera.org/specializations/java-programming',
    level: 'Beginner',
    estimatedHours: 35
  },
  php: {
    skillId: 'php',
    skillName: 'PHP',
    courseTitle: 'Building Web Applications in PHP',
    platform: 'Coursera (University of Michigan)',
    url: 'https://www.coursera.org/learn/web-applications-php',
    level: 'Beginner',
    estimatedHours: 30
  },
  nodejs: {
    skillId: 'nodejs',
    skillName: 'Node.js',
    courseTitle: 'Node.js, Express & MongoDB Dev to Deployment',
    platform: 'edX / freeCodeCamp',
    url: 'https://nodejs.org/en/docs/guides/',
    level: 'Intermediate',
    estimatedHours: 20
  },
  postgresql: {
    skillId: 'postgresql',
    skillName: 'PostgreSQL',
    courseTitle: 'Complete SQL & PostgreSQL Bootcamp',
    platform: 'Coursera',
    url: 'https://www.postgresql.org/docs/tutorial/',
    level: 'Intermediate',
    estimatedHours: 18
  },
  'machine-learning': {
    skillId: 'machine-learning',
    skillName: 'Machine Learning',
    courseTitle: 'Supervised Machine Learning: Regression and Classification',
    platform: 'Coursera (DeepLearning.AI)',
    url: 'https://www.coursera.org/learn/machine-learning',
    level: 'Advanced',
    estimatedHours: 45
  },
  pandas: {
    skillId: 'pandas',
    skillName: 'Pandas',
    courseTitle: 'Data Analysis with Python and Pandas',
    platform: 'Kaggle Learn',
    url: 'https://www.kaggle.com/learn/pandas',
    level: 'Intermediate',
    estimatedHours: 10
  },
  tailwind: {
    skillId: 'tailwind',
    skillName: 'Tailwind CSS',
    courseTitle: 'Tailwind CSS From Scratch',
    platform: 'Tailwind Labs / YouTube',
    url: 'https://tailwindcss.com/docs',
    level: 'Beginner',
    estimatedHours: 8
  },
  docker: {
    skillId: 'docker',
    skillName: 'Docker',
    courseTitle: 'Docker & Kubernetes: The Practical Guide',
    platform: 'Udemy / Docker Docs',
    url: 'https://docs.docker.com/get-started/',
    level: 'Intermediate',
    estimatedHours: 16
  },
  excel: {
    skillId: 'excel',
    skillName: 'Excel',
    courseTitle: 'Microsoft Excel - Advanced Excel Formulas & Functions',
    platform: 'Coursera / LinkedIn Learning',
    url: 'https://www.coursera.org/learn/excel-essentials',
    level: 'Beginner to Advanced',
    estimatedHours: 15
  },
  seo: {
    skillId: 'seo',
    skillName: 'SEO',
    courseTitle: 'Search Engine Optimization (SEO) Specialization',
    platform: 'Coursera (UC Davis)',
    url: 'https://www.coursera.org/specializations/seo',
    level: 'Beginner to Intermediate',
    estimatedHours: 20
  },
  communication: {
    skillId: 'communication',
    skillName: 'Communication',
    courseTitle: 'Effective Communication in the Workplace',
    platform: 'Coursera',
    url: 'https://www.coursera.org/learn/communication-skills-workplace',
    level: 'Beginner',
    estimatedHours: 10
  },
  recruitment: {
    skillId: 'recruitment',
    skillName: 'Recruitment',
    courseTitle: 'Talent Acquisition & Modern Recruitment Essentials',
    platform: 'LinkedIn Learning / Coursera',
    url: 'https://www.coursera.org/learn/talent-management',
    level: 'Intermediate',
    estimatedHours: 18
  }
};

const DEFAULT_TAXONOMY: Skill[] = [
  // Programming Languages
  { id: 'java', name: 'Java', category: 'Languages' },
  { id: 'php', name: 'PHP', category: 'Languages' },
  { id: 'python', name: 'Python', category: 'Languages' },
  { id: 'javascript', name: 'JavaScript', category: 'Languages' },
  { id: 'typescript', name: 'TypeScript', category: 'Languages' },
  { id: 'cpp', name: 'C++', category: 'Languages' },
  { id: 'csharp', name: 'C#', category: 'Languages' },
  { id: 'c', name: 'C', category: 'Languages' },
  { id: 'golang', name: 'Go', category: 'Languages' },
  { id: 'rust', name: 'Rust', category: 'Languages' },
  { id: 'ruby', name: 'Ruby', category: 'Languages' },
  { id: 'swift', name: 'Swift', category: 'Languages' },
  { id: 'kotlin', name: 'Kotlin', category: 'Languages' },
  { id: 'sql', name: 'SQL', category: 'Languages' },

  // Frontend & Frameworks
  { id: 'react', name: 'React', category: 'Frontend' },
  { id: 'angular', name: 'Angular', category: 'Frontend' },
  { id: 'vue', name: 'Vue.js', category: 'Frontend' },
  { id: 'nextjs', name: 'Next.js', category: 'Frontend' },
  { id: 'html', name: 'HTML5', category: 'Frontend' },
  { id: 'css', name: 'CSS3', category: 'Frontend' },
  { id: 'tailwind', name: 'Tailwind CSS', category: 'Frontend' },
  { id: 'bootstrap', name: 'Bootstrap', category: 'Frontend' },
  { id: 'redux', name: 'Redux', category: 'Frontend' },

  // Backend & Databases
  { id: 'nodejs', name: 'Node.js', category: 'Backend' },
  { id: 'express', name: 'Express.js', category: 'Backend' },
  { id: 'django', name: 'Django', category: 'Backend' },
  { id: 'flask', name: 'Flask', category: 'Backend' },
  { id: 'fastapi', name: 'FastAPI', category: 'Backend' },
  { id: 'springboot', name: 'Spring Boot', category: 'Backend' },
  { id: 'laravel', name: 'Laravel', category: 'Backend' },
  { id: 'postgresql', name: 'PostgreSQL', category: 'Databases' },
  { id: 'mysql', name: 'MySQL', category: 'Databases' },
  { id: 'mongodb', name: 'MongoDB', category: 'Databases' },
  { id: 'redis', name: 'Redis', category: 'Databases' },
  { id: 'sqlite', name: 'SQLite', category: 'Databases' },
  { id: 'firebase', name: 'Firebase', category: 'Databases' },

  // Tools & DevOps
  { id: 'git', name: 'Git', category: 'Tools' },
  { id: 'github', name: 'GitHub', category: 'Tools' },
  { id: 'docker', name: 'Docker', category: 'DevOps' },
  { id: 'kubernetes', name: 'Kubernetes', category: 'DevOps' },
  { id: 'aws', name: 'AWS', category: 'Cloud' },
  { id: 'azure', name: 'Azure', category: 'Cloud' },
  { id: 'linux', name: 'Linux', category: 'DevOps' },

  // Data Science & AI
  { id: 'pandas', name: 'Pandas', category: 'Data Science' },
  { id: 'numpy', name: 'NumPy', category: 'Data Science' },
  { id: 'machine-learning', name: 'Machine Learning', category: 'Data Science' },
  { id: 'deep-learning', name: 'Deep Learning', category: 'Data Science' },
  { id: 'tensorflow', name: 'TensorFlow', category: 'Data Science' },
  { id: 'pytorch', name: 'PyTorch', category: 'Data Science' },
  { id: 'power-bi', name: 'Power BI', category: 'Data Science' },
  { id: 'tableau', name: 'Tableau', category: 'Data Science' },

  // Design
  { id: 'figma', name: 'Figma', category: 'Design' },
  { id: 'ui-ux', name: 'UI/UX Design', category: 'Design' },
  { id: 'photoshop', name: 'Photoshop', category: 'Design' },
  { id: 'illustrator', name: 'Illustrator', category: 'Design' },

  // Business, Marketing & HR
  { id: 'excel', name: 'Excel', category: 'Business' },
  { id: 'seo', name: 'SEO', category: 'Marketing' },
  { id: 'digital-marketing', name: 'Digital Marketing', category: 'Marketing' },
  { id: 'content-marketing', name: 'Content Marketing', category: 'Marketing' },
  { id: 'social-media', name: 'Social Media Marketing', category: 'Marketing' },
  { id: 'recruitment', name: 'Recruitment', category: 'Human Resources' },
  { id: 'talent-acquisition', name: 'Talent Acquisition', category: 'Human Resources' },
  { id: 'hrm', name: 'HR Management', category: 'Human Resources' },
  { id: 'project-management', name: 'Project Management', category: 'Management' },
  { id: 'agile', name: 'Agile', category: 'Management' },
  { id: 'scrum', name: 'Scrum', category: 'Management' },

  // Soft Skills
  { id: 'communication', name: 'Communication', category: 'Soft Skills' },
  { id: 'teamwork', name: 'Teamwork', category: 'Soft Skills' },
  { id: 'problem-solving', name: 'Problem Solving', category: 'Soft Skills' },
  { id: 'leadership', name: 'Leadership', category: 'Soft Skills' },
  { id: 'time-management', name: 'Time Management', category: 'Soft Skills' },
  { id: 'critical-thinking', name: 'Critical Thinking', category: 'Soft Skills' }
];

export class SkillGraphService {
  /**
   * Fetch all skills taxonomy
   */
  public static async fetchTaxonomySkills(): Promise<Skill[]> {
    try {
      const { data, error } = await supabase.from('skills').select('*').order('name');
      if (error || !data || data.length === 0) {
        return DEFAULT_TAXONOMY;
      }
      
      const dbSkills = data.map(s => ({ id: s.id, name: s.name, category: s.category || 'General' }));
      const dbSkillIds = new Set(dbSkills.map(s => s.id.toLowerCase()));
      
      // Merge dbSkills with DEFAULT_TAXONOMY
      const combined = [...dbSkills];
      DEFAULT_TAXONOMY.forEach(defSkill => {
        if (!dbSkillIds.has(defSkill.id.toLowerCase())) {
          combined.push(defSkill);
        }
      });
      return combined;
    } catch {
      return DEFAULT_TAXONOMY;
    }
  }

  /**
   * Fetch a student's skills graph
   */
  public static async fetchStudentSkills(studentId: string): Promise<StudentSkill[]> {
    if (!studentId) return [];

    const results: StudentSkill[] = [];
    const recordedIds = new Set<string>();

    // 1. Fetch from student_skills table
    try {
      const { data, error } = await supabase
        .from('student_skills')
        .select(`
          id,
          student_id,
          skill_id,
          confidence_score,
          proficiency_level,
          source,
          evidence,
          last_updated,
          skills (name)
        `)
        .eq('student_id', studentId);

      if (!error && data && data.length > 0) {
        data.forEach((item: any) => {
          const sName = item.skills?.name || item.skill_id;
          const cleanId = item.skill_id.toLowerCase();
          recordedIds.add(cleanId);
          recordedIds.add(sName.toLowerCase());

          results.push({
            id: item.id,
            studentId: item.student_id,
            skillId: item.skill_id,
            skillName: sName,
            confidenceScore: Number(item.confidence_score || 0.75),
            proficiencyLevel: item.proficiency_level || 'intermediate',
            source: item.source || 'self',
            evidence: item.evidence || {},
            lastUpdated: item.last_updated
          });
        });
      }
    } catch (e) {
      console.warn('fetchStudentSkills table error:', e);
    }

    // 2. Also merge any skills from profiles.skills array
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('skills')
        .eq('id', studentId)
        .maybeSingle();

      if (profile?.skills && Array.isArray(profile.skills)) {
        profile.skills.forEach((skName: string) => {
          if (!skName || !skName.trim()) return;
          const cleanName = skName.trim();
          const cleanId = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-');
          if (!recordedIds.has(cleanId) && !recordedIds.has(cleanName.toLowerCase())) {
            recordedIds.add(cleanId);
            recordedIds.add(cleanName.toLowerCase());
            results.push({
              id: `${studentId}_${cleanId}`,
              studentId,
              skillId: cleanId,
              skillName: cleanName,
              confidenceScore: 0.80,
              proficiencyLevel: 'intermediate',
              source: 'self',
              evidence: { details: 'Profile skill' },
              lastUpdated: new Date().toISOString()
            });
          }
        });
      }
    } catch (pErr) {
      console.warn('fetchStudentSkills profile sync note:', pErr);
    }

    return results;
  }

  /**
   * Batch upsert accepted student skills after student approval
   */
  public static async acceptStudentSkills(studentId: string, skillsToAccept: SkillSuggestion[]): Promise<void> {
    if (!studentId || !skillsToAccept || skillsToAccept.length === 0) return;

    // 1. Ensure skills exist in `skills` table to prevent foreign key errors
    try {
      const taxonomyRows = skillsToAccept.map(s => ({
        id: s.skillId.toLowerCase(),
        name: s.skillName || s.skillId,
        category: s.category || 'General'
      }));
      await supabase.from('skills').upsert(taxonomyRows, { onConflict: 'id', ignoreDuplicates: true });
    } catch (e) {
      console.warn('Note on skills table upsert:', e);
    }

    // 2. Prepare student_skills rows
    const rows = skillsToAccept.map(s => ({
      student_id: studentId,
      skill_id: s.skillId.toLowerCase(),
      confidence_score: s.source === 'github' ? 0.85 : (s.source === 'resume' ? 0.75 : 0.80),
      proficiency_level: s.proficiencyLevel || 'intermediate',
      source: s.source || 'self',
      evidence: { details: s.evidence || 'User skill', accepted_at: new Date().toISOString() },
      last_updated: new Date().toISOString()
    }));

    // Try upserting into student_skills table
    try {
      const { error } = await supabase
        .from('student_skills')
        .upsert(rows, { onConflict: 'student_id,skill_id,source' });

      if (error) {
        console.warn('student_skills table upsert note (will sync to profile):', error);
      }
    } catch (err) {
      console.warn('student_skills upsert error:', err);
    }

    // 3. Always sync with profiles.skills array so skills are permanently preserved and accessible
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('skills')
        .eq('id', studentId)
        .maybeSingle();

      const currentSkills: string[] = profile?.skills || [];
      const newSkillNames = skillsToAccept.map(s => s.skillName || s.skillId);
      const updatedSkills = Array.from(new Set([...currentSkills, ...newSkillNames]));

      await supabase
        .from('profiles')
        .update({ skills: updatedSkills })
        .eq('id', studentId);
    } catch (profErr) {
      console.warn('profiles skills update note:', profErr);
    }
  }

  /**
   * Delete a student skill from both student_skills and profiles.skills
   */
  public static async deleteStudentSkill(studentId: string, skillId: string, skillName?: string): Promise<void> {
    if (!studentId || !skillId) return;

    const cleanSkillId = skillId.toLowerCase();
    const targetName = (skillName || skillId).toLowerCase();

    // 1. Delete from student_skills table
    try {
      await supabase
        .from('student_skills')
        .delete()
        .eq('student_id', studentId)
        .eq('skill_id', cleanSkillId);
    } catch (err) {
      console.warn('Error deleting from student_skills:', err);
    }

    // 2. Remove from profiles.skills array
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('skills')
        .eq('id', studentId)
        .maybeSingle();

      if (profile?.skills && Array.isArray(profile.skills)) {
        const updatedSkills = profile.skills.filter(
          (s: string) => s.toLowerCase() !== targetName && s.toLowerCase().replace(/[^a-z0-9]/g, '-') !== cleanSkillId
        );
        await supabase
          .from('profiles')
          .update({ skills: updatedSkills })
          .eq('id', studentId);
      }
    } catch (profErr) {
      console.warn('Error updating profile skills on delete:', profErr);
    }
  }

  /**
   * GitHub Integration: Fetch read-only public repo languages & activity
   * Source weight: 0.6
   */
  public static async parseGitHubProfile(username: string): Promise<SkillSuggestion[]> {
    if (!username || !username.trim()) return [];

    try {
      const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username.trim())}/repos?sort=updated&per_page=30`);
      if (!response.ok) {
        throw new Error(`GitHub user "${username}" not found or API limit reached.`);
      }

      const repos = await response.json();
      if (!Array.isArray(repos)) return [];

      const languageCounts: Record<string, number> = {};
      let totalStars = 0;

      repos.forEach((repo: any) => {
        if (repo.language) {
          languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
        }
        totalStars += repo.stargazers_count || 0;
      });

      const taxonomy = await this.fetchTaxonomySkills();
      const suggestions: SkillSuggestion[] = [];

      Object.entries(languageCounts).forEach(([langName, count]) => {
        const matchedTaxonomy = taxonomy.find(
          t => t.name.toLowerCase() === langName.toLowerCase() || t.id.toLowerCase() === langName.toLowerCase()
        );

        const skillId = matchedTaxonomy ? matchedTaxonomy.id : langName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const skillCategory = matchedTaxonomy ? matchedTaxonomy.category : 'Languages';
        const skillName = matchedTaxonomy ? matchedTaxonomy.name : langName;

        let proficiency: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
        if (count >= 5 || totalStars >= 10) proficiency = 'advanced';
        else if (count >= 2) proficiency = 'intermediate';

        if (!suggestions.some(s => s.skillId.toLowerCase() === skillId.toLowerCase())) {
          suggestions.push({
            skillId,
            skillName,
            category: skillCategory,
            source: 'github',
            confidenceScore: 0.85, // Weighted 0.6 in overall model
            proficiencyLevel: proficiency,
            evidence: `Found in ${count} GitHub repositories (${totalStars} total stars)`
          });
        }
      });

      return suggestions;
    } catch (err) {
      console.warn('GitHub parsing error:', err);
      throw err;
    }
  }

  /**
   * Resume Skill Parser: Extract skills from resume text
   * Source weight: 0.25
   */
  public static parseResumeSkills(resumeText: string, taxonomy: Skill[]): SkillSuggestion[] {
    if (!resumeText || !resumeText.trim()) return [];

    const textUpper = resumeText.toUpperCase();
    const suggestions: SkillSuggestion[] = [];
    const matchedIds = new Set<string>();

    const allSkills = taxonomy && taxonomy.length > 0 ? taxonomy : DEFAULT_TAXONOMY;

    allSkills.forEach(skill => {
      const skillName = skill.name.toUpperCase();
      // Match exact word or boundary
      const regex = new RegExp(`\\b${skillName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if ((regex.test(resumeText) || textUpper.includes(skillName)) && !matchedIds.has(skill.id.toLowerCase())) {
        matchedIds.add(skill.id.toLowerCase());
        suggestions.push({
          skillId: skill.id,
          skillName: skill.name,
          category: skill.category,
          source: 'resume',
          confidenceScore: 0.75, // Weight 0.25 in overall model
          proficiencyLevel: 'intermediate',
          evidence: `Extracted from uploaded resume text keyword match: "${skill.name}"`
        });
      }
    });

    return suggestions;
  }

  /**
   * Calculate Internship Skill Match Score (%)
   * Overlap between student skills and required internship skills
   */
  public static calculateMatchScore(studentSkills: StudentSkill[], listingSkills: string[]): number {
    if (!listingSkills || listingSkills.length === 0) return 85; // Default score if listing lists no explicit skills

    const studentSkillMap = new Map<string, number>();
    studentSkills.forEach(sk => {
      // Weight sources: github=0.6, resume=0.25, self=0.15
      const weight = sk.source === 'github' ? 0.6 : (sk.source === 'resume' ? 0.25 : 0.15);
      const profMultiplier = sk.proficiencyLevel === 'advanced' ? 1.0 : (sk.proficiencyLevel === 'intermediate' ? 0.8 : 0.6);
      studentSkillMap.set(sk.skillId.toLowerCase(), weight * profMultiplier);
      if (sk.skillName) {
        studentSkillMap.set(sk.skillName.toLowerCase(), weight * profMultiplier);
      }
    });

    let matchedCount = 0;
    let totalPossible = listingSkills.length;

    listingSkills.forEach(reqSkill => {
      const lower = reqSkill.toLowerCase();
      if (studentSkillMap.has(lower)) {
        matchedCount += 1;
      }
    });

    const rawPercentage = Math.round((matchedCount / totalPossible) * 100);
    // Ensure base score stays present for baseline skills
    return Math.max(30, Math.min(98, rawPercentage > 0 ? rawPercentage : 45));
  }

  /**
   * Get Course Gap Recommendations for missing required skills
   */
  public static getSkillGapCourses(studentSkills: StudentSkill[], requiredSkills: string[]): CourseRecommendation[] {
    const studentSkillIds = new Set(studentSkills.map(s => s.skillId.toLowerCase()));
    if (studentSkills.length > 0) {
      studentSkills.forEach(s => {
        if (s.skillName) studentSkillIds.add(s.skillName.toLowerCase());
      });
    }

    const missingSkills = requiredSkills.filter(sk => !studentSkillIds.has(sk.toLowerCase()));
    const recommendations: CourseRecommendation[] = [];

    missingSkills.forEach(missing => {
      const key = missing.toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (COURSE_LIBRARY[key]) {
        recommendations.push(COURSE_LIBRARY[key]);
      } else {
        recommendations.push({
          skillId: key,
          skillName: missing,
          courseTitle: `Mastering ${missing} for Professional Success`,
          platform: 'Coursera / freeCodeCamp',
          url: `https://www.coursera.org/search?query=${encodeURIComponent(missing)}`,
          level: 'Beginner to Intermediate',
          estimatedHours: 20
        });
      }
    });

    return recommendations;
  }
}
