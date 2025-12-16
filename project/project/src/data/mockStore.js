// Mock хранилище для демо-версии
let categories = [
  {
    id: 'english',
    label: 'English',
    position: { x: 100, y: 100 },
    courses: []
  },
  {
    id: 'programming',
    label: 'Programming',
    position: { x: 400, y: 100 },
    courses: []
  },
  {
    id: 'design',
    label: 'Design',
    position: { x: 700, y: 100 },
    courses: []
  }
];

let courses = [];

// Генерация мок-курса
export function generateMockCourse(topic, settings) {
  const courseId = crypto.randomUUID();
  const categoryId = settings.category || 'english';
  
  const course = {
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
  const category = categories.find(c => c.id === categoryId);
  if (category) {
    category.courses.push(course);
  }

  return course;
}

// Получить все категории
export function getCategories() {
  return categories;
}

// Получить все курсы
export function getCourses() {
  return courses;
}

// Получить курс по ID
export function getCourseById(id) {
  return courses.find(c => c.id === id);
}

// Получить курсы категории
export function getCoursesByCategory(categoryId) {
  return courses.filter(c => c.category === categoryId);
}

