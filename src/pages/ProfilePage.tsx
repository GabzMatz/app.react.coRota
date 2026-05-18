import React, { useState, useEffect } from 'react';
import { BottomNav } from '../components/BottomNav';
import { ConfirmModal } from '../components/ConfirmModal';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { addressService } from '../services/addressService';
import { LogOut, Mail, Phone, CreditCard, Car, Pencil, Save, X, MapPin } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import {
  formatLicensePlateInput,
  isValidBrazilianLicensePlate,
  licensePlateValidationMessage,
} from '../utils/licensePlate';
import { parseVehicleTypeFromCarInfo, vehicleTypeLabel, type VehicleType } from '../utils/vehicleType';
import { PhotoCropModal } from '../components/PhotoCropModal';

interface ProfilePageProps {
  onTabChange?: (tab: string) => void;
  onLogout?: () => void;
}

const MAX_PHOTO_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const MAX_PHOTO_DATA_URL_LENGTH = 700000;

export const ProfilePage: React.FC<ProfilePageProps> = ({ onTabChange, onLogout }) => {
  const { showError, showSuccess, showWarning } = useToast();

  const parseCarInfo = (carInfo: string) => {
    const parsed = {
      carBrand: '',
      carModel: '',
      carPlate: '',
      carColor: ''
    };

    if (!carInfo.trim()) {
      return parsed;
    }

    const segments = carInfo.split('|').map((segment) => segment.trim());
    for (const segment of segments) {
      const [labelRaw, ...valueParts] = segment.split(':');
      const label = (labelRaw || '').trim().toLowerCase();
      const value = valueParts.join(':').trim();
      if (!value) {
        continue;
      }
      if (label === 'marca') {
        parsed.carBrand = value;
      } else if (label === 'modelo') {
        parsed.carModel = value;
      } else if (label === 'placa') {
        parsed.carPlate = value;
      } else if (label === 'cor') {
        parsed.carColor = value;
      }
    }

    if (!parsed.carBrand && !parsed.carModel && !parsed.carPlate && !parsed.carColor) {
      parsed.carModel = carInfo;
    }

    return parsed;
  };

  const buildCarInfo = (
    vehicleType: VehicleType,
    carBrand: string,
    carModel: string,
    carPlate: string,
    carColor: string
  ) => {
    const hasAnyValue = [carBrand, carModel, carPlate, carColor].some((value) => value.trim() !== '');
    if (!hasAnyValue) {
      return '';
    }

    const typeLabel = vehicleType === 'motorcycle' ? 'Moto' : 'Carro';
    return [
      `Tipo: ${typeLabel}`,
      `Marca: ${carBrand.trim()}`,
      `Modelo: ${carModel.trim()}`,
      `Placa: ${carPlate.trim()}`,
      `Cor: ${carColor.trim()}`
    ].join(' | ');
  };
  
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    photo: '',
    phone: '',
    vehicleType: 'car' as VehicleType,
    carBrand: '',
    carModel: '',
    carPlate: '',
    carColor: '',
    carSeats: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    complemento: '',
  });
  const [selectedPhotoFileName, setSelectedPhotoFileName] = useState('');
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');

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
        const parsedCarInfo = parseCarInfo(user.carInfo || '');
        const vehicleType = user.vehicleType || parseVehicleTypeFromCarInfo(user.carInfo) || 'car';

        let addressFields = {
          cep: '',
          rua: '',
          numero: '',
          bairro: '',
          cidade: '',
          estado: '',
          complemento: '',
        };

        if (user.addressId) {
          try {
            const address = await addressService.getAddressById(user.addressId);
            addressFields = {
              cep: address.zipCode || '',
              rua: address.street || '',
              numero: address.number || '',
              bairro: address.neighborhood || '',
              cidade: address.city || '',
              estado: address.state || '',
              complemento: address.complement || '',
            };
          } catch {
            // mantém endereço vazio se falhar o carregamento
          }
        }

        setUserData(user);
        setFormData({
          photo: user.photo || '',
          phone: user.phone || '',
          vehicleType,
          carBrand: parsedCarInfo.carBrand,
          carModel: parsedCarInfo.carModel,
          carPlate: parsedCarInfo.carPlate,
          carColor: parsedCarInfo.carColor,
          carSeats: user.carSeats ? String(user.carSeats) : '',
          ...addressFields,
        });
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        showError('Erro ao carregar dados do perfil.');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      const parsedCarInfo = parseCarInfo(userData?.carInfo || '');
      setFormData((prev) => ({
        ...prev,
        photo: userData?.photo || '',
        phone: userData?.phone || '',
        vehicleType: userData?.vehicleType || parseVehicleTypeFromCarInfo(userData?.carInfo) || 'car',
        carBrand: parsedCarInfo.carBrand,
        carModel: parsedCarInfo.carModel,
        carPlate: parsedCarInfo.carPlate,
        carColor: parsedCarInfo.carColor,
        carSeats: userData?.carSeats ? String(userData.carSeats) : '',
      }));
      setIsEditing(false);
      return;
    }
    setIsEditing(true);
  };

  const handleInputChange = (
    field:
      | 'photo'
      | 'phone'
      | 'vehicleType'
      | 'carBrand'
      | 'carModel'
      | 'carPlate'
      | 'carColor'
      | 'carSeats'
      | 'cep'
      | 'rua'
      | 'numero'
      | 'bairro'
      | 'cidade'
      | 'estado'
      | 'complemento',
    value: string
  ) => {
    if (field === 'carPlate') {
      setFormData((prev) => ({ ...prev, carPlate: formatLicensePlateInput(value) }));
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Nao foi possivel processar a imagem selecionada.'));
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      showError('Selecione apenas arquivos de imagem.');
      return;
    }

    if (file.size > MAX_PHOTO_FILE_SIZE_BYTES) {
      showError('A imagem deve ter no maximo 2MB.');
      return;
    }

    try {
      const base64 = await convertFileToBase64(file);
      setCropImageSrc(base64);
      setSelectedPhotoFileName(file.name);
      setCropModalOpen(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao processar imagem.';
      showError(message);
    } finally {
      event.target.value = '';
    }
  };

  const handleSaveProfile = async () => {
    if (!userData?.id || isSaving) {
      return;
    }

    const hasAnyCarField = [formData.carBrand, formData.carModel, formData.carPlate, formData.carColor, formData.carSeats]
      .some((value) => value.trim() !== '');

    const generatedCarInfo = hasAnyCarField
      ? buildCarInfo(
          formData.vehicleType,
          formData.carBrand,
          formData.carModel,
          formData.carPlate,
          formData.carColor
        )
      : '';

    if (generatedCarInfo) {
      if (!isValidBrazilianLicensePlate(formData.carPlate)) {
        showError(licensePlateValidationMessage);
        return;
      }
      if (!formData.carSeats.trim()) {
        showError('Informe a quantidade total de lugares do veículo (incluindo o motorista).');
        return;
      }
    }

    const parsedSeats = formData.carSeats.trim() ? Number(formData.carSeats) : undefined;
    if (parsedSeats) {
      const minSeats = formData.vehicleType === 'motorcycle' ? 1 : 2;
      const maxSeats = formData.vehicleType === 'motorcycle' ? 2 : 8;
      if (Number.isNaN(parsedSeats) || parsedSeats < minSeats || parsedSeats > maxSeats) {
        showError(
          formData.vehicleType === 'motorcycle'
            ? 'Informe de 1 a 2 lugares no total (incluindo o motorista).'
            : 'Informe de 2 a 8 lugares no total (incluindo o motorista).'
        );
        return;
      }
    }

    try {
      setIsSaving(true);

      if (userData.addressId) {
        await addressService.updateAddress(userData.addressId, {
          street: formData.rua.trim(),
          number: formData.numero.trim(),
          neighborhood: formData.bairro.trim(),
          city: formData.cidade.trim(),
          state: formData.estado.trim(),
          zipCode: formData.cep.trim(),
          lat: '-23.518970',
          long: '-47.458640',
          complement: formData.complemento.trim(),
          isActive: true,
        });
      }

      const updatePayload: Parameters<typeof userService.updateProfile>[1] = {
        phone: formData.phone.trim(),
        photo: formData.photo.trim(),
      };

      if (generatedCarInfo) {
        updatePayload.carInfo = generatedCarInfo;
        updatePayload.carSeats = parsedSeats;
        updatePayload.vehicleType = formData.vehicleType;
      } else {
        updatePayload.clearVehicle = true;
      }

      const updateResult = await userService.updateProfile(userData.id, updatePayload);

      const updatedUser = await userService.getUserById(userData.id);
      const parsedCarInfo = parseCarInfo(updatedUser.carInfo || '');
      setUserData(updatedUser);
      setFormData((prev) => ({
        ...prev,
        photo: updatedUser.photo || '',
        phone: updatedUser.phone || '',
        vehicleType: updatedUser.vehicleType || parseVehicleTypeFromCarInfo(updatedUser.carInfo) || 'car',
        carBrand: parsedCarInfo.carBrand,
        carModel: parsedCarInfo.carModel,
        carPlate: parsedCarInfo.carPlate,
        carColor: parsedCarInfo.carColor,
        carSeats: updatedUser.carSeats ? String(updatedUser.carSeats) : '',
      }));
      setSelectedPhotoFileName('');
      setIsEditing(false);
      if (updateResult.photoSkipped) {
        showWarning('Perfil atualizado, mas a API atual nao suporta salvar foto.');
      } else {
        showSuccess('Perfil atualizado com sucesso!');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar perfil';
      showError(message);
    } finally {
      setIsSaving(false);
    }
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
    if (isEditing && formData.photo) {
      return formData.photo;
    }
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
            {isEditing && formData.photo && formData.photo !== (userData?.photo || '') && (
              <p className="text-xs text-blue-600 mb-2">Prévia — como ficará no perfil</p>
            )}
            <h2 className="text-2xl font-bold text-gray-900">
              {userData.firstName} {userData.lastName}
            </h2>
            {(userData.carInfo && userData.carSeats) && (
              <span className="mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Veiculo cadastrado
              </span>
            )}
          </div>

          <div className="mb-4 flex gap-2">
            <button
              onClick={handleEditToggle}
              className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              {isEditing ? <X size={18} /> : <Pencil size={18} />}
              {isEditing ? 'Cancelar edição' : 'Editar perfil'}
            </button>
            {isEditing && (
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            )}
          </div>

          {/* Informações do Usuário */}
          <div className="space-y-3 mb-6">
            
            <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-base text-gray-900 font-medium">{userData.corporateEmail || userData.email}</p>
              </div>
            </div>

            {/* Telefone */}
            <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Telefone</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="Digite seu telefone"
                    />
                  ) : (
                    <p className="text-base text-gray-900 font-medium">{formatPhone(userData.phone)}</p>
                  )}
                </div>
              </div>

            
            {userData.cpf && (
              <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">CPF</p>
                  <p className="text-base text-gray-900 font-medium">{formatCPF(userData.cpf)}</p>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Endereço</p>
                {isEditing ? (
                  <div className="space-y-2">
                    <input type="text" value={formData.cep} onChange={(e) => handleInputChange('cep', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="CEP" />
                    <input type="text" value={formData.rua} onChange={(e) => handleInputChange('rua', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Rua" />
                    <input type="text" value={formData.numero} onChange={(e) => handleInputChange('numero', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Número" />
                    <input type="text" value={formData.bairro} onChange={(e) => handleInputChange('bairro', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Bairro" />
                    <input type="text" value={formData.cidade} onChange={(e) => handleInputChange('cidade', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Cidade" />
                    <input type="text" value={formData.estado} onChange={(e) => handleInputChange('estado', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Estado" />
                    <input type="text" value={formData.complemento} onChange={(e) => handleInputChange('complemento', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Complemento (opcional)" />
                  </div>
                ) : (
                  <p className="text-base text-gray-900 font-medium">
                    {[formData.rua, formData.numero, formData.bairro, formData.cidade, formData.estado]
                      .filter(Boolean)
                      .join(', ') || 'Não informado'}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
              <Car className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Veiculo</p>
                {isEditing ? (
                  <div className="space-y-2">
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="car">Carro</option>
                      <option value="motorcycle">Moto</option>
                    </select>
                    <input
                      type="text"
                      value={formData.carBrand}
                      onChange={(e) => handleInputChange('carBrand', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="Marca (ex: Honda)"
                    />
                    <input
                      type="text"
                      value={formData.carModel}
                      onChange={(e) => handleInputChange('carModel', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="Modelo (ex: Civic)"
                    />
                    <input
                      type="text"
                      value={formData.carPlate}
                      onChange={(e) => handleInputChange('carPlate', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="Placa (ex: ABC1D23)"
                    />
                    <input
                      type="text"
                      value={formData.carColor}
                      onChange={(e) => handleInputChange('carColor', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="Cor (ex: Prata)"
                    />
                    <input
                      type="number"
                      min={formData.vehicleType === 'motorcycle' ? 1 : 2}
                      max={formData.vehicleType === 'motorcycle' ? 2 : 8}
                      value={formData.carSeats}
                      onChange={(e) => handleInputChange('carSeats', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder={
                        formData.vehicleType === 'motorcycle'
                          ? 'Total de lugares na moto (1 a 2)'
                          : 'Total de lugares no carro (2 a 8)'
                      }
                    />
                    <p className="text-xs text-gray-500">
                      Informe a quantidade total de lugares, incluindo o assento do motorista.
                    </p>
                    <p className="text-xs text-gray-500">Deixe em branco se não quiser cadastrar veículo.</p>
                  </div>
                ) : (
                  (() => {
                    const parsedCarInfo = parseCarInfo(userData.carInfo || '');
                    const hasCarData = Boolean(userData.carInfo);
                    if (!hasCarData) {
                      return <p className="text-base text-gray-900 font-medium">Nao cadastrado</p>;
                    }

                    return (
                      <div className="text-base text-gray-900 font-medium space-y-1">
                        <p>Tipo: {vehicleTypeLabel(userData.vehicleType || parseVehicleTypeFromCarInfo(userData.carInfo))}</p>
                        <p>Marca: {parsedCarInfo.carBrand || '-'}</p>
                        <p>Modelo: {parsedCarInfo.carModel || '-'}</p>
                        <p>Placa: {parsedCarInfo.carPlate || '-'}</p>
                        <p>Cor: {parsedCarInfo.carColor || '-'}</p>
                        <p>Assentos (total, incl. motorista): {userData.carSeats || '-'}</p>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>

            {isEditing && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">Foto de perfil</p>
                <label className="w-full inline-flex items-center justify-center border border-gray-300 rounded-md px-3 py-2 text-sm cursor-pointer hover:bg-gray-100">
                  Selecionar imagem
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  {selectedPhotoFileName || 'Nenhum arquivo selecionado (maximo 2MB).'}
                </p>
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

      <PhotoCropModal
        open={cropModalOpen}
        imageSrc={cropImageSrc}
        onCancel={() => {
          setCropModalOpen(false);
          setCropImageSrc('');
        }}
        onConfirm={(croppedDataUrl) => {
          if (croppedDataUrl.length > MAX_PHOTO_DATA_URL_LENGTH) {
            showError('Imagem muito grande para salvar no perfil. Escolha uma imagem menor ou reduza o zoom.');
            return;
          }
          setFormData((prev) => ({ ...prev, photo: croppedDataUrl }));
          setCropModalOpen(false);
          setCropImageSrc('');
          showSuccess('Foto ajustada. Salve o perfil para aplicar.');
        }}
      />
    </div>
  );
};


