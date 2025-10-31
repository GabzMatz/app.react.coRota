import React from 'react';
import { BottomNav } from '../components/BottomNav';
import { SearchSection } from '../components/SearchSection';
import { RidesHistory } from '../components/RidesHistory';

interface SearchPageProps {
  onTabChange?: (tab: string) => void;
  onPageChange?: (page: string, data?: any) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onTabChange, onPageChange }) => {
  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  const handleSearch = (data: { departure: string; passengers: number }) => {
    onPageChange?.('search-destination', data);
  };

  return (
    <div className="min-h-screen bg-white pb-20 overflow-x-hidden">
      <div className="overflow-visible">
        <SearchSection onSearch={handleSearch} />
      </div>
      <div className="pt-16">
        <RidesHistory />
      </div>
      
      <BottomNav 
        activeTab="search"
        onTabChange={handleTabChange}
      />
    </div>
  );
};
