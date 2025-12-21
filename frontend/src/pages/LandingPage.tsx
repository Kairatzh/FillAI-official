'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Sparkles, BookOpen, Users, Building, CheckCircle2, Star, ArrowRight, 
  Zap, Target, TrendingUp, MessageSquare, ChevronDown, ChevronUp,
  Brain, Award, Globe, Shield, Rocket, Infinity, GraduationCap, Briefcase, Network, Menu, X
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

export default function LandingPage() {
  const { setCurrentPage } = useUIStore();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTryFree = () => {
    setCurrentPage('graph');
  };

  const stats = [
    { value: '10K+', label: 'Активных пользователей', icon: Users },
    { value: '500+', label: 'Созданных курсов', icon: BookOpen },
    { value: '50+', label: 'Категорий знаний', icon: Target },
    { value: '98%', label: 'Удовлетворенность', icon: Star },
  ];

  const features = [
    {
      icon: Brain,
      title: 'ИИ-ментор Джаспер',
      description: 'Персональный помощник, который объясняет сложные темы простыми словами и помогает в обучении',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Network,
      title: 'Интерактивный граф знаний',
      description: 'Визуализируйте связи между курсами, организуйте знания и создавайте свою сеть обучения',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Zap,
      title: 'Автоматическая генерация курсов',
      description: 'Создавайте персонализированные курсы за секунды с помощью ИИ на основе ваших запросов',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Target,
      title: 'Практические задания с ИИ-проверкой',
      description: 'Получайте мгновенную обратную связь от ИИ на ваши ответы и улучшайте навыки',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Users,
      title: 'Сообщество и маркетплейс',
      description: 'Делитесь курсами, находите единомышленников и учитесь вместе',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      icon: Award,
      title: 'Геймификация обучения',
      description: 'Зарабатывайте достижения, отслеживайте прогресс и соревнуйтесь с другими',
      color: 'from-yellow-500 to-amber-500',
    },
  ];

  const faqs = [
    {
      question: 'Как работает генерация курсов?',
      answer: 'Просто опишите тему, которую хотите изучить, и наш ИИ создаст полноценный курс с модулями, уроками, практическими заданиями и дополнительными материалами. Курс будет адаптирован под ваш уровень и цели.',
    },
    {
      question: 'Можно ли использовать платформу бесплатно?',
      answer: 'Да! У нас есть бесплатный план (Freemium), который позволяет создавать до 3 курсов, использовать базовые функции ИИ-ментора и доступ к сообществу. Для расширенных возможностей доступны платные подписки.',
    },
    {
      question: 'Как работает ИИ-ментор Джаспер?',
      answer: 'Джаспер читает материал вашего текущего урока и помогает понять сложные моменты. Вы можете задавать вопросы в любой момент, и он объяснит концепции простыми словами, приведет примеры из жизни и поможет закрепить знания.',
    },
    {
      question: 'Можно ли делиться курсами с другими?',
      answer: 'Конечно! Вы можете публиковать свои курсы в сообществе, где другие пользователи смогут их изучать. Также есть возможность продавать курсы через маркетплейс.',
    },
    {
      question: 'Подходит ли платформа для организаций?',
      answer: 'Да, у нас есть специальный план для организаций с расширенными возможностями: управление командой, аналитика обучения, корпоративные курсы и интеграции с HR-системами.',
    },
    {
      question: 'Как отслеживается прогресс обучения?',
      answer: 'Платформа автоматически отслеживает ваш прогресс по каждому курсу, сохраняет заметки и закладки. Вы можете видеть статистику завершенных уроков, пройденных тестов и достижений.',
    },
  ];

  const testimonials = [
    {
      name: 'Анна Петрова',
      role: 'Студентка',
      avatar: '👩‍🎓',
      text: 'Джаспер помог мне понять сложные концепции программирования. Теперь я могу создавать свои проекты!',
      rating: 5,
    },
    {
      name: 'Дмитрий Смирнов',
      role: 'Преподаватель',
      avatar: '👨‍🏫',
      text: 'Отличная платформа для создания интерактивных курсов. Мои студенты в восторге от графа знаний!',
      rating: 5,
    },
    {
      name: 'Елена Козлова',
      role: 'HR-менеджер',
      avatar: '👩‍💼',
      text: 'Используем платформу для обучения сотрудников. Экономия времени и отличные результаты!',
      rating: 5,
    },
  ];

  const pricingPlans = [
    {
      name: 'Freemium',
      price: '0₽',
      period: 'навсегда',
      description: 'Идеально для начала',
      features: [
        'До 3 курсов',
        'Базовый ИИ-ментор',
        'Доступ к сообществу',
        'Базовые тесты',
        'Ограниченная генерация',
      ],
      color: 'from-gray-600 to-gray-700',
      icon: Infinity,
      popular: false,
    },
    {
      name: 'Для учеников',
      price: '499₽',
      period: 'в месяц',
      description: 'Для активных студентов',
      features: [
        'Неограниченные курсы',
        'Полный доступ к ИИ-ментору',
        'Приоритетная генерация',
        'Расширенные тесты',
        'Экспорт материалов',
        'Приоритетная поддержка',
      ],
      color: 'from-blue-500 to-indigo-600',
      icon: GraduationCap,
      popular: true,
    },
    {
      name: 'Для учителей',
      price: '999₽',
      period: 'в месяц',
      description: 'Для преподавателей',
      features: [
        'Все из плана "Для учеников"',
        'Создание публичных курсов',
        'Монетизация курсов',
        'Детальная аналитика',
        'Интеграция с LMS',
        'Техническая поддержка',
      ],
      color: 'from-purple-500 to-pink-600',
      icon: Briefcase,
      popular: false,
    },
    {
      name: 'Для организаций',
      price: 'По запросу',
      period: '',
      description: 'Корпоративные решения',
      features: [
        'Все из плана "Для учителей"',
        'Управление командой',
        'Корпоративные курсы',
        'Расширенная аналитика',
        'SSO интеграция',
        'Персональный менеджер',
        'Кастомные интеграции',
      ],
      color: 'from-amber-500 to-orange-600',
      icon: Building,
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        scrolled ? 'bg-[#1a1a1a]/95 backdrop-blur-lg border-b border-[#3a3a3a]' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage('graph')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Brain size={24} className="text-blue-400" />
            <span className="text-xl font-bold">Fill AI</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Возможности</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Цены</a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Отзывы</a>
            <a href="#faq" className="text-gray-300 hover:text-white transition-colors">FAQ</a>
            <button
              onClick={handleTryFree}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg font-semibold transition-all"
            >
              Попробовать бесплатно
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-[#252525] rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-[#252525] border-t border-[#3a3a3a] p-4 space-y-3"
          >
            <a href="#features" className="block text-gray-300 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Возможности</a>
            <a href="#pricing" className="block text-gray-300 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Цены</a>
            <a href="#testimonials" className="block text-gray-300 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Отзывы</a>
            <a href="#faq" className="block text-gray-300 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <button
              onClick={() => {
                handleTryFree();
                setMobileMenuOpen(false);
              }}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg font-semibold transition-all"
            >
              Попробовать бесплатно
            </button>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#252525] to-[#1a1a1a]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,174,255,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(144,238,144,0.08),transparent_50%)]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full mb-6"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles size={16} className="text-amber-400" />
              <span className="text-sm text-amber-300 font-semibold">Новое поколение обучения</span>
            </motion.div>

            <h1 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent leading-tight">
              Создавайте знания.<br />
              Изучайте эффективно.<br />
              <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                Растите вместе.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Платформа для создания и изучения курсов с ИИ-ментором, интерактивным графом знаний 
              и автоматической генерацией контента. Обучение стало проще и интереснее.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={handleTryFree}
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl font-bold text-lg shadow-xl shadow-blue-900/50 flex items-center gap-3 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Попробовать бесплатно</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                className="px-8 py-4 bg-[#252525] hover:bg-[#2d2d2d] border border-[#3a3a3a] rounded-xl font-semibold text-lg flex items-center gap-3 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageSquare size={20} />
                <span>Узнать больше</span>
              </motion.button>
            </div>

            {/* Stats preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="p-4 bg-[#252525] border border-[#3a3a3a] rounded-xl"
                >
                  <stat.icon className="mx-auto mb-2 text-blue-400" size={24} />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown size={24} className="text-gray-400" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-[#1f1f1f] scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">Возможности платформы</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Все инструменты для эффективного обучения в одном месте
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 bg-[#252525] border border-[#3a3a3a] rounded-xl hover:border-[#4a4a4a] transition-all group"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-[#1a1a1a] scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">Выберите свой план</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Подписки для разных потребностей и целей
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`relative p-6 bg-[#252525] border rounded-xl ${
                  plan.popular 
                    ? 'border-blue-500 shadow-xl shadow-blue-900/20 scale-105' 
                    : 'border-[#3a3a3a]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 rounded-full text-xs font-bold">
                    Популярно
                  </div>
                )}
                
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                  <plan.icon size={24} className="text-white" />
                </div>
                
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-3xl font-black">{plan.price}</span>
                  {plan.period && <span className="text-gray-400 ml-2">{plan.period}</span>}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={plan.name === 'Freemium' ? handleTryFree : undefined}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                      : 'bg-[#2d2d2d] hover:bg-[#353535] border border-[#3a3a3a]'
                  }`}
                >
                  {plan.name === 'Freemium' ? 'Начать бесплатно' : 
                   plan.name === 'Для организаций' ? 'Связаться с нами' : 
                   'Выбрать план'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6 bg-[#1f1f1f] scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">Что говорят пользователи</h2>
            <p className="text-xl text-gray-400">Реальные отзывы от наших пользователей</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 bg-[#252525] border border-[#3a3a3a] rounded-xl"
              >
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 bg-[#1a1a1a] scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">Часто задаваемые вопросы</h2>
            <p className="text-xl text-gray-400">Все что вам нужно знать</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#252525] border border-[#3a3a3a] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-[#2d2d2d] transition-colors"
                >
                  <span className="font-semibold text-lg pr-4">{faq.question}</span>
                  {openFaq === idx ? (
                    <ChevronUp size={20} className="text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-6 text-gray-300 leading-relaxed"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600/20 via-indigo-600/20 to-purple-600/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Готовы начать обучение?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Присоединяйтесь к тысячам пользователей, которые уже создают и изучают курсы
            </p>
            <motion.button
              onClick={handleTryFree}
              className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl font-bold text-lg shadow-xl shadow-blue-900/50 flex items-center gap-3 mx-auto transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Попробовать бесплатно</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#1a1a1a] border-t border-[#3a3a3a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain size={24} className="text-blue-400" />
                <span className="font-bold text-xl">Fill AI</span>
              </div>
              <p className="text-gray-400 text-sm">
                Платформа нового поколения для создания и изучения курсов с ИИ
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Продукт</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Возможности</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Цены</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Обновления</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Компания</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">О нас</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Блог</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Карьера</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Поддержка</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Помощь</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Контакты</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Политика конфиденциальности</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[#3a3a3a] text-center text-sm text-gray-400">
            © 2024 Fill AI. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}

