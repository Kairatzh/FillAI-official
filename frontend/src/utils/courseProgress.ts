/**
 * Утилиты для работы с прогрессом курсов
 */

const STORAGE_PREFIX = 'course_progress_';
const NOTES_PREFIX = 'course_notes_';
const BOOKMARKS_PREFIX = 'course_bookmarks_';

/**
 * Получает прогресс курса из localStorage
 */
export function getCourseProgress(courseId: string): {
  completedLessons: string[];
  progress: number;
  totalLessons: number;
} {
  if (typeof window === 'undefined') {
    return { completedLessons: [], progress: 0, totalLessons: 0 };
  }

  try {
    const savedProgress = localStorage.getItem(`${STORAGE_PREFIX}${courseId}`);
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      if (Array.isArray(parsed)) {
        return {
          completedLessons: parsed,
          progress: parsed.length,
          totalLessons: 0, // Будет вычислено на основе курса
        };
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки прогресса курса:', error);
  }

  return { completedLessons: [], progress: 0, totalLessons: 0 };
}

/**
 * Вычисляет процент прогресса курса
 */
export function calculateCourseProgress(
  courseId: string,
  totalLessons: number
): number {
  const progress = getCourseProgress(courseId);
  if (totalLessons === 0) return 0;
  return Math.round((progress.completedLessons.length / totalLessons) * 100);
}

/**
 * Проверяет, завершен ли урок
 */
export function isLessonCompleted(
  courseId: string,
  moduleIdx: number,
  lessonIdx: number
): boolean {
  const progress = getCourseProgress(courseId);
  const lessonId = `${moduleIdx}-${lessonIdx}`;
  return progress.completedLessons.includes(lessonId);
}

/**
 * Получает количество завершенных уроков в курсе
 */
export function getCompletedLessonsCount(courseId: string): number {
  const progress = getCourseProgress(courseId);
  return progress.completedLessons.length;
}

