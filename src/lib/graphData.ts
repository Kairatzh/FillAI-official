import { Node, Link } from '@/types/graph';
import { getCategories, getCourses } from '@/data/mockStore';

// Generate nodes from categories and courses
export function generateNodes(): Node[] {
  const categories = getCategories().filter(cat => cat.courses.length > 0); // Только категории с курсами
  const courses = getCourses();
  const nodes: Node[] = [];

  // Center node - пользователь (всегда в центре, сердце графа)
  nodes.push({
    id: 'center',
    label: 'Вы',
    type: 'center',
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 60,
    color: '#252525', // Темно-серый для центрального узла
    glowColor: 'rgba(37, 37, 37, 0.4)',
  });

  if (categories.length === 0) {
    // Если нет категорий с курсами, возвращаем только центральный узел
    return nodes;
  }

  // Category nodes (расположены вокруг центра - цепочка от пользователя)
  const categoryAngleStep = (2 * Math.PI) / categories.length;
  const categoryRadius = 180; // Расстояние от центра до категорий

  categories.forEach((category, index) => {
    const angle = index * categoryAngleStep;
    
    // Позиция категории - вокруг центра
    const categoryX = Math.cos(angle) * categoryRadius;
    const categoryY = Math.sin(angle) * categoryRadius;
    
    nodes.push({
      id: category.id,
      label: category.label,
      type: 'primary',
      x: categoryX,
      y: categoryY,
      vx: 0,
      vy: 0,
      radius: 40,
      color: '#2d2d2d', // Темно-серый, чуть светлее фона #1a1a1a
      glowColor: 'rgba(45, 45, 45, 0.3)',
    });

    // Course nodes - цепочка от категории
    const courseCount = category.courses.length;
    if (courseCount > 0) {
      // Для каждой категории курсы располагаются в цепочку
      const courseSpacing = 130; // Расстояние между курсами в цепочке
      
      category.courses.forEach((course, courseIndex) => {
        // Направление от категории
        const courseAngle = angle;
        // Каждый следующий курс дальше по направлению от категории
        const courseX = categoryX + Math.cos(courseAngle) * courseSpacing * (courseIndex + 1);
        const courseY = categoryY + Math.sin(courseAngle) * courseSpacing * (courseIndex + 1);
        
        nodes.push({
          id: course.id,
          label: course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title,
          type: 'sub',
          x: courseX,
          y: courseY,
          vx: 0,
          vy: 0,
      radius: 30,
      color: '#353535', // Темно-серый для курсов
      glowColor: 'rgba(53, 53, 53, 0.3)',
        });
      });
    }
  });

  return nodes;
}

// Generate links from nodes structure
export function generateLinks(nodes: Node[]): Link[] {
  const links: Link[] = [];
  const categories = getCategories().filter(cat => cat.courses.length > 0); // Только категории с курсами
  const centerNode = nodes.find(n => n.id === 'center');

  if (!centerNode || categories.length === 0) return links;

  // Links from center to categories (только если есть категории с курсами)
  categories.forEach((category) => {
    const categoryNode = nodes.find(n => n.id === category.id);
    if (categoryNode) {
      links.push({
        id: `center-${category.id}`,
        source: 'center',
        target: category.id,
        strength: 1,
      });

      // Links from categories to courses (цепочка)
      category.courses.forEach((course, index) => {
        const courseNode = nodes.find(n => n.id === course.id);
        if (courseNode) {
          // Первый курс соединяется с категорией, остальные - с предыдущим курсом
          if (index === 0) {
            links.push({
              id: `${category.id}-${course.id}`,
              source: category.id,
              target: course.id,
              strength: 0.8,
            });
          } else {
            const prevCourse = category.courses[index - 1];
            links.push({
              id: `${prevCourse.id}-${course.id}`,
              source: prevCourse.id,
              target: course.id,
              strength: 0.8,
            });
          }
        }
      });
    }
  });

  return links;
}

// Initial graph data structure
export const initialNodes: Node[] = generateNodes();
export const initialLinks: Link[] = generateLinks(initialNodes);

