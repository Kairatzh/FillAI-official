// Система обсуждений для курсов

export interface Discussion {
  id: string;
  courseId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  likedBy: string[];
  replies: DiscussionReply[];
  isPinned?: boolean;
  tags?: string[];
}

export interface DiscussionReply {
  id: string;
  discussionId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  likedBy: string[];
  parentReplyId?: string; // Для вложенных ответов
}

let discussions: Discussion[] = [];
let discussionReplies: DiscussionReply[] = [];

// Инициализация демо-обсуждений
export function initializeDiscussions() {
  if (discussions.length === 0) {
    discussions = [
      {
        id: 'disc-1',
        courseId: 'demo-1',
        authorId: 'alice',
        authorName: 'Алиса Петрова',
        authorAvatar: 'АП',
        title: 'Как лучше всего начать изучение React?',
        content: 'Привет! Я только начинаю изучать React и хотел бы узнать у более опытных разработчиков, с чего лучше начать? Какие ресурсы вы рекомендуете?',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        likes: 12,
        likedBy: ['user1', 'user2'],
        replies: [],
        tags: ['react', 'начало', 'советы'],
      },
      {
        id: 'disc-2',
        courseId: 'demo-1',
        authorId: 'mike',
        authorName: 'Михаил Смирнов',
        authorAvatar: 'МС',
        title: 'Проблема с хуками в React',
        content: 'У меня возникла проблема с использованием useEffect. Может кто-то помочь разобраться?',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        likes: 5,
        likedBy: ['user3'],
        replies: [],
        tags: ['react', 'hooks', 'проблема'],
      },
    ];
  }
}

// Получить все обсуждения для курса
export function getCourseDiscussions(courseId: string): Discussion[] {
  initializeDiscussions();
  return discussions
    .filter(d => d.courseId === courseId)
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

// Получить все обсуждения (для ленты)
export function getAllDiscussions(): Discussion[] {
  initializeDiscussions();
  return discussions.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

// Создать новое обсуждение
export function createDiscussion(discussion: Omit<Discussion, 'id' | 'createdAt' | 'likes' | 'likedBy' | 'replies'>): Discussion {
  const newDiscussion: Discussion = {
    ...discussion,
    id: `disc-${Date.now()}`,
    createdAt: new Date().toISOString(),
    likes: 0,
    likedBy: [],
    replies: [],
  };
  discussions.push(newDiscussion);
  return newDiscussion;
}

// Добавить ответ к обсуждению
export function addReplyToDiscussion(discussionId: string, reply: Omit<DiscussionReply, 'id' | 'createdAt' | 'likes' | 'likedBy'>): DiscussionReply {
  const newReply: DiscussionReply = {
    ...reply,
    id: `reply-${Date.now()}`,
    createdAt: new Date().toISOString(),
    likes: 0,
    likedBy: [],
  };
  
  const discussion = discussions.find(d => d.id === discussionId);
  if (discussion) {
    discussion.replies.push(newReply);
  }
  discussionReplies.push(newReply);
  return newReply;
}

// Лайкнуть обсуждение
export function likeDiscussion(discussionId: string, userId: string): void {
  const discussion = discussions.find(d => d.id === discussionId);
  if (discussion) {
    if (discussion.likedBy.includes(userId)) {
      discussion.likes--;
      discussion.likedBy = discussion.likedBy.filter(id => id !== userId);
    } else {
      discussion.likes++;
      discussion.likedBy.push(userId);
    }
  }
}

// Лайкнуть ответ
export function likeReply(replyId: string, userId: string): void {
  const reply = discussionReplies.find(r => r.id === replyId);
  if (reply) {
    if (reply.likedBy.includes(userId)) {
      reply.likes--;
      reply.likedBy = reply.likedBy.filter(id => id !== userId);
    } else {
      reply.likes++;
      reply.likedBy.push(userId);
    }
    
    // Обновить в обсуждении
    discussions.forEach(disc => {
      const replyInDisc = disc.replies.find(r => r.id === replyId);
      if (replyInDisc) {
        replyInDisc.likes = reply.likes;
        replyInDisc.likedBy = reply.likedBy;
      }
    });
  }
}

