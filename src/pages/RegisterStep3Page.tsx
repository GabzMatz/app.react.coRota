import React, { useState } from 'react';
import AuthCard, { type AuthField } from '../components/AuthCard';
import { useRegister } from '../contexts/RegisterContext';
import { useToast } from '../contexts/ToastContext';
import { addressService, type AddressCreateRequest } from '../services/addressService';
import { userService, type UserRegisterRequest } from '../services/userService';
import { type Company } from '../services/companyService';

interface RegisterStep3PageProps {
  onComplete: () => void;
  onBack: () => void;
}

const RegisterStep3Page: React.FC<RegisterStep3PageProps> = ({ onComplete, onBack }) => {
  const { showError } = useToast();
  const { updateRegisterData, getCompleteData, clearRegisterData } = useRegister();
  const initialFormData = {
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    complemento: ''
  };

  const [fieldValidations, setFieldValidations] = useState<Record<string, { isValid: boolean; message: string }>>({});

  const validateCEP = (cep: string) => {
    const cepRegex = /^\d{5}-?\d{3}$/;
    return cepRegex.test(cep);
  };

  const updateValidations = (data: Record<string, string>) => {
    const newValidations: Record<string, { isValid: boolean; message: string }> = {};

    if (data.cep) {
      if (validateCEP(data.cep)) {
        newValidations.cep = { isValid: true, message: 'CEP válido' };
      } else {
        newValidations.cep = { isValid: false, message: 'CEP inválido' };
      }
    }

    setFieldValidations(newValidations);
  };

  const createAddress = async (addressData: Record<string, string>) => {
    try {
      console.log('🏠 Dados recebidos do formulário:', addressData);
      
      const addressRequest: AddressCreateRequest = {
        street: addressData.rua || '',
        number: addressData.numero || '',
        neighborhood: addressData.bairro || '',
        city: addressData.cidade || '',
        state: addressData.estado || '',
        zipCode: addressData.cep || '',
        lat: "-23.518970",
        long: "-47.458640",
        complement: addressData.complemento || '',
        isActive: true
      };

      console.log('📤 Payload que será enviado para a API:', addressRequest);

      const createdAddress = await addressService.createAddress(addressRequest);
      console.log('✅ Endereço criado com sucesso:', createdAddress);
      
      return createdAddress;
    } catch (error) {
      console.error('❌ Erro ao criar endereço:', error);
      throw error;
    }
  };

  const cleanCPF = (cpf: string): string => {
    return cpf.replace(/\D/g, '');
  };

  const cleanPhone = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    return `+55${cleaned}`;
  };

  const createUser = async (completeData: any, createdAddress: any, selectedCompany: Company | null) => {
    try {
      console.log('👤 Criando usuário na API...');
      console.log('📋 Dados completos:', completeData);
      console.log('🏠 Endereço criado:', createdAddress);
      console.log('🏢 Empresa selecionada:', selectedCompany);

      const fullName = completeData.nomeCompleto || '';
      const nameParts = fullName.split(' ').filter((part: string) => part.trim() !== '');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;

      console.log('👤 Processando nome:', { fullName, firstName, lastName });
      console.log('🧹 Limpando dados:', {
        cpfOriginal: completeData.cpf,
        cpfLimpo: cleanCPF(completeData.cpf || ''),
        telefoneOriginal: completeData.telefone,
        telefoneLimpo: cleanPhone(completeData.telefone || '')
      });

      const vehicleType = completeData.tipoVeiculo === 'motorcycle' ? 'motorcycle' : 'car';
      const typeLabel = vehicleType === 'motorcycle' ? 'Moto' : 'Carro';
      const carInfo = [
        `Tipo: ${typeLabel}`,
        `Marca: ${completeData.marcaCarro || ''}`,
        `Modelo: ${completeData.modeloCarro || ''}`,
        `Placa: ${completeData.placaCarro || ''}`,
        `Cor: ${completeData.corCarro || ''}`
      ].join(' | ');
      const parsedCarSeats = Number(completeData.assentosCarro);

      const userRequest: UserRegisterRequest = {
        corporateEmail: completeData.email || '',
        cpf: cleanCPF(completeData.cpf || ''),
        firstName: firstName,
        lastName: lastName,
        phone: cleanPhone(completeData.telefone || ''),
        password: completeData.senha || '',
        companyId: selectedCompany?.id || '',
        addressId: createdAddress.data.id || '',
        hasCar: completeData.possuiCarro === 'Sim',
        isActive: true,
        carInfo: completeData.possuiCarro === 'Sim' ? carInfo : '',
        carSeats: completeData.possuiCarro === 'Sim' && !Number.isNaN(parsedCarSeats) ? parsedCarSeats : undefined,
        vehicleType: completeData.possuiCarro === 'Sim' ? vehicleType : undefined,
      };

      console.log('📤 Payload do usuário que será enviado para a API:', userRequest);
      console.log('🔗 Usando addressId:', createdAddress.data.id);

      const createdUser = await userService.registerUser(userRequest);
      console.log('✅ Usuário criado com sucesso:', createdUser);
      
      return createdUser;
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      throw error;
    }
  };

  const handleSubmit = async (data: Record<string, string>) => {
    try {
      console.log('📝 Dados do formulário de endereço:', data);
      
      const createdAddress = await createAddress(data);
      
      updateRegisterData('step3', {
        cep: data.cep,
        rua: data.rua,
        numero: data.numero,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        complemento: data.complemento,
        createdAddress: createdAddress
      });
      
      const completeData = getCompleteData();
      console.log('📋 Dados completos do registro:', completeData);
      
      const selectedCompany = completeData.selectedCompany;
      
      if (!selectedCompany) {
        throw new Error('Empresa não selecionada. Por favor, volte ao passo 1 e selecione uma empresa.');
      }
      
      const createdUser = await createUser(completeData, createdAddress, selectedCompany);
      
      updateRegisterData('step3', { createdUser });
      
      clearRegisterData();
      
      onComplete();
    } catch (error) {
      console.error('❌ Erro no processo de registro:', error);
      showError('Erro no processo de registro. Tente novamente.');
    }
  };

  const registerFields: AuthField[] = [
    {
      name: 'cep',
      label: 'CEP',
      type: 'text',
      placeholder: '00000-000',
      required: true
    },
    {
      name: 'rua',
      label: 'Rua',
      type: 'text',
      placeholder: 'Digite o nome da rua',
      required: true
    },
    {
      name: 'numero',
      label: 'Número',
      type: 'text',
      placeholder: '123',
      required: true
    },
    {
      name: 'bairro',
      label: 'Bairro',
      type: 'text',
      placeholder: 'Digite o bairro',
      required: true
    },
    {
      name: 'cidade',
      label: 'Cidade',
      type: 'text',
      placeholder: 'Digite a cidade',
      required: true
    },
    {
      name: 'estado',
      label: 'Estado',
      type: 'text',
      placeholder: 'Digite o estado',
      required: true
    },
    {
      name: 'complemento',
      label: 'Complemento',
      type: 'text',
      placeholder: 'Digite o complemento (opcional)',
      required: false
    }
  ];

  return (
    <AuthCard
      fields={registerFields}
      buttonText="Cadastrar"
      linkText=""
      onSubmit={handleSubmit}
      onLinkClick={() => {}}
      initialData={initialFormData}
      showBackButton={true}
      onBackClick={onBack}
      fieldValidations={fieldValidations}
      onInputChange={updateValidations}
      showLogo={false}
    />
  );
};

export default RegisterStep3Page;
