import React, { useState, useEffect } from 'react';
import { BottomNav } from '../components/BottomNav';
import { ConfirmModal } from '../components/ConfirmModal';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { LogOut, Mail, Phone, CreditCard } from 'lucide-react';

interface ProfilePageProps {
  onTabChange?: (tab: string) => void;
  onLogout?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onTabChange, onLogout }) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const authUserRaw = localStorage.getItem('authUser');
        let userId: string;
        
        if (authUserRaw) {
          const authUser = JSON.parse(authUserRaw);
          userId = authUser.id;
        } else {
          const me = await userService.getMe();
          userId = me.id;
          localStorage.setItem('authUser', JSON.stringify({ id: me.id, email: me.email }));
        }

        const user = await userService.getUserById(userId);
        setUserData(user);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    authService.logout();
    localStorage.removeItem('authUser');
    localStorage.removeItem('selectedAddress');
    localStorage.removeItem('selectedDestination');
    setShowLogoutModal(false);
    onLogout?.();
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '';

    const digits = phone.replace(/\D/g, '');
    if (digits.length === 0) return phone;

    let countryCode = '';
    let number = digits;

    if (digits.length > 11) {
      const excess = digits.length - 11;
      countryCode = digits.slice(0, excess);
      number = digits.slice(excess);
    }

    if (number.length === 10) {
      const area = number.slice(0, 2);
      const part1 = number.slice(2, 6);
      const part2 = number.slice(6);
      return `${countryCode ? `+${countryCode} ` : ''}(${area}) ${part1}-${part2}`;
    }

    if (number.length === 11) {
      const area = number.slice(0, 2);
      const part1 = number.slice(2, 7);
      const part2 = number.slice(7);
      return `${countryCode ? `+${countryCode} ` : ''}(${area}) ${part1}-${part2}`;
    }

    return countryCode ? `+${countryCode} ${number}` : number;
  };

  const getUserPhoto = () => {
    if (userData?.photo) return userData.photo;
    const initials = userData 
      ? `${userData.firstName?.[0] || ''}${userData.lastName?.[0] || ''}`.toUpperCase()
      : 'U';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=3b82f6&color=ffffff&size=120`;
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      
      <div className="bg-gradient-to-b from-blue-500 to-blue-600 pt-5 pb-5 mb-4">
        <h1 className="text-2xl font-bold px-3 text-white">Perfil</h1>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-base">Carregando dados do perfil...</p>
        </div>
      ) : userData ? (
        <div className="px-4">
          
          <div className="flex flex-col items-center py-6">
            <img
              src={getUserPhoto()}
              alt="Foto do usuário"
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-900">
              {userData.firstName} {userData.lastName}
            </h2>
            {userData.hasCar && (
              <span className="mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Possui veículo
              </span>
            )}
          </div>

          
          <div className="space-y-3 mb-6">
            
            <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-base text-gray-900 font-medium">{userData.corporateEmail || userData.email}</p>
              </div>
            </div>

            
            {userData.phone && (
              <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Telefone</p>
                  <p className="text-base text-gray-900 font-medium">{formatPhone(userData.phone)}</p>
                </div>
              </div>
            )}

            
            {userData.cpf && (
              <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">CPF</p>
                  <p className="text-base text-gray-900 font-medium">{formatCPF(userData.cpf)}</p>
                </div>
              </div>
            )}
          </div>

          
          <button
            onClick={handleLogoutClick}
            className="w-full bg-red-600 text-white py-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 mb-6"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      ) : (
        <div className="px-4 py-8 text-center">
          <p className="text-gray-500 text-lg">Erro ao carregar dados do perfil</p>
          <p className="text-gray-400 text-sm mt-2">Tente novamente mais tarde</p>
        </div>
      )}

      <BottomNav 
        activeTab="profile"
        onTabChange={handleTabChange}
      />

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={confirmLogout}
        title="Confirmar Saída"
        message="Tem certeza que deseja sair? Você precisará fazer login novamente para acessar o aplicativo."
        confirmText="Sim, Sair"
        cancelText="Cancelar"
      />
    </div>
  );
};

