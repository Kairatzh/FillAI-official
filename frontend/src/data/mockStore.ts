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
  tags?: string[];
  language?: string;
  createdBy?: string;
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
    isPublic: true,
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

  const shared: SharedCourse = {
    id: crypto.randomUUID(),
    courseId: course.id,
    sharedAt: new Date().toISOString(),
    authorName: 'Вы',
    authorAvatar: 'ВЫ',
    enrolledCount: Math.floor(Math.random() * 500) + 20,
    rating: 4 + Math.random(), // 4.0–5.0
    reviewsCount: Math.floor(Math.random() * 90) + 5,
  };

  sharedCourses.push(shared);
  return shared;
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

