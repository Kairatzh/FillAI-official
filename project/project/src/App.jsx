import { useState } from 'react';
import TopBar from './components/TopBar/TopBar';
import Sidebar from './components/Sidebar/Sidebar';
import Home from './pages/Home';
import GraphPage from './pages/GraphPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [coursesUpdated, setCoursesUpdated] = useState(0);

  const handleNavigate = (page) => {
    if (page === 'history') {
      setCurrentPage('graph');
    } else {
      setCurrentPage('home');
    }
  };

  const handleCourseGenerated = () => {
    // Обновляем состояние для перерисовки графа
    setCoursesUpdated(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-screen bg-dark-bg">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onNavigate={handleNavigate} />
        <main className="flex-1 overflow-auto">
          {currentPage === 'home' ? (
            <Home onCourseGenerated={handleCourseGenerated} />
          ) : (
            <GraphPage key={coursesUpdated} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;

