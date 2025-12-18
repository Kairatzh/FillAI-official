import { Node, Link } from '@/types/graph';
import { getCategories } from '@/data/mockStore';

// Generate nodes from categories and courses
export function generateNodes(): Node[] {
  const categories = getCategories().filter((cat) => cat.courses.length > 0); // Только категории с курсами
  const nodes: Node[] = [];

  // Центральный узел "Вы" - корень дерева
  nodes.push({
    id: 'center',
    label: 'Вы',
    type: 'center',
    x: -260, // немного левее центра, чтобы дерево росло вправо
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

  // Вертикальное дерево: категории в колонку справа от "Вы", курсы ещё правее под своей категорией
  const categorySpacingY = 220;
  const courseSpacingY = 90;
  const categoryX = 80; // категории чуть правее "Вы"
  const courseX = 360; // курсы ещё правее

  const totalCategoriesHeight = (categories.length - 1) * categorySpacingY;
  const startCategoryY = -totalCategoriesHeight / 2;

  categories.forEach((category, catIndex) => {
    const catY = startCategoryY + catIndex * categorySpacingY;

    // Узел группы (категории)
    nodes.push({
      id: category.id,
      label: category.label,
      type: 'primary',
      x: categoryX,
      y: catY,
      vx: 0,
      vy: 0,
      radius: 44,
      color: '#22252b',
      glowColor: 'rgba(120, 174, 255, 0.35)', // лёгкое синее свечение для групп
    });

    // Узлы курсов — столбец под своей категорией
    const courseCount = category.courses.length;
    const totalCoursesHeight = (courseCount - 1) * courseSpacingY;
    const startCourseY = catY - totalCoursesHeight / 2;

    category.courses.forEach((course, courseIndex) => {
      const courseY = startCourseY + courseIndex * courseSpacingY;

      nodes.push({
        id: course.id,
        label:
          course.title.length > 22
            ? course.title.substring(0, 22) + '...'
            : course.title,
        type: 'sub',
        x: courseX,
        y: courseY,
        vx: 0,
        vy: 0,
        radius: 30,
        color: '#30333a',
        glowColor: 'rgba(144, 238, 144, 0.35)', // мягкое зеленоватое свечение для курсов
      });
    });
  });

  return nodes;
}

// Generate links from nodes structure
export function generateLinks(nodes: Node[]): Link[] {
  const links: Link[] = [];
  const categories = getCategories().filter(cat => cat.courses.length > 0); // Только категории с курсами
  const centerNode = nodes.find(n => n.id === 'center');

  if (!centerNode || categories.length === 0) return links;

  // Связь центра с группами (категориями)
  categories.forEach((category) => {
    const categoryNode = nodes.find(n => n.id === category.id);
    if (!categoryNode) return;

    // Линия: "Вы" -> группа
    links.push({
      id: `center-${category.id}`,
      source: 'center',
      target: category.id,
      strength: 1,
    });

    // Линии: группа -> каждый курс в этой группе (БЕЗ цепочки между курсами)
    category.courses.forEach((course) => {
      const courseNode = nodes.find(n => n.id === course.id);
      if (!courseNode) return;

      links.push({
        id: `${category.id}-${course.id}`,
        source: category.id,
        target: course.id,
        strength: 0.8,
      });
    });
  });

  return links;
}

// Initial graph data structure
export const initialNodes: Node[] = generateNodes();
export const initialLinks: Link[] = generateLinks(initialNodes);

