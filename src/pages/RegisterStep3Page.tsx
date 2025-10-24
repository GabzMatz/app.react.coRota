import React, { useState } from 'react';
import AuthCard, { type AuthField } from '../components/AuthCard';
import { useRegister } from '../contexts/RegisterContext';

interface RegisterStep3PageProps {
  onComplete: () => void;
  onBack: () => void;
}

const RegisterStep3Page: React.FC<RegisterStep3PageProps> = ({ onComplete, onBack }) => {
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

  // Função para validar CEP
  const validateCEP = (cep: string) => {
    const cepRegex = /^\d{5}-?\d{3}$/;
    return cepRegex.test(cep);
  };

  // Função para atualizar validações
  const updateValidations = (data: Record<string, string>) => {
    const newValidations: Record<string, { isValid: boolean; message: string }> = {};

    // Validação do CEP
    if (data.cep) {
      if (validateCEP(data.cep)) {
        newValidations.cep = { isValid: true, message: 'CEP válido' };
      } else {
        newValidations.cep = { isValid: false, message: 'CEP inválido' };
      }
    }

    setFieldValidations(newValidations);
  };

  // Função para enviar dados para o backend
  const sendToBackend = async (completeData: any) => {
    try {
      // Aqui você pode implementar a chamada para o backend
      console.log('Enviando dados completos para o backend:', completeData);
      
      // Exemplo de como seria a chamada para o backend:
      /*
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeData),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao cadastrar usuário');
      }
      
      const result = await response.json();
      console.log('Usuário cadastrado com sucesso:', result);
      */
      
      // Por enquanto, apenas simula o sucesso
      console.log('✅ Dados salvos com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao enviar dados para o backend:', error);
      // Aqui você pode implementar tratamento de erro
    }
  };

  const handleSubmit = async (data: Record<string, string>) => {
    console.log('Dados do registro passo 3 (endereço):', data);
    
    // Salvar dados do terceiro passo
    updateRegisterData('step3', {
      cep: data.cep,
      rua: data.rua,
      numero: data.numero,
      bairro: data.bairro,
      cidade: data.cidade,
      estado: data.estado,
      complemento: data.complemento
    });
    
    // Obter todos os dados completos
    const completeData = getCompleteData();
    console.log('📋 Dados completos do registro:', completeData);
    
    // Enviar para o backend
    await sendToBackend(completeData);
    
    // Limpar dados do contexto
    clearRegisterData();
    
    // Finalizar processo
    onComplete();
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
