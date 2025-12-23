"""Database models using SQLAlchemy"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, Float, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import uuid
from app.database import Base

# Many-to-many relationship for course tags
course_tags = Table(
    'course_tags',
    Base.metadata,
    Column('course_id', UUID(as_uuid=True), ForeignKey('courses.id'), primary_key=True),
    Column('tag_id', UUID(as_uuid=True), ForeignKey('tags.id'), primary_key=True)
)


class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    role = Column(String(20), default='student', nullable=False)  # student, teacher, organization
    email_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    created_courses = relationship("Course", back_populates="creator", foreign_keys="Course.created_by")
    enrollments = relationship("Enrollment", back_populates="user")
    discussions = relationship("Discussion", back_populates="author")
    discussion_replies = relationship("DiscussionReply", back_populates="author")


class Category(Base):
    """Category model"""
    __tablename__ = "categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    label = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    courses = relationship("Course", back_populates="category")


class Course(Base):
    """Course model"""
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey('categories.id'), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False, index=True)
    
    format = Column(String(50), nullable=True)
    level = Column(String(50), nullable=True)
    duration = Column(String(100), nullable=True)
    intensity = Column(String(50), nullable=True)
    goal = Column(String(255), nullable=True)
    
    is_paid = Column(Boolean, default=False, nullable=False)
    price = Column(Float, nullable=True)
    is_public = Column(Boolean, default=True, nullable=False)
    is_private = Column(Boolean, default=False, nullable=False)
    share_link = Column(String(500), nullable=True)
    
    published_at = Column(DateTime(timezone=True), nullable=True)
    views = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    creator = relationship("User", back_populates="created_courses", foreign_keys=[created_by])
    category = relationship("Category", back_populates="courses")
    modules = relationship("CourseModule", back_populates="course", cascade="all, delete-orphan", order_by="CourseModule.order")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary=course_tags, back_populates="courses")
    discussions = relationship("Discussion", back_populates="course", cascade="all, delete-orphan")


class CourseModule(Base):
    """Course module model"""
    __tablename__ = "course_modules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    course_id = Column(UUID(as_uuid=True), ForeignKey('courses.id'), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    course = relationship("Course", back_populates="modules")
    lessons = relationship("Lesson", back_populates="module", cascade="all, delete-orphan", order_by="Lesson.order")


class Lesson(Base):
    """Lesson model"""
    __tablename__ = "lessons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    module_id = Column(UUID(as_uuid=True), ForeignKey('course_modules.id'), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    module = relationship("CourseModule", back_populates="lessons")
    student_progress = relationship("StudentProgress", back_populates="lesson", cascade="all, delete-orphan")


class Enrollment(Base):
    """Enrollment model - связь пользователя с курсом"""
    __tablename__ = "enrollments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False, index=True)
    course_id = Column(UUID(as_uuid=True), ForeignKey('courses.id'), nullable=False, index=True)
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    progress_percent = Column(Integer, default=0, nullable=False)
    last_accessed_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
    student_progress = relationship("StudentProgress", back_populates="enrollment", cascade="all, delete-orphan")

    # Unique constraint
    __table_args__ = (
        {'sqlite_autoincrement': True},
    )


class StudentProgress(Base):
    """Student progress model - прогресс по урокам"""
    __tablename__ = "student_progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    enrollment_id = Column(UUID(as_uuid=True), ForeignKey('enrollments.id'), nullable=False, index=True)
    lesson_id = Column(UUID(as_uuid=True), ForeignKey('lessons.id'), nullable=False, index=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    time_spent_minutes = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    enrollment = relationship("Enrollment", back_populates="student_progress")
    lesson = relationship("Lesson", back_populates="student_progress")

    # Unique constraint
    __table_args__ = (
        {'sqlite_autoincrement': True},
    )


class Tag(Base):
    """Tag model"""
    __tablename__ = "tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    courses = relationship("Course", secondary=course_tags, back_populates="tags")


class Discussion(Base):
    """Discussion model"""
    __tablename__ = "discussions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    course_id = Column(UUID(as_uuid=True), ForeignKey('courses.id'), nullable=False, index=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    likes_count = Column(Integer, default=0, nullable=False)
    is_pinned = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    course = relationship("Course", back_populates="discussions")
    author = relationship("User", back_populates="discussions")
    replies = relationship("DiscussionReply", back_populates="discussion", cascade="all, delete-orphan", order_by="DiscussionReply.created_at")


class DiscussionReply(Base):
    """Discussion reply model"""
    __tablename__ = "discussion_replies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    discussion_id = Column(UUID(as_uuid=True), ForeignKey('discussions.id'), nullable=False, index=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False, index=True)
    content = Column(Text, nullable=False)
    likes_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    discussion = relationship("Discussion", back_populates="replies")
    author = relationship("User", back_populates="discussion_replies")

