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
  modules: Module[];
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
}

let categories: Category[] = [];

let courses: Course[] = [];

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

// Получить все категории
export function getCategories(): Category[] {
  return categories;
}

// Получить все курсы
export function getCourses(): Course[] {
  return courses;
}

// Получить курс по ID
export function getCourseById(id: string): Course | undefined {
  return courses.find(c => c.id === id);
}

// Получить курсы категории
export function getCoursesByCategory(categoryId: string): Course[] {
  return courses.filter(c => c.category === categoryId);
}

