import { useState } from 'react';
import { RidesList } from './pages/RidesList';
import { SearchPage } from './pages/SearchPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { RideDetailsPage } from './pages/RideDetailsPage';
import { BookingPage } from './pages/BookingPage';
import { CreatePage } from './pages/CreatePage';
import { CreateDestinationPage } from './pages/CreateDestinationPage';
import { RouteSelectedPage } from './pages/RouteSelectedPage';
import { DateSelectionPage } from './pages/DateSelectionPage';
import { TimeSelectionPage } from './pages/TimeSelectionPage';
import { PassengerSelectionPage } from './pages/PassengerSelectionPage';
import { PriceSelectionPage } from './pages/PriceSelectionPage';
import RegisterPage from './pages/RegisterPage';
import RegisterStep2Page from './pages/RegisterStep2Page';
import RegisterStep3Page from './pages/RegisterStep3Page';
import LoginPage from './pages/LoginPage';
import { RegisterProvider } from './contexts/RegisterContext';
import { authService } from './services/authService';
import type { BookedRide } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [authMode, setAuthMode] = useState<'register' | 'login'>('login');
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
  const [activeTab, setActiveTab] = useState('search');
  const [currentPage, setCurrentPage] = useState('search');
  const [createStep, setCreateStep] = useState<'departure' | 'destination' | 'route' | 'date' | 'time' | 'passengers' | 'price'>('departure');
  const [selectedRide, setSelectedRide] = useState(null);
  const [searchData, setSearchData] = useState<{ departure: string; passengers: number } | null>(null);
  const [bookedRides, setBookedRides] = useState<BookedRide[]>([]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'search') {
      setCurrentPage('search');
    } else if (tab === 'create') {
      setCurrentPage('create');
      setCreateStep('departure'); // Sempre começar com a tela de partida
    }
  };

  const handleCreateStepChange = (step: 'departure' | 'destination' | 'route' | 'date' | 'time' | 'passengers' | 'price') => {
    setCreateStep(step);
  };

  const handleCreateBack = () => {
    if (createStep === 'price') {
      setCreateStep('passengers');
    } else if (createStep === 'passengers') {
      setCreateStep('time');
    } else if (createStep === 'time') {
      setCreateStep('date');
    } else if (createStep === 'date') {
      setCreateStep('route');
    } else if (createStep === 'route') {
      setCreateStep('destination');
    } else if (createStep === 'destination') {
      setCreateStep('departure');
    }
  };

  const handlePageChange = (page: string, data?: any) => {
    setCurrentPage(page);
    if (data) {
      if (page === 'search-results') {
        setSearchData(data);
      } else {
        setSelectedRide(data);
      }
    }
  };

  const handleBack = () => {
    if (currentPage === 'ride-details') {
      setCurrentPage('search-results');
    } else if (currentPage === 'booking') {
      setCurrentPage('ride-details');
    }
  };

  const handleConfirmBooking = (rideDetails: any, searchData: { departure: string; passengers: number }) => {
    const newBooking: BookedRide = {
      id: Date.now().toString(),
      rideDetails,
      searchData,
      bookingDate: new Date().toISOString(),
      status: 'confirmed'
    };
    
    setBookedRides(prev => [...prev, newBooking]);
    
    // Voltar para a aba de rotas após confirmar
    setActiveTab('routes');
    setCurrentPage('search');
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookedRides(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' as const }
          : booking
      )
    );
  };

  return (
    <RegisterProvider>
      {/* Se não estiver autenticado, mostrar página de autenticação */}
      {!isAuthenticated ? (
        authMode === 'register' ? (
          registerStep === 1 ? (
            <RegisterPage 
              onRegisterSuccess={() => setRegisterStep(2)} 
              onLoginClick={() => setAuthMode('login')}
            />
          ) : registerStep === 2 ? (
            <RegisterStep2Page 
              onNext={() => setRegisterStep(3)} 
              onBack={() => setRegisterStep(1)}
            />
          ) : (
            <RegisterStep3Page 
              onComplete={() => setIsAuthenticated(true)} 
              onBack={() => setRegisterStep(2)}
            />
          )
        ) : (
          <LoginPage 
            onLoginSuccess={() => setIsAuthenticated(true)} 
            onRegisterClick={() => {
              setAuthMode('register');
              setRegisterStep(1);
            }}
            onForgotPasswordClick={() => {
              // Aqui você pode implementar a lógica de recuperação de senha
              console.log('Esqueceu a senha clicado');
            }}
          />
        )
      ) : (
        <>
          {activeTab === 'search' && currentPage === 'search' && <SearchPage onTabChange={handleTabChange} onPageChange={handlePageChange} />}
          {activeTab === 'search' && currentPage === 'search-results' && <SearchResultsPage onTabChange={handleTabChange} onPageChange={handlePageChange} />}
          {activeTab === 'search' && currentPage === 'ride-details' && selectedRide && <RideDetailsPage rideDetails={selectedRide} onTabChange={handleTabChange} onBack={handleBack} onPageChange={handlePageChange} />}
          {activeTab === 'search' && currentPage === 'booking' && selectedRide && <BookingPage rideDetails={selectedRide} searchData={searchData} onTabChange={handleTabChange} onBack={handleBack} onConfirmBooking={handleConfirmBooking} />}
          {activeTab === 'create' && createStep === 'departure' && <CreatePage onTabChange={handleTabChange} onStepChange={handleCreateStepChange} />}
          {activeTab === 'create' && createStep === 'destination' && <CreateDestinationPage onTabChange={handleTabChange} onBack={handleCreateBack} onStepChange={handleCreateStepChange} />}
          {activeTab === 'create' && createStep === 'route' && <RouteSelectedPage onTabChange={handleTabChange} onBack={handleCreateBack} onNavigateToDateSelection={() => setCreateStep('date')} />}
          {activeTab === 'create' && createStep === 'date' && <DateSelectionPage onTabChange={handleTabChange} onBack={handleCreateBack} onDateSelected={() => setCreateStep('time')} />}
          {activeTab === 'create' && createStep === 'time' && <TimeSelectionPage onTabChange={handleTabChange} onBack={handleCreateBack} onTimeSelected={() => setCreateStep('passengers')} />}
          {activeTab === 'create' && createStep === 'passengers' && <PassengerSelectionPage onTabChange={handleTabChange} onBack={handleCreateBack} onPassengerSelected={() => setCreateStep('price')} />}
          {activeTab === 'create' && createStep === 'price' && <PriceSelectionPage onTabChange={handleTabChange} onBack={handleCreateBack} onPriceSelected={(price) => console.log('Preço selecionado:', price)} />}
          {activeTab === 'routes' && <RidesList onTabChange={handleTabChange} bookedRides={bookedRides} onCancelBooking={handleCancelBooking} />}
          {/* Adicione outras abas conforme necessário */}
        </>
      )}
    </RegisterProvider>
  );
}

export default App;
