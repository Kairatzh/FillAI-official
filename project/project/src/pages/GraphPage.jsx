import { useState, useEffect } from 'react';
import KnowledgeGraph from '../components/Graph/KnowledgeGraph';
import CoursePreview from '../components/CoursePreview/CoursePreview';
import { getCourses } from '../data/mockStore';

export default function GraphPage() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [coursesCount, setCoursesCount] = useState(0);

  useEffect(() => {
    const updateCoursesCount = () => {
      setCoursesCount(getCourses().length);
    };
    updateCoursesCount();
    // Обновляем каждую секунду для отслеживания изменений
    const interval = setInterval(updateCoursesCount, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
  };

  const courses = getCourses();

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-6 border-b border-dark-border">
        <h1 className="text-3xl font-bold text-white mb-2">Граф знаний</h1>
        <p className="text-gray-400">
          Визуализация всех сгенерированных курсов и их связей
          {courses.length > 0 && (
            <span className="ml-2 text-blue-400">({courses.length} курсов)</span>
          )}
        </p>
      </div>
      
      <div className="flex-1 relative">
        <KnowledgeGraph key={coursesCount} onCourseClick={handleCourseClick} />
      </div>

      {selectedCourse && (
        <CoursePreview
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
}

