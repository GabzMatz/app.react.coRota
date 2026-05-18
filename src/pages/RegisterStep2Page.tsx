import React, { useState } from 'react';
import AuthCard, { type AuthField } from '../components/AuthCard';
import { useRegister } from '../contexts/RegisterContext';
import {
  formatLicensePlateInput,
  isValidBrazilianLicensePlate,
  licensePlateValidationMessage,
} from '../utils/licensePlate';

interface RegisterStep2PageProps {
  onNext: () => void;
  onBack: () => void;
}

const RegisterStep2Page: React.FC<RegisterStep2PageProps> = ({ onNext, onBack }) => {
  const { updateRegisterData } = useRegister();
  const initialFormData = {
    nomeCompleto: '',
    telefone: '',
    possuiCarro: '',
    tipoVeiculo: 'car',
    marcaCarro: '',
    modeloCarro: '',
    placaCarro: '',
    corCarro: '',
    assentosCarro: '',
    nomeUsuario: '',
    senha: '',
    confirmarSenha: ''
  };

  const [fieldValidations, setFieldValidations] = useState<Record<string, { isValid: boolean; message: string }>>({});

  const updateValidations = (data: Record<string, string>) => {
    const newValidations: Record<string, { isValid: boolean; message: string }> = {};

    if (data.nomeUsuario) {
      if (data.nomeUsuario.length >= 3) {
        newValidations.nomeUsuario = { isValid: true, message: 'disponível' };
      } else {
        newValidations.nomeUsuario = { isValid: false, message: 'mínimo 3 caracteres' };
      }
    }

    if (data.senha && data.confirmarSenha) {
      const isValid = data.senha === data.confirmarSenha && data.confirmarSenha.length > 0;
      newValidations.confirmarSenha = { 
        isValid, 
        message: isValid ? 'as senhas são iguais' : 'as senhas não coincidem' 
      };
    }

    if (data.possuiCarro === 'Sim' && data.placaCarro) {
      const plateValid = isValidBrazilianLicensePlate(data.placaCarro);
      newValidations.placaCarro = {
        isValid: plateValid,
        message: plateValid ? 'placa válida' : licensePlateValidationMessage,
      };
    }

    setFieldValidations(newValidations);
  };

  const handleInputChangeWithCarLogic = (data: Record<string, string>) => {
    if (data.placaCarro) {
      data.placaCarro = formatLicensePlateInput(data.placaCarro);
    }

    if (data.possuiCarro === 'Não') {
      data.marcaCarro = '';
      data.modeloCarro = '';
      data.placaCarro = '';
      data.corCarro = '';
      data.assentosCarro = '';
    }
    
    updateValidations(data);
  };

  const handleSubmit = (data: Record<string, string>) => {
    const payload: Record<string, string> = { ...data, tipoVeiculo: vehicleType };

    if (payload.possuiCarro === 'Sim') {
      if (!isValidBrazilianLicensePlate(payload.placaCarro || '')) {
        setFieldValidations((prev) => ({
          ...prev,
          placaCarro: { isValid: false, message: licensePlateValidationMessage },
        }));
        return;
      }
    }

    console.log('Dados do registro passo 2:', payload);
    updateRegisterData('step2', {
      nomeCompleto: payload.nomeCompleto,
      telefone: payload.telefone,
      possuiCarro: payload.possuiCarro,
      tipoVeiculo: payload.tipoVeiculo || 'car',
      marcaCarro: payload.marcaCarro,
      modeloCarro: payload.modeloCarro,
      placaCarro: payload.placaCarro,
      corCarro: payload.corCarro,
      assentosCarro: payload.assentosCarro,
      nomeUsuario: payload.nomeUsuario,
      senha: payload.senha,
      confirmarSenha: payload.confirmarSenha
    });
    onNext();
  };

  const [isCarDataDisabled, setIsCarDataDisabled] = useState(false);
  const [vehicleType, setVehicleType] = useState('car');

  const updateFieldsBasedOnCar = (data: Record<string, string>) => {
    const hasCar = data.possuiCarro === 'Sim';
    setIsCarDataDisabled(!hasCar);
    
    if (!hasCar) {
      data.marcaCarro = '';
      data.modeloCarro = '';
      data.placaCarro = '';
      data.corCarro = '';
      data.assentosCarro = '';
    }
    
    handleInputChangeWithCarLogic(data);
  };

  const registerFields: AuthField[] = [
    {
      name: 'nomeCompleto',
      label: 'Nome completo',
      type: 'text',
      placeholder: 'Digite seu nome completo',
      required: true
    },
    {
      name: 'telefone',
      label: 'Telefone',
      type: 'tel',
      placeholder: '(00) 00000-0000',
      required: true
    },
    {
      name: 'possuiCarro',
      label: 'Possuí Carro?',
      type: 'checkbox',
      placeholder: '',
      required: true
    },
    {
      name: 'marcaCarro',
      label: 'Marca do veículo',
      type: 'text',
      placeholder: isCarDataDisabled ? 'Campo desabilitado' : 'Ex: Chevrolet',
      required: false,
      disabled: isCarDataDisabled
    },
    {
      name: 'modeloCarro',
      label: 'Modelo do veículo',
      type: 'text',
      placeholder: isCarDataDisabled ? 'Campo desabilitado' : 'Ex: Onix',
      required: false,
      disabled: isCarDataDisabled
    },
    {
      name: 'placaCarro',
      label: 'Placa do veículo',
      type: 'text',
      placeholder: isCarDataDisabled ? 'Campo desabilitado' : 'Ex: ABC1D23',
      required: false,
      disabled: isCarDataDisabled
    },
    {
      name: 'corCarro',
      label: 'Cor do veículo',
      type: 'text',
      placeholder: isCarDataDisabled ? 'Campo desabilitado' : 'Ex: Prata',
      required: false,
      disabled: isCarDataDisabled
    },
    {
      name: 'assentosCarro',
      label: 'Quantidade total de lugares (inclui motorista)',
      type: 'number',
      placeholder: isCarDataDisabled ? 'Campo desabilitado' : 'Ex: 5',
      required: false,
      disabled: isCarDataDisabled
    },
    {
      name: 'nomeUsuario',
      label: 'Nome de usuário',
      type: 'text',
      placeholder: '@seunome',
      required: true
    },
    {
      name: 'senha',
      label: 'Criar senha',
      type: 'password',
      placeholder: 'Digite sua senha',
      required: true
    },
    {
      name: 'confirmarSenha',
      label: 'Confirmar senha',
      type: 'password',
      placeholder: 'Confirme sua senha',
      required: true
    }
  ];

  return (
    <>
      {!isCarDataDisabled && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-5 pointer-events-none">
          <div className="bg-white/95 rounded-xl p-3 shadow pointer-events-auto">
            <label className="text-sm font-medium text-gray-700 block mb-1">Tipo de veículo</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="car">Carro</option>
              <option value="motorcycle">Moto</option>
            </select>
          </div>
        </div>
      )}
    <AuthCard
      fields={registerFields}
      buttonText="Próximo"
      linkText=""
      onSubmit={handleSubmit}
      onLinkClick={() => {}}
      initialData={initialFormData}
      showBackButton={true}
      onBackClick={onBack}
      fieldValidations={fieldValidations}
      onInputChange={updateFieldsBasedOnCar}
      showLogo={false}
    />
    </>
  );
};

export default RegisterStep2Page;
