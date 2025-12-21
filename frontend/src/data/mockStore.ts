// Mock хранилище для демо-версии

export interface Category {
  id: string;
  label: string;
  position: { x: number; y: number };
  courses: Course[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  format: string;
  level: string;
  duration: string;
  intensity: string;
  goal: string;
  createdAt: string;
  // Расширенные поля для маркетплейса и коммьюнити
  isPaid?: boolean;
  price?: number;
  isPublic?: boolean;
  isPrivate?: boolean; // Приватный курс (доступ по ссылке)
  shareLink?: string; // Ссылка для доступа к приватному курсу
  enrolledStudents?: string[]; // ID студентов, записанных на курс
  studentProgress?: Record<string, { // Прогресс каждого студента
    completedLessons: string[]; // ID завершенных уроков
    lastAccessed?: string; // Дата последнего доступа
    enrolledAt: string; // Дата записи
    progress: number; // Процент прогресса
  }>;
  tags?: string[];
  language?: string;
  createdBy?: string;
  publishedAt?: string; // Дата публикации в сообществе
  views?: number; // Количество просмотров
  modules: Module[];
}

// Курсы, которыми поделились в коммьюнити (маркетплейс знаний)
export interface SharedCourse {
  id: string;
  courseId: string;
  sharedAt: string;
  authorName: string;
  authorAvatar: string;
  enrolledCount: number;
  rating: number;
  reviewsCount: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

export interface PracticeExercise {
  title: string;
  description: string;
  difficulty: string;
  estimated_time?: string;
  solution_hint?: string;
}

export interface VideoMaterial {
  title: string;
  url: string;
  description?: string;
  duration?: string;
  channel?: string;
}

export interface AdditionalMaterial {
  title: string;
  type: string;
  url?: string;
  description?: string;
}

export interface TermExplanation {
  term: str;
  explanation: str;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  practice_exercises?: PracticeExercise[];
  videos?: VideoMaterial[];
  additional_materials?: AdditionalMaterial[];
  duration_minutes?: number;
  // Список терминов с объяснениями
  terms?: TermExplanation[];
}

let categories: Category[] = [];

let courses: Course[] = [];
let sharedCourses: SharedCourse[] = [];
let users: UserProfile[] = [
  {
    id: 'me',
    name: 'Вы',
    avatar: 'ВЫ',
    bio: 'Создатель курсов в Fill AI',
  },
  {
    id: 'alice',
    name: 'Алиса Петрова',
    avatar: 'АП',
    bio: 'Frontend-разработчик и ментор по React',
  },
  {
    id: 'mike',
    name: 'Михаил Смирнов',
    avatar: 'МС',
    bio: 'Преподаватель английского и автор языковых курсов',
  },
];

// Первоначальные демо-курсы, чтобы было что смотреть в библиотеке и коммьюнити
if (courses.length === 0) {
  const demoCourses: Course[] = [
    {
      id: crypto.randomUUID(),
      title: 'Frontend с нуля до React',
      description:
        'Пошаговый курс по основам веб-разработки: HTML, CSS, JavaScript и первый проект на React. Подойдёт тем, кто хочет стартовать карьеру frontend-разработчика.',
      category: 'frontend',
      format: 'Онлайн',
      level: 'Beginner',
      duration: '6 недель',
      intensity: '3–5 часов в неделю',
      goal: 'Научиться создавать современные веб-интерфейсы и понимать базу JavaScript.',
      createdAt: new Date().toISOString(),
      isPaid: true,
      price: 4900,
      isPublic: true,
      tags: ['frontend', 'react', 'html', 'css', 'javascript'],
      language: 'ru',
      createdBy: 'Алиса Петрова',
      modules: [
        {
          id: crypto.randomUUID(),
          title: 'Основы HTML & CSS',
          description: 'Структура страницы и базовая стилизация.',
          lessons: [
            {
              id: crypto.randomUUID(),
              title: 'HTML-скелет страницы',
              content: 'Разбираем базовые теги, структуру документа и семантику.',
            },
            {
              id: crypto.randomUUID(),
              title: 'Базовый CSS и верстка сеток',
              content: 'Учимся задавать стили и строить простые сетки с помощью Flexbox.',
            },
          ],
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      title: 'Английский для IT-специалистов',
      description:
        'Курс для разработчиков и аналитиков, которым нужен рабочий английский: митинги, переписка, документация и собеседования.',
      category: 'english-it',
      format: 'Онлайн',
      level: 'Intermediate',
      duration: '4 недели',
      intensity: '2–3 часа в неделю',
      goal: 'Уверенно общаться на английском в рабочей IT-среде.',
      createdAt: new Date().toISOString(),
      isPaid: false,
      price: 0,
      isPublic: true,
      tags: ['english', 'it', 'communication', 'intermediate'],
      language: 'ru',
      createdBy: 'Михаил Смирнов',
      modules: [
        {
          id: crypto.randomUUID(),
          title: 'Словарь разработчика',
          description: 'Самые частые термины и выражения, которые вы слышите каждый день.',
          lessons: [
            {
              id: crypto.randomUUID(),
              title: 'Daily standup & митинги',
              content: 'Разбираем фразы для ежедневных созвонов и статусов задач.',
            },
          ],
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      title: 'Введение в Data Science и Python',
      description:
        'Практический курс по базовому Python, работе с данными и первому ML-проекту. Без сложной математики, с упором на практику.',
      category: 'data-science',
      format: 'Онлайн',
      level: 'Beginner',
      duration: '5 недель',
      intensity: '3–4 часа в неделю',
      goal: 'Понять, как устроен Data Science-проект и сделать первый анализ данных.',
      createdAt: new Date().toISOString(),
      isPaid: true,
      price: 5900,
      isPublic: true,
      tags: ['python', 'data science', 'ml', 'analytics'],
      language: 'ru',
      createdBy: 'Вы',
      modules: [
        {
          id: crypto.randomUUID(),
          title: 'Основы Python для анализа данных',
          description: 'Переменные, циклы, списки, словари, чтение файлов.',
          lessons: [
            {
              id: crypto.randomUUID(),
              title: 'Первые шаги в Python',
              content:
                'Устанавливаем окружение, пишем первые скрипты и знакомимся с базовыми типами данных. В конце урока вы решите несколько практических задач на циклы и условия.',
              duration_minutes: 25,
              practice_exercises: [
                {
                  title: 'Циклы и суммы',
                  description:
                    'Напишите цикл, который считает сумму чисел от 1 до 100. Опишите идею решения в одном-двух предложениях.',
                  difficulty: 'medium',
                  estimated_time: '10 мин',
                  solution_hint: 'Вспомните формулу суммы арифметической прогрессии или используйте простой цикл for.',
                },
              ],
              terms: [
                {
                  term: 'арифметическая прогрессия',
                  explanation: 'Числовая последовательность, в которой каждый член, начиная со второго, равен предыдущему, сложенному с одним и тем же числом.',
                },
                {
                  term: 'цикл for',
                  explanation: 'Управляющая конструкция в программировании, позволяющая многократно выполнять блок кода определенное количество раз.',
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  courses.push(...demoCourses);

  // Создаём базовые категории под эти курсы
  const frontendCategory: Category = {
    id: 'frontend',
    label: 'Frontend-разработка',
    position: { x: 0, y: 0 },
    courses: demoCourses.filter((c) => c.category === 'frontend'),
  };

  const englishCategory: Category = {
    id: 'english-it',
    label: 'Английский для IT',
    position: { x: 0, y: 0 },
    courses: demoCourses.filter((c) => c.category === 'english-it'),
  };

  const dsCategory: Category = {
    id: 'data-science',
    label: 'Data Science',
    position: { x: 0, y: 0 },
    courses: demoCourses.filter((c) => c.category === 'data-science'),
  };

  categories.push(frontendCategory, englishCategory, dsCategory);
}

// Генерация мок-курса
export function generateMockCourse(topic: string, settings: any): Course {
  const courseId = crypto.randomUUID();
  const categoryName = settings.customCategory || settings.category || 'Без категории';
  const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
  
  // Проверяем, существует ли категория, если нет - создаем
  let category = categories.find(c => c.id === categoryId);
  if (!category) {
    category = {
      id: categoryId,
      label: categoryName,
      position: { x: 0, y: 0 }, // Позиция будет вычислена в графе
      courses: []
    };
    categories.push(category);
  }
  
  const course: Course = {
    id: courseId,
    title: `Курс по теме: ${topic}`,
    description: `Автоматически сгенерированный курс демо-версии Fill AI. ${settings.preferences || ''}`,
    category: categoryId,
    format: settings.format || 'Смешанный',
    level: settings.level || 'B1',
    duration: settings.duration || '4 недели',
    intensity: settings.intensity || 'Средняя',
    goal: settings.goal || 'Общее развитие',
    createdAt: new Date().toISOString(),
    isPaid: false,
    isPublic: true,
    tags: settings.tags || [],
    language: settings.language || 'ru',
    createdBy: 'Fill AI',
    modules: [
      {
        id: crypto.randomUUID(),
        title: 'Введение',
        lessons: [
          {
            id: crypto.randomUUID(),
            title: `Что такое ${topic}`,
            content: `В этом уроке мы изучим основы темы "${topic}". Это важная тема, которая поможет вам понять ключевые концепции.`
          },
          {
            id: crypto.randomUUID(),
            title: 'Примеры использования',
            content: `Рассмотрим практические примеры применения знаний о "${topic}" в реальных ситуациях.`
          }
        ]
      },
      {
        id: crypto.randomUUID(),
        title: 'Практика',
        lessons: [
          {
            id: crypto.randomUUID(),
            title: 'Упражнения',
            content: `Выполните практические упражнения для закрепления материала по теме "${topic}".`
          },
          {
            id: crypto.randomUUID(),
            title: 'Тестирование',
            content: `Пройдите тест для проверки усвоения материала.`
          }
        ]
      }
    ]
  };

  courses.push(course);
  
  // Добавляем курс в категорию
  if (category) {
    category.courses.push(course);
  }

  return course;
}

// Ручное создание пользовательского курса из формы в коммьюнити
export function createUserCourse(input: {
  title: string;
  description: string;
  categoryName: string;
  level: string;
  duration: string;
  isPaid: boolean;
  price?: number;
  tags?: string;
  isPrivate?: boolean;
}): Course {
  const courseId = crypto.randomUUID();
  const categoryId = input.categoryName.toLowerCase().replace(/\s+/g, '-');

  let category = categories.find((c) => c.id === categoryId);
  if (!category) {
    category = {
      id: categoryId,
      label: input.categoryName,
      position: { x: 0, y: 0 },
      courses: [],
    };
    categories.push(category);
  }

  const isPrivate = input.isPrivate || false;
  const shareLink = isPrivate ? `${typeof window !== 'undefined' ? window.location.origin : ''}/course/${courseId}` : undefined;

  const course: Course = {
    id: courseId,
    title: input.title,
    description: input.description,
    category: categoryId,
    format: 'Онлайн',
    level: input.level || 'Beginner',
    duration: input.duration || '4 недели',
    intensity: input.isPaid ? 'Стандартная' : 'Свободный темп',
    goal: 'Пользовательский курс сообщества',
    createdAt: new Date().toISOString(),
    isPaid: input.isPaid,
    price: input.isPaid ? (input.price || 0) : 0,
    isPublic: !isPrivate,
    isPrivate: isPrivate,
    shareLink: shareLink,
    enrolledStudents: [],
    tags: input.tags
      ? input.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    language: 'ru',
    createdBy: 'Вы',
    modules: [
      {
        id: crypto.randomUUID(),
        title: 'Описание курса',
        description: 'Этот модуль содержит общее описание и структуру курса.',
        lessons: [
          {
            id: crypto.randomUUID(),
            title: 'Обзор курса',
            content:
              'Создатель курса ещё не добавил подробные уроки. Но вы уже можете использовать этот курс как структуру для обучения.',
          },
        ],
      },
    ],
  };

  courses.push(course);
  category.courses.push(course);
  return course;
}

// Добавление курса от API
export function addCourseFromAPI(courseData: any): Course {
  const categoryName = courseData.category || 'Без категории';
  const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
  
  // Проверяем, существует ли категория, если нет - создаем
  let category = categories.find(c => c.id === categoryId);
  if (!category) {
    category = {
      id: categoryId,
      label: categoryName,
      position: { x: 0, y: 0 },
      courses: []
    };
    categories.push(category);
  }
  
  const course: Course = {
    ...courseData,
    category: categoryId,
  };

  courses.push(course);
  
  // Добавляем курс в категорию
  if (category) {
    category.courses.push(course);
  }

  return course;
}

// Получить все категории
export function getCategories(): Category[] {
  return categories;
}

// Получить все курсы
export function getCourses(): Course[] {
  return courses;
}

export function getUsers(): UserProfile[] {
  return users;
}

export function findUserByNameOrId(query: string): UserProfile[] {
  const q = query.toLowerCase().trim();
  if (!q) return users;
  return users.filter(
    (u) =>
      u.name.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
  );
}

// Поделиться курсом в коммьюнити (добавить в маркетплейс знаний)
export function shareCourseToCommunity(course: Course): SharedCourse {
  // Если курс уже есть в расшаренных — просто возвращаем существующую запись
  const existing = sharedCourses.find((sc) => sc.courseId === course.id);
  if (existing) return existing;

  // Обновляем курс - делаем его публичным и добавляем дату публикации
  const courseIndex = courses.findIndex(c => c.id === course.id);
  if (courseIndex !== -1) {
    courses[courseIndex] = {
      ...courses[courseIndex],
      isPublic: true,
      isPrivate: false,
      publishedAt: new Date().toISOString(),
      views: 0,
      studentProgress: courses[courseIndex].studentProgress || {},
    };
  }

  const shared: SharedCourse = {
    id: crypto.randomUUID(),
    courseId: course.id,
    sharedAt: new Date().toISOString(),
    authorName: course.createdBy || 'Вы',
    authorAvatar: 'ВЫ',
    enrolledCount: course.enrolledStudents?.length || 0,
    rating: 4 + Math.random(), // 4.0–5.0
    reviewsCount: Math.floor(Math.random() * 90) + 5,
  };

  sharedCourses.push(shared);
  return shared;
}

// Записаться на курс
export function enrollInCourse(courseId: string, studentId: string = 'me'): boolean {
  const course = courses.find(c => c.id === courseId);
  if (!course) return false;

  if (!course.enrolledStudents) {
    course.enrolledStudents = [];
  }
  if (!course.studentProgress) {
    course.studentProgress = {};
  }

  if (!course.enrolledStudents.includes(studentId)) {
    course.enrolledStudents.push(studentId);
    course.studentProgress[studentId] = {
      completedLessons: [],
      enrolledAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      progress: 0,
    };
    return true;
  }
  return false;
}

// Обновить прогресс студента
export function updateStudentProgress(courseId: string, studentId: string, lessonId: string): void {
  const course = courses.find(c => c.id === courseId);
  if (!course || !course.studentProgress) return;

  const studentProgress = course.studentProgress[studentId];
  if (!studentProgress) return;

  if (!studentProgress.completedLessons.includes(lessonId)) {
    studentProgress.completedLessons.push(lessonId);
  }

  // Вычисляем общий прогресс
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  studentProgress.progress = totalLessons > 0 
    ? Math.round((studentProgress.completedLessons.length / totalLessons) * 100)
    : 0;
  
  studentProgress.lastAccessed = new Date().toISOString();
}

// Получить курсы пользователя (изучаемые)
export function getUserEnrolledCourses(userId: string = 'me'): Course[] {
  return courses.filter(c => c.enrolledStudents?.includes(userId));
}

// Получить курсы, созданные пользователем
export function getUserCreatedCourses(userId: string = 'me'): Course[] {
  return courses.filter(c => c.createdBy === 'Вы' || c.createdBy === userId);
}

// Получить статистику курса для учителя
export function getCourseStats(courseId: string) {
  const course = courses.find(c => c.id === courseId);
  if (!course) return null;

  const enrolled = course.enrolledStudents?.length || 0;
  const active = Object.values(course.studentProgress || {}).filter(
    (p: any) => {
      const lastAccess = p.lastAccessed ? new Date(p.lastAccessed) : null;
      if (!lastAccess) return false;
      const daysSinceAccess = (Date.now() - lastAccess.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceAccess <= 7; // Активны в последние 7 дней
    }
  ).length;
  const completed = Object.values(course.studentProgress || {}).filter(
    (p: any) => p.progress >= 100
  ).length;
  const avgProgress = enrolled > 0
    ? Math.round(
        Object.values(course.studentProgress || {}).reduce(
          (sum: number, p: any) => sum + (p.progress || 0), 0
        ) / enrolled
      )
    : 0;

  return {
    enrolled,
    active,
    completed,
    avgProgress,
    views: course.views || 0,
  };
}

export function getSharedCourses(): SharedCourse[] {
  return sharedCourses;
}

// Получить курс по ID
export function getCourseById(id: string): Course | undefined {
  return courses.find(c => c.id === id);
}

// Получить курсы категории
export function getCoursesByCategory(categoryId: string): Course[] {
  return courses.filter(c => c.category === categoryId);
}

