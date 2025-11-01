import { useState, useEffect } from 'react';
import { RidesList } from './pages/RidesList';
import { SearchPage } from './pages/SearchPage';
import { SearchDestinationPage } from './pages/SearchDestinationPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { RideDetailsPage } from './pages/RideDetailsPage';
import { BookingPage } from './pages/BookingPage';
import { ProfilePage } from './pages/ProfilePage';
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
import { ToastProvider } from './contexts/ToastContext';
import { authService } from './services/authService';
import { rideService } from './services/rideService';
import { userService } from './services/userService';
import { computeEndTimeFromLeaflet } from './utils/time';
import { useToast } from './contexts/ToastContext';
import type { BookedRide } from './types';

function AppContent() {
  const { showSuccess, showError } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [authMode, setAuthMode] = useState<'register' | 'login'>('login');
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
  const [activeTab, setActiveTab] = useState('search');
  const [currentPage, setCurrentPage] = useState('search');
  const [createStep, setCreateStep] = useState<'departure' | 'destination' | 'route' | 'date' | 'time' | 'passengers' | 'price'>('departure');
  const [selectedRide, setSelectedRide] = useState(null);
  const [searchData, setSearchData] = useState<{ departure: string; passengers: number } | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [bookedRides, setBookedRides] = useState<BookedRide[]>([]);
  const [loadingRideHistory, setLoadingRideHistory] = useState(false);
  // Create flow selections
  const [createDate, setCreateDate] = useState<string | null>(null); // YYYY-MM-DD
  const [createTime, setCreateTime] = useState<string | null>(null); // HH:mm
  const [createSeats, setCreateSeats] = useState<number | null>(null);
  // price is passed directly to handler; no need to store separately

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
      if (page === 'search-results' || page === 'search-destination') {
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
    } else if (currentPage === 'search-destination') {
      setCurrentPage('search');
    } else if (currentPage === 'search-results') {
      setCurrentPage('search-destination');
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

  const handleCancelBooking = async (bookingId: string) => {
    try {
      // Encontrar a corrida para obter a role e o rideId
      const booking = bookedRides.find(b => b.id === bookingId);
      if (!booking) {
        console.error('Corrida não encontrada');
        return;
      }

      // Obter ID do usuário logado
      const userId = await getDriverId();

      // Chamar a API apropriada baseado na role
      if (booking.role === 'driver') {
        // Se for motorista, cancelar como motorista (remove a corrida)
        await rideService.cancelAsDriver(booking.rideDetails.id, userId);
        // Remover da lista
        setBookedRides(prev => prev.filter(b => b.id !== bookingId));
      } else if (booking.role === 'passenger') {
        // Se for passageiro, cancelar como passageiro (remove apenas ele da corrida)
        await rideService.cancelAsPassenger(booking.rideDetails.id, userId);
        // Remover da lista
        setBookedRides(prev => prev.filter(b => b.id !== bookingId));
      }
    } catch (error) {
      console.error('Erro ao cancelar corrida:', error);
    }
  };

  const getDriverId = async (): Promise<string> => {
    const userRaw = localStorage.getItem('authUser');
    const cached = userRaw ? JSON.parse(userRaw) : null;
    if (cached?.id) return cached.id as string;
    // Fallback: fetch from API and cache
    const me = await userService.getMe();
    localStorage.setItem('authUser', JSON.stringify({ id: me.id, email: me.email }));
    return me.id;
  };

  // Função auxiliar para fazer reverse geocoding usando Photon
  const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    try {
      const response = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`);
      if (!response.ok) {
        return 'Endereço não disponível';
      }
      const data = await response.json();
      const props = data?.features?.[0]?.properties;
      if (!props) {
        return 'Endereço não disponível';
      }
      
      // Montar endereço a partir das propriedades
      const parts = [];
      if (props.name) parts.push(props.name);
      if (props.street) parts.push(props.street);
      if (props.housenumber) parts.push(props.housenumber);
      if (props.city) parts.push(props.city);
      if (props.state) parts.push(props.state);
      
      return parts.length > 0 ? parts.join(', ') : 'Endereço não disponível';
    } catch (error) {
      console.error('Erro no reverse geocoding:', error);
      return 'Endereço não disponível';
    }
  };

  // Carregar histórico de corridas quando a aba "routes" for ativada
  useEffect(() => {
    const loadRideHistory = async () => {
      if (activeTab === 'routes' && isAuthenticated) {
        try {
          setLoadingRideHistory(true);
          const userId = await getDriverId();
          const history = await rideService.getRideHistory(userId);
          
          // Converter timestamp do Firestore para data
          const convertFirestoreTimestamp = (ts: { _seconds: number; _nanoseconds: number }) => {
            return new Date(ts._seconds * 1000 + ts._nanoseconds / 1000000);
          };

          // Formatar data
          const formatDate = (dateObj: { _seconds: number; _nanoseconds: number } | string) => {
            let date: Date;
            if (typeof dateObj === 'object' && '_seconds' in dateObj) {
              date = convertFirestoreTimestamp(dateObj);
            } else {
              date = new Date(dateObj as string);
            }
            return date.toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric' 
            });
          };

          // Formatar preço
          const formatPrice = (price: number) => {
            return `R$ ${price.toFixed(2).replace('.', ',')}`;
          };

          // Buscar dados de todos os motoristas únicos primeiro
          const uniqueDriverIds = [...new Set(history.map((item: any) => item.ride.driverId).filter(Boolean))];
          
          const driverDataPromises = uniqueDriverIds.map(async (driverId) => {
            try {
              const driverData = await userService.getUserById(driverId);
              return { driverId, driverData };
            } catch (error) {
              console.error(`Erro ao buscar motorista ${driverId}:`, error);
              return { driverId, driverData: null };
            }
          });

          const driverDataResults = await Promise.all(driverDataPromises);
          
          // Criar um mapa de driverId -> driverData para acesso rápido
          const driverMap = new Map(
            driverDataResults
              .filter(result => result.driverData)
              .map(result => [result.driverId, result.driverData])
          );

          // Transformar dados da API para o formato esperado
          const transformedRidesPromises = history.map(async (item: any) => {
            const ride = item.ride;
            
            // Usar startTime e endTime se disponíveis, senão usar time
            const departureTime = ride.startTime || ride.time || '--:--';
            const arrivalTime = ride.endTime || '--:--';

            // Fazer reverse geocoding para obter endereços
            const [departureAddress, arrivalAddress] = await Promise.all([
              reverseGeocode(ride.departureLatLng[0], ride.departureLatLng[1]),
              reverseGeocode(ride.destinationLatLng[0], ride.destinationLatLng[1])
            ]);

            // Obter timestamp da data da corrida para ordenação
            let sortDateTimestamp: number;
            if (ride.date && typeof ride.date === 'object' && '_seconds' in ride.date) {
              sortDateTimestamp = ride.date._seconds * 1000 + (ride.date._nanoseconds || 0) / 1000000;
            } else if (ride.date) {
              sortDateTimestamp = new Date(ride.date as string).getTime();
            } else {
              // Fallback para data de criação se não houver data da corrida
              const createdAt = item.createdAt;
              if (createdAt && typeof createdAt === 'object' && '_seconds' in createdAt) {
                sortDateTimestamp = createdAt._seconds * 1000 + (createdAt._nanoseconds || 0) / 1000000;
              } else {
                sortDateTimestamp = new Date().getTime();
              }
            }

            // Buscar dados do motorista
            const driverData = driverMap.get(ride.driverId);
            const driverName = driverData 
              ? `${driverData.firstName} ${driverData.lastName}`.trim()
              : `Motorista ${ride.driverId?.substring(0, 6) || 'N/A'}`;

            return {
              id: item.id || item.rideId,
              rideDetails: {
                id: ride.id,
                departureTime,
                arrivalTime,
                date: formatDate(ride.date),
                price: formatPrice(ride.pricePerPassenger),
                driverName,
                driverPhoto: null,
                driverRating: '4.5',
                departureLocation: 'Origem',
                departureAddress,
                arrivalLocation: 'Destino',
                arrivalAddress,
                maxPassengers: ride.allSeats,
                availableSeats: ride.availableSeats
              },
              searchData: {
                departure: 'Origem',
                passengers: ride.allSeats - ride.availableSeats
              },
              bookingDate: formatDate(item.createdAt),
              status: item.status || 'pending',
              role: item.role as 'driver' | 'passenger',
              sortDate: sortDateTimestamp
            };
          });

          const transformedRides = await Promise.all(transformedRidesPromises);
          setBookedRides(transformedRides);
        } catch (error) {
          console.error('Erro ao carregar histórico de corridas:', error);
        } finally {
          setLoadingRideHistory(false);
        }
      } else {
        // Resetar loading se não estiver na aba routes
        setLoadingRideHistory(false);
      }
    };

    loadRideHistory();
  }, [activeTab, isAuthenticated]);

  const handleCreateRide = async (price: number) => {
    try {
      // Ensure driver id
      const driverId = await getDriverId();

      // Read coordinates
      const departureRaw = localStorage.getItem('selectedAddress');
      const destinationRaw = localStorage.getItem('selectedDestination');
      if (!departureRaw || !destinationRaw) {
        throw new Error('Coordenadas de partida/destino não encontradas.');
      }
      if (!createDate || !createTime || !createSeats) {
        throw new Error('Data, horário ou lugares não definidos.');
      }

      const departure = JSON.parse(departureRaw);
      const destination = JSON.parse(destinationRaw);

      // endTime somado à duração aproximada do Leaflet
      const endTime = computeEndTimeFromLeaflet(createTime);

      const payload = {
        driverId,
        departureLatLng: [Number(departure.latitude), Number(departure.longitude)] as [number, number],
        destinationLatLng: [Number(destination.latitude), Number(destination.longitude)] as [number, number],
        date: createDate,
        startTime: createTime,
        endTime,
        allSeats: createSeats,
        pricePerPassenger: price,
        passengerIds: [] as string[]
      };

      await rideService.createRide(payload);
      showSuccess('Carona criada com sucesso!');

      // Reset create flow
      setCreateStep('departure');
      setCreateDate(null);
      setCreateTime(null);
      setCreateSeats(null);
      setActiveTab('routes');
      setCurrentPage('search');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao criar carona';
      showError(msg);
    }
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
              onComplete={() => {
                setAuthMode('login');
                setRegisterStep(1);
              }} 
              onBack={() => setRegisterStep(2)}
            />
          )
        ) : (
          <LoginPage 
            onLoginSuccess={() => {
              setIsAuthenticated(true);
              // Redirecionar para a tela de busca (início)
              setActiveTab('search');
              setCurrentPage('search');
            }} 
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
          {activeTab === 'search' && currentPage === 'search-destination' && <SearchDestinationPage onTabChange={handleTabChange} onBack={() => setCurrentPage('search')} onContinue={(rides) => { const departure = localStorage.getItem('searchDeparture'); const passengers = localStorage.getItem('searchPassengers'); setSearchData({ departure: departure || '', passengers: parseInt(passengers || '1') }); setSearchResults(rides); setCurrentPage('search-results'); }} searchData={searchData || undefined} />}
          {activeTab === 'search' && currentPage === 'search-results' && <SearchResultsPage rides={searchResults} onTabChange={handleTabChange} onPageChange={handlePageChange} />}
          {activeTab === 'search' && currentPage === 'ride-details' && selectedRide && <RideDetailsPage rideDetails={selectedRide} onTabChange={handleTabChange} onBack={handleBack} onPageChange={handlePageChange} />}
          {activeTab === 'search' && currentPage === 'booking' && selectedRide && <BookingPage rideDetails={selectedRide} searchData={searchData || undefined} onTabChange={handleTabChange} onBack={handleBack} onConfirmBooking={handleConfirmBooking} />}
          {activeTab === 'create' && createStep === 'departure' && <CreatePage onTabChange={handleTabChange} onStepChange={handleCreateStepChange} />}
          {activeTab === 'create' && createStep === 'destination' && <CreateDestinationPage onTabChange={handleTabChange} onBack={handleCreateBack} onStepChange={handleCreateStepChange} />}
          {activeTab === 'create' && createStep === 'route' && <RouteSelectedPage onTabChange={handleTabChange} onBack={handleCreateBack} onNavigateToDateSelection={() => setCreateStep('date')} />}
          {activeTab === 'create' && createStep === 'date' && <DateSelectionPage onTabChange={handleTabChange} onBack={handleCreateBack} onDateSelected={(d) => { const yyyy = d.getFullYear(); const mm = String(d.getMonth() + 1).padStart(2, '0'); const dd = String(d.getDate()).padStart(2, '0'); setCreateDate(`${yyyy}-${mm}-${dd}`); setCreateStep('time'); }} />}
          {activeTab === 'create' && createStep === 'time' && <TimeSelectionPage onTabChange={handleTabChange} onBack={handleCreateBack} onTimeSelected={(t) => { setCreateTime(t); setCreateStep('passengers'); }} />}
          {activeTab === 'create' && createStep === 'passengers' && <PassengerSelectionPage onTabChange={handleTabChange} onBack={handleCreateBack} onPassengerSelected={(count) => { setCreateSeats(count); setCreateStep('price'); }} />}
          {activeTab === 'create' && createStep === 'price' && <PriceSelectionPage onTabChange={handleTabChange} onBack={handleCreateBack} onPriceSelected={(price) => { handleCreateRide(price); }} />}
          {activeTab === 'routes' && <RidesList onTabChange={handleTabChange} bookedRides={bookedRides} onCancelBooking={handleCancelBooking} isLoading={loadingRideHistory} />}
          {activeTab === 'profile' && <ProfilePage onTabChange={handleTabChange} onLogout={() => setIsAuthenticated(false)} />}
          {/* Adicione outras abas conforme necessário */}
        </>
        )}
      </RegisterProvider>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
