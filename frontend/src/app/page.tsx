'use client';

import Sidebar from '@/components/Sidebar';
import GraphCanvas from '@/components/GraphCanvas';
import FloatingPanel from '@/components/FloatingPanel';
import SearchBar from '@/components/SearchBar';
import BackgroundEnvironment from '@/components/BackgroundEnvironment';
import JasperAssistant from '@/components/JasperAssistant';
import CommunityPage from '@/pages/CommunityPage';
import LibraryPage from '@/pages/LibraryPage';
import ProfilePage from '@/pages/ProfilePage';
import LandingPage from '@/pages/LandingPage';
import TopBar from '@/components/TopBar';
import { useUIStore } from '@/store/uiStore';

export default function Home() {
  const { currentPage } = useUIStore();

  // Показываем лендинг без сайдбара и топбара
  if (currentPage === 'landing') {
    return <LandingPage />;
  }

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#1a1a1a] flex flex-col">
      {/* Top Bar */}
      <TopBar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentPage === 'graph' ? (
          <div className="relative w-full h-full">
            {/* Living atmospheric background */}
            <BackgroundEnvironment />

            {/* Graph canvas */}
            <GraphCanvas />

            {/* Floating panel */}
            <FloatingPanel />

            {/* Bottom search bar */}
            <SearchBar />
          </div>
        ) : currentPage === 'community' ? (
          <CommunityPage />
        ) : currentPage === 'library' ? (
          <LibraryPage />
        ) : currentPage === 'profile' ? (
          <ProfilePage />
        ) : null}
      </div>
      </div>
      {/* Глобальный ИИ-помощник Джаспер */}
      <JasperAssistant />
    </main>
  );
}

