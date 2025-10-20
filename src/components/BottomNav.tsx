import React from 'react';
import { Search, Plus, MessageCircle, User } from 'lucide-react';
import logo from '../assets/logo.png';

interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

// Componente para o logo personalizado
const LogoIcon = ({ size = 28, className = "" }) => (
  <img 
    src={logo} 
    alt="Logo" 
    width={size} 
    height={size} 
    className={className}
  />
);

export const BottomNav: React.FC<BottomNavProps> = ({ onTabChange }) => {
  const tabs = [
    { id: 'search', icon: Search, label: 'Pesquisa' },
    { id: 'create', icon: Plus, label: 'Criar' },
    { id: 'routes', icon: LogoIcon, label: 'Rotas' },
    { id: 'messages', icon: MessageCircle, label: 'Mensagens' },
    { id: 'profile', icon: User, label: 'Perfil' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-300">
      <div className="flex justify-around items-center py-2 px-2">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange?.(id)}
            className="flex flex-col justify-center items-center transition-colors border-none bg-transparent text-blue-600 py-2 px-2 min-h-[60px]"
          >
            {id === 'routes' ? (
              <Icon className="mb-1" />
            ) : (
              <Icon size={22} className="mb-2" />
            )}
            <span className="text-xs font-medium leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
