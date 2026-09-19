import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Code,
  Database,
  ExternalLink,
  Filter,
  HelpCircle,
  LucideIcon,
  Play,
  RotateCcw,
  Search,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  Target,
  Terminal,
  Trophy,
  X,
  Bookmark,
  Heart
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useNotifications } from '../components/NotificationSystem';
import { useAuth } from '../context/AuthContext';
import { BookmarkService } from '../services/bookmarkService';
import { SkillGraphService } from '../services/skillGraphService';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Assessment {
  id: string;
  title: string;
  category: 'Frontend' | 'Backend' | 'Data Science' | 'Mobile' | 'Languages' | 'DevOps' | 'Design';
  icon: LucideIcon;
  skillId: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  questionsCount: number;
  passPercentage: number;
  rating: number;
  takersCount: number;
  description: string;
  questions: QuizQuestion[];
}

const ASSESSMENTS: Assessment[] = [
  {
    id: 'eval_react',
    title: 'React.js Proficiency Assessment',
    category: 'Frontend',
    icon: Code,
    skillId: 'react',
    difficulty: 'Intermediate',
    duration: '15 mins',
    questionsCount: 5,
    passPercentage: 70,
    rating: 4.9,
    takersCount: 1420,
    description: 'Test your understanding of React hooks, component lifecycle, virtual DOM, state management, and performance optimization.',
    questions: [
      {
        id: 1,
        question: 'What is the main purpose of useEffect hook in React?',
        options: [
          'To handle form input states',
          'To perform side effects in function components',
          'To memoize heavy calculations',
          'To create global context stores'
        ],
        correctIndex: 1,
        explanation: 'useEffect is used for side effects like data fetching, subscriptions, or manually changing the DOM.'
      },
      {
        id: 2,
        question: 'Which Hook should be used to optimize expensive calculations?',
        options: ['useCallback', 'useMemo', 'useRef', 'useImperativeHandle'],
        correctIndex: 1,
        explanation: 'useMemo returns a memoized value that only recomputes when dependencies change.'
      },
      {
        id: 3,
        question: 'What happens when state updates in a React component?',
        options: [
          'The entire webpage reloads',
          'The component and its children re-render',
          'Only the component styles refresh',
          'The browser DOM is rebuilt from scratch'
        ],
        correctIndex: 1,
        explanation: 'State changes trigger a re-render of the component and its child subtree.'
      },
      {
        id: 4,
        question: 'How do you pass data down from parent to child components?',
        options: ['State', 'Props', 'Reducers', 'Effects'],
        correctIndex: 1,
        explanation: 'Props are used to pass read-only data down the component tree.'
      },
      {
        id: 5,
        question: 'Why is a unique "key" prop required when rendering lists in React?',
        options: [
          'To style list items individually',
          'To help React identify which items have changed, added, or removed',
          'To enable CSS grid animations',
          'To automatically sort list elements'
        ],
        correctIndex: 1,
        explanation: 'Keys give elements a stable identity across renders for efficient Virtual DOM reconciliation.'
      }
    ]
  },
  {
    id: 'eval_js',
    title: 'Modern JavaScript (ES6+) Assessment',
    category: 'Languages',
    icon: Terminal,
    skillId: 'javascript',
    difficulty: 'Intermediate',
    duration: '15 mins',
    questionsCount: 5,
    passPercentage: 70,
    rating: 4.8,
    takersCount: 2310,
    description: 'Validate your knowledge of closures, async/await, promises, event loop, destructuring, and array methods.',
    questions: [
      {
        id: 1,
        question: 'What will typeof NaN return in JavaScript?',
        options: ['"nan"', '"undefined"', '"number"', '"object"'],
        correctIndex: 2,
        explanation: 'NaN stands for "Not-a-Number", but its language type is actually "number".'
      },
      {
        id: 2,
        question: 'What is closure in JavaScript?',
        options: [
          'A method to stop loop execution',
          'A function combined with references to its surrounding lexical environment',
          'A syntax error in arrow functions',
          'An automatic memory cleanup mechanism'
        ],
        correctIndex: 1,
        explanation: 'Closure allows an inner function to access variables from an enclosing outer scope even after the outer function has returned.'
      },
      {
        id: 3,
        question: 'Which method returns a new array with all elements that pass a test?',
        options: ['map()', 'filter()', 'forEach()', 'reduce()'],
        correctIndex: 1,
        explanation: 'filter() creates a shallow copy of a portion of a given array, filtered down to just the elements that pass the test.'
      },
      {
        id: 4,
        question: 'How does async/await interact with Promises?',
        options: [
          'Async functions always return a Promise',
          'Await can be used anywhere in synchronous code',
          'Async functions convert Promises into callbacks',
          'Async/await replaces the event loop'
        ],
        correctIndex: 0,
        explanation: 'An async function implicitly wraps its return value in a resolved Promise.'
      },
      {
        id: 5,
        question: 'What is the difference between "==" and "===" in JavaScript?',
        options: [
          '"==" checks value only with type coercion, while "===" checks both value and type',
          '"===" allows string-number coercion',
          'There is no functional difference',
          '"==" is faster than "===" in all browsers'
        ],
        correctIndex: 0,
        explanation: 'Strict equality (===) does not perform type conversion before comparing values.'
      }
    ]
  },
  {
    id: 'eval_python',
    title: 'Python for Developers & Data Science',
    category: 'Languages',
    icon: Code,
    skillId: 'python',
    difficulty: 'Beginner',
    duration: '12 mins',
    questionsCount: 4,
    passPercentage: 75,
    rating: 4.9,
    takersCount: 1890,
    description: 'Assess core Python data structures, list comprehensions, decorators, generators, and OOP fundamentals.',
    questions: [
      {
        id: 1,
        question: 'Which data structure in Python is immutable?',
        options: ['List', 'Dictionary', 'Tuple', 'Set'],
        correctIndex: 2,
        explanation: 'Tuples are immutable sequence types in Python whose values cannot be changed after creation.'
      },
      {
        id: 2,
        question: 'What is a Python decorator?',
        options: [
          'A GUI styling module',
          'A function that takes another function as an argument and extends its behavior',
          'A built-in class for code formatting',
          'A database ORM mapper'
        ],
        correctIndex: 1,
        explanation: 'Decorators allow you to wrap another function to extend its behavior without permanently modifying it.'
      },
      {
        id: 3,
        question: 'What does list comprehension `[x**2 for x in range(3)]` output?',
        options: ['[1, 4, 9]', '[0, 1, 4]', '[0, 1, 2]', '[1, 2, 3]'],
        correctIndex: 1,
        explanation: 'range(3) yields 0, 1, 2. Squaring each yields 0, 1, 4.'
      },
      {
        id: 4,
        question: 'How are keyword arguments passed in a Python function call?',
        options: ['name:value', 'name=value', 'name=>value', 'name->value'],
        correctIndex: 1,
        explanation: 'Python uses identifier=value syntax for keyword arguments in function calls.'
      }
    ]
  },
  {
    id: 'eval_node',
    title: 'Node.js & Backend Architecture',
    category: 'Backend',
    icon: Database,
    skillId: 'nodejs',
    difficulty: 'Advanced',
    duration: '20 mins',
    questionsCount: 4,
    passPercentage: 70,
    rating: 4.7,
    takersCount: 980,
    description: 'Evaluate event loop phases, Streams, Express middleware, worker threads, and REST API design principles.',
    questions: [
      {
        id: 1,
        question: 'Which mechanism executes asynchronous I/O callbacks in Node.js?',
        options: ['Multi-threaded CPU loop', 'Libuv Event Loop', 'V8 Compiler Thread', 'OS Process Manager'],
        correctIndex: 1,
        explanation: 'Node.js uses the Libuv C library to handle the event loop and asynchronous operation pool.'
      },
      {
        id: 2,
        question: 'What is process.nextTick() used for?',
        options: [
          'Scheduling a callback to run at the start of the next event loop iteration before I/O',
          'Setting a 1-second delay',
          'Creating worker threads',
          'Pausing HTTP server execution'
        ],
        correctIndex: 0,
        explanation: 'process.nextTick fires its callback immediately after the current operation finishes, before continuing the event loop.'
      },
      {
        id: 3,
        question: 'What is the advantage of using Streams over reading full buffers?',
        options: [
          'Streams auto-encrypt data payload',
          'Streams process large files in chunks without exhausting memory',
          'Streams make database queries faster',
          'Streams prevent SQL injection attacks'
        ],
        correctIndex: 1,
        explanation: 'Streams allow processing continuous chunks of data without loading entire files into RAM at once.'
      },
      {
        id: 4,
        question: 'In Express.js, what parameter must be called to pass control to the next middleware?',
        options: ['continue()', 'next()', 'forward()', 'resolve()'],
        correctIndex: 1,
        explanation: 'Invoking next() transfers execution to the next middleware function in the chain.'
      }
    ]
  },
  {
    id: 'eval_sql',
    title: 'PostgreSQL & Database Queries Assessment',
    category: 'Backend',
    icon: Database,
    skillId: 'postgresql',
    difficulty: 'Intermediate',
    duration: '15 mins',
    questionsCount: 4,
    passPercentage: 70,
    rating: 4.8,
    takersCount: 1150,
    description: 'Test your SQL skills in indexing, INNER/LEFT joins, transactions, GROUP BY aggregations, and normalization.',
    questions: [
      {
        id: 1,
        question: 'Which SQL JOIN returns all rows from the left table and matched rows from the right table?',
        options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN'],
        correctIndex: 1,
        explanation: 'LEFT JOIN returns all records from the left table, and the matched records from the right table (NULL if no match).'
      },
      {
        id: 2,
        question: 'What is the purpose of a database Index (e.g. B-Tree)?',
        options: [
          'To encrypt user passwords',
          'To speed up query data retrieval operations',
          'To auto-generate backup tables',
          'To validate email formats'
        ],
        correctIndex: 1,
        explanation: 'Indexes create efficient lookup data structures to dramatically speed up SELECT filtering.'
      },
      {
        id: 3,
        question: 'What does the SQL command ROLLBACK do inside a transaction?',
        options: [
          'Saves all table changes permanently',
          'Cancels all database operations since the start of the current transaction',
          'Deletes the database schema',
          'Restarts PostgreSQL server daemon'
        ],
        correctIndex: 1,
        explanation: 'ROLLBACK reverts uncommitted changes made in the current transaction block.'
      },
      {
        id: 4,
        question: 'Which clause is used to filter aggregated group results in SQL?',
        options: ['WHERE', 'HAVING', 'GROUP FILTER', 'ORDER BY'],
        correctIndex: 1,
        explanation: 'HAVING filters results AFTER aggregation (GROUP BY), whereas WHERE filters individual rows BEFORE aggregation.'
      }
    ]
  },
  {
    id: 'eval_figma',
    title: 'UI/UX & Figma Design Assessment',
    category: 'Design',
    icon: Sparkles,
    skillId: 'figma',
    difficulty: 'Beginner',
    duration: '10 mins',
    questionsCount: 4,
    passPercentage: 75,
    rating: 4.9,
    takersCount: 1640,
    description: 'Verify your mastery of Auto Layout, components, design tokens, wireframing, and user research workflows.',
    questions: [
      {
        id: 1,
        question: 'What is Figma Auto Layout used for?',
        options: [
          'To auto-generate code for mobile apps',
          'To create responsive containers that adjust padding and alignment dynamically',
          'To export PNGs automatically',
          'To check color contrast compliance'
        ],
        correctIndex: 1,
        explanation: 'Auto Layout creates dynamic frames that shrink or grow to fit their content and maintain layout structure.'
      },
      {
        id: 2,
        question: 'What is a Component Variant in Figma?',
        options: [
          'A duplicated image asset',
          'A grouping of similar component states (e.g., Hover, Active, Disabled)',
          'A plugin for CSS export',
          'A vector path tool'
        ],
        correctIndex: 1,
        explanation: 'Variants group component variations together into single interactive components with customizable properties.'
      },
      {
        id: 3,
        question: 'What is wireframing in UI/UX design?',
        options: [
          'High-resolution final visual styling with images',
          'A low-fidelity structural layout blueprint of a page or interface',
          'Frontend code implementation in HTML',
          'User database schema design'
        ],
        correctIndex: 1,
        explanation: 'Wireframes focus on content hierarchy and spatial layouts without full visual design.'
      },
      {
        id: 4,
        question: 'What is the minimum recommended WCAG color contrast ratio for normal text?',
        options: ['2:1', '3:1', '4.5:1', '10:1'],
        correctIndex: 2,
        explanation: 'WCAG 2.1 AA requires a contrast ratio of at least 4.5:1 for normal body text.'
      }
    ]
  }
];

const SkillAssessment: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [bookmarkedAssessments, setBookmarkedAssessments] = useState<Set<string>>(new Set());

  // Quiz Modal State
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [submittingScore, setSubmittingScore] = useState(false);

  const { addNotification } = useNotifications();
  const { user } = useAuth();

  useEffect(() => {
    loadSaved();
  }, [user?.id]);

  const loadSaved = async () => {
    try {
      const savedIds = await BookmarkService.fetchSavedItemIds(user?.id);
      setBookmarkedAssessments(savedIds);
    } catch (err) {
      console.error('Error loading saved assessments:', err);
    }
  };

  const handleBookmark = async (assessment: Assessment) => {
    if (!user) {
      addNotification({
        type: 'warning',
        title: 'Sign in required',
        message: 'Please sign in to bookmark skill assessments.'
      });
      return;
    }

    const isSavedNow = await BookmarkService.toggleSavedItem(
      user.id,
      assessment.id,
      'resource',
      { title: assessment.title, category: assessment.category, id: assessment.id }
    );

    setBookmarkedAssessments(prev => {
      const next = new Set(prev);
      if (isSavedNow) next.add(assessment.id);
      else next.delete(assessment.id);
      return next;
    });

    addNotification({
      type: isSavedNow ? 'success' : 'info',
      title: isSavedNow ? 'Assessment Saved' : 'Removed',
      message: `${assessment.title} ${isSavedNow ? 'added to' : 'removed from'} bookmarks`
    });
  };

  const filteredAssessments = useMemo(() => {
    return ASSESSMENTS.filter(item => {
      const matchesSearch = !searchTerm ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = !categoryFilter || categoryFilter === 'All' || item.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, categoryFilter]);

  const startQuiz = (assessment: Assessment) => {
    setActiveAssessment(assessment);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
  };

  const closeQuiz = () => {
    setActiveAssessment(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
  };

  const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const calculateScore = () => {
    if (!activeAssessment) return { correct: 0, total: 0, percentage: 0, passed: false };
    let correct = 0;
    activeAssessment.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });
    const total = activeAssessment.questions.length;
    const percentage = Math.round((correct / total) * 100);
    const passed = percentage >= activeAssessment.passPercentage;
    return { correct, total, percentage, passed };
  };

  const handleSubmitQuiz = async () => {
    if (!activeAssessment) return;

    if (Object.keys(selectedAnswers).length < activeAssessment.questions.length) {
      addNotification({
        type: 'warning',
        title: 'Unanswered Questions',
        message: 'Please answer all questions before submitting.'
      });
      return;
    }

    setQuizSubmitted(true);
    const score = calculateScore();

    if (user?.id) {
      setSubmittingScore(true);
      try {
        const level: 'beginner' | 'intermediate' | 'advanced' = 
          score.percentage >= 85 ? 'advanced' : score.percentage >= 70 ? 'intermediate' : 'beginner';

        await SkillGraphService.addStudentSkill({
          studentId: user.id,
          skillId: activeAssessment.skillId,
          confidenceScore: Number((score.percentage / 100).toFixed(2)),
          proficiencyLevel: level,
          source: 'assessment'
        });

        addNotification({
          type: score.passed ? 'success' : 'info',
          title: score.passed ? 'Skill Badge Earned!' : 'Assessment Completed',
          message: `Your score (${score.percentage}%) has been saved to your Skill Graph!`
        });
      } catch (err) {
        console.error('Error saving assessment score:', err);
      } finally {
        setSubmittingScore(false);
      }
    } else {
      addNotification({
        type: score.passed ? 'success' : 'info',
        title: score.passed ? 'Assessment Passed!' : 'Assessment Completed',
        message: `You scored ${score.percentage}%. Sign in to save this badge to your profile!`
      });
    }
  };

  const categories = ['All', 'Frontend', 'Backend', 'Languages', 'Design', 'Data Science'];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Hero Banner */}
        <div className="bg-white rounded-card border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 sm:p-12 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-teal-50 border border-teal-100 rounded-full text-xs font-semibold text-teal-700">
              <Award className="w-4 h-4 text-teal-500" />
              <span>Verified Skill Certification</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-800">
              Skill Assessment &amp; Certifications
            </h1>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Validate your technical competencies with industry-aligned interactive assessments. Earn verified badges that sync directly to your profile and match with top tech employers.
            </p>
          </div>

          <div className="absolute right-[-20px] bottom-[-20px] opacity-5 hidden lg:block">
            <Trophy className="w-80 h-80 text-teal-600" />
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="bg-white rounded-card p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search assessments (e.g., React, Python, SQL, Figma)..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-700"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-semibold">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat === 'All' ? '' : cat)}
                  className={`px-3 py-2 rounded-tag transition-all flex-shrink-0 ${
                    (cat === 'All' && !categoryFilter) || categoryFilter === cat
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Assessment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssessments.map(item => {
            const IconComp = item.icon;
            const isSaved = bookmarkedAssessments.has(item.id);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-card border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.14)] transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center text-teal-600 group-hover:scale-105 transition-transform">
                      <IconComp className="w-6 h-6" />
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-tag ${
                        item.difficulty === 'Beginner'
                          ? 'bg-teal-50 text-teal-700 border border-teal-100'
                          : item.difficulty === 'Intermediate'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {item.difficulty}
                      </span>

                      <button
                        onClick={() => handleBookmark(item)}
                        className={`p-2 rounded-xl border transition-colors ${
                          isSaved ? 'bg-rose-50 border-rose-200 text-rose-500' : 'border-slate-200 text-slate-400 hover:text-teal-600 hover:border-teal-200'
                        }`}
                      >
                        <Heart className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 text-base group-hover:text-teal-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.questionsCount} MCQs</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      <span>{item.rating} rating</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Target className="w-3.5 h-3.5 text-teal-500" />
                      <span>{item.passPercentage}% Pass Mark</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <Button
                    onClick={() => startQuiz(item)}
                    variant="ghost"
                    className="w-full justify-center text-xs py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-btn"
                  >
                    <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                    <span>Take Assessment</span>
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredAssessments.length === 0 && (
          <div className="bg-white rounded-card p-12 text-center border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] space-y-3">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No Assessments Found</h3>
            <p className="text-xs text-slate-500">Try adjusting your search query or selecting another category.</p>
            <Button onClick={() => { setSearchTerm(''); setCategoryFilter(''); }} variant="ghost" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white rounded-btn">
              Clear Filters
            </Button>
          </div>
        )}

      </div>

      {/* Interactive Quiz Modal */}
      <AnimatePresence>
        {activeAssessment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-card shadow-[0_20px_60px_rgb(0,0,0,0.2)] max-w-2xl w-full overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 bg-teal-600 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase bg-white/20 text-white px-2.5 py-0.5 rounded-tag border border-white/20">
                    {activeAssessment.category} • {activeAssessment.difficulty}
                  </span>
                  <h3 className="text-lg font-bold mt-1">{activeAssessment.title}</h3>
                </div>

                <button onClick={closeQuiz} className="text-white/70 hover:text-white p-1 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {!quizSubmitted ? (
                  <>
                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                        <span>Question {currentQuestionIndex + 1} of {activeAssessment.questions.length}</span>
                        <span className="text-teal-600">{Math.round(((currentQuestionIndex + 1) / activeAssessment.questions.length) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-teal-500 h-full transition-all duration-300"
                          style={{ width: `${((currentQuestionIndex + 1) / activeAssessment.questions.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Question Card */}
                    {(() => {
                      const q = activeAssessment.questions[currentQuestionIndex];
                      const selectedOpt = selectedAnswers[currentQuestionIndex];

                      return (
                        <div className="space-y-4">
                          <h4 className="text-sm sm:text-base font-bold text-slate-800 leading-snug">
                            {q.question}
                          </h4>

                          <div className="space-y-2.5">
                            {q.options.map((opt, optIdx) => {
                              const isSelected = selectedOpt === optIdx;

                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleOptionSelect(currentQuestionIndex, optIdx)}
                                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between font-medium ${
                                    isSelected
                                      ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-sm'
                                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-teal-200'
                                  }`}
                                >
                                  <span>{opt}</span>
                                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                                    isSelected ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300 text-slate-400'
                                  }`}>
                                    {String.fromCharCode(65 + optIdx)}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  /* Quiz Result Screen */
                  {...(() => {
                    const score = calculateScore();
                    return (
                      <div className="text-center py-6 space-y-6">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg ${
                          score.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          <Trophy className="w-10 h-10" />
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-2xl font-black text-slate-800">
                            {score.passed ? 'Congratulations! Assessment Passed 🎉' : 'Assessment Completed'}
                          </h3>
                          <p className="text-slate-500 text-sm">
                            You scored <span className="font-bold text-teal-600">{score.percentage}%</span> ({score.correct}/{score.total} correct).
                            Pass score threshold was {activeAssessment.passPercentage}%.
                          </p>
                        </div>

                        {score.passed && (
                          <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl text-teal-800 text-left space-y-1">
                            <div className="flex items-center font-bold text-xs">
                              <CheckCircle2 className="w-4 h-4 mr-1.5 text-teal-600" />
                              <span>Verified Skill Badge Added</span>
                            </div>
                            <p className="text-[11px] text-teal-700">
                              Your proficiency level for {activeAssessment.title} has been updated in your Skill Graph.
                            </p>
                          </div>
                        )}

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-center space-x-3">
                          <Button onClick={() => startQuiz(activeAssessment)} variant="ghost" className="bg-white border border-teal-600 text-teal-600 hover:bg-teal-50 rounded-btn">
                            <RotateCcw className="w-4 h-4 mr-1.5" /> Retake Test
                          </Button>
                          <Button onClick={closeQuiz} variant="ghost" className="bg-teal-600 hover:bg-teal-700 text-white rounded-btn">
                            Done
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                )}
              </div>

              {/* Modal Footer Controls */}
              {!quizSubmitted && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 font-semibold text-slate-500 hover:text-teal-700 disabled:opacity-40 text-xs transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center space-x-2">
                    {currentQuestionIndex < activeAssessment.questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestionIndex(prev => Math.min(activeAssessment.questions.length - 1, prev + 1))}
                        className="px-5 py-2 bg-teal-600 text-white font-bold rounded-btn text-xs hover:bg-teal-700 transition-colors"
                      >
                        Next Question
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={submittingScore}
                        className="px-6 py-2 bg-teal-600 text-white font-bold rounded-btn text-xs hover:bg-teal-700 disabled:opacity-50 transition-colors"
                      >
                        {submittingScore ? 'Saving Score...' : 'Submit Assessment'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SkillAssessment;
