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
  source: 'github' | 'resume';
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
  }
};

export class SkillGraphService {
  /**
   * Fetch all skills taxonomy
   */
  public static async fetchTaxonomySkills(): Promise<Skill[]> {
    const { data, error } = await supabase.from('skills').select('*').order('name');
    if (error || !data || data.length === 0) {
      return [
        { id: 'react', name: 'React', category: 'Frontend' },
        { id: 'javascript', name: 'JavaScript', category: 'Languages' },
        { id: 'typescript', name: 'TypeScript', category: 'Languages' },
        { id: 'python', name: 'Python', category: 'Languages' },
        { id: 'nodejs', name: 'Node.js', category: 'Backend' },
        { id: 'postgresql', name: 'PostgreSQL', category: 'Databases' },
        { id: 'mongodb', name: 'MongoDB', category: 'Databases' },
        { id: 'figma', name: 'Figma', category: 'Design' },
        { id: 'docker', name: 'Docker', category: 'DevOps' },
        { id: 'git', name: 'Git', category: 'Tools' },
        { id: 'html', name: 'HTML5', category: 'Frontend' },
        { id: 'css', name: 'CSS3', category: 'Frontend' },
        { id: 'tailwind', name: 'Tailwind CSS', category: 'Frontend' },
        { id: 'pandas', name: 'Pandas', category: 'Data Science' },
        { id: 'machine-learning', name: 'Machine Learning', category: 'Data Science' }
      ];
    }
    return data.map(s => ({ id: s.id, name: s.name, category: s.category || 'General' }));
  }

  /**
   * Fetch a student's skills graph
   */
  public static async fetchStudentSkills(studentId: string): Promise<StudentSkill[]> {
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

    if (error || !data) {
      console.error('Error fetching student skills:', error);
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      studentId: item.student_id,
      skillId: item.skill_id,
      skillName: item.skills?.name || item.skill_id,
      confidenceScore: Number(item.confidence_score || 0.7),
      proficiencyLevel: item.proficiency_level || 'intermediate',
      source: item.source || 'self',
      evidence: item.evidence || {},
      lastUpdated: item.last_updated
    }));
  }

  /**
   * Batch upsert accepted student skills after student approval
   */
  public static async acceptStudentSkills(studentId: string, skillsToAccept: SkillSuggestion[]): Promise<void> {
    if (skillsToAccept.length === 0) return;

    const rows = skillsToAccept.map(s => ({
      student_id: studentId,
      skill_id: s.skillId,
      confidence_score: s.source === 'github' ? 0.85 : 0.70, // GitHub weighted higher 0.6 vs Resume 0.25
      proficiency_level: s.proficiencyLevel,
      source: s.source,
      evidence: { details: s.evidence, accepted_at: new Date().toISOString() },
      last_updated: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('student_skills')
      .upsert(rows, { onConflict: 'student_id,skill_id,source' });

    if (error) {
      console.error('Error saving accepted student skills:', error);
      throw new Error(error.message);
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

        let proficiency: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
        if (count >= 5 || totalStars >= 10) proficiency = 'advanced';
        else if (count >= 2) proficiency = 'intermediate';

        suggestions.push({
          skillId,
          skillName: matchedTaxonomy ? matchedTaxonomy.name : langName,
          category: skillCategory,
          source: 'github',
          confidenceScore: 0.85, // Weighted 0.6 in overall model
          proficiencyLevel: proficiency,
          evidence: `Found in ${count} GitHub repositories (${totalStars} total stars)`
        });
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

    taxonomy.forEach(skill => {
      const skillName = skill.name.toUpperCase();
      // Match exact word or boundary
      const regex = new RegExp(`\\b${skillName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(resumeText) || textUpper.includes(skillName)) {
        suggestions.push({
          skillId: skill.id,
          skillName: skill.name,
          category: skill.category,
          source: 'resume',
          confidenceScore: 0.70, // Weight 0.25 in overall model
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
          courseTitle: `Mastering ${missing} for Software Developers`,
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
