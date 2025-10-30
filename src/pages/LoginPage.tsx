import React, { useState } from 'react';
import AuthCard, { type AuthField } from '../components/AuthCard';
import { authService, type LoginRequest } from '../services/authService';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onRegisterClick: () => void;
  onForgotPasswordClick: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onRegisterClick, onForgotPasswordClick }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const loginFields: AuthField[] = [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'seu.email@empresa.com',
      required: true
    },
    {
      name: 'senha',
      label: 'Senha',
      type: 'password',
      placeholder: 'Digite sua senha',
      required: true
    }
  ];

  const handleLogin = async (data: Record<string, string>) => {
    setIsLoading(true);
    setError('');

    try {
      const loginData: LoginRequest = {
        corporateEmail: data.email,
        password: data.senha
      };

      console.log('Tentando fazer login:', loginData);
      
      const response = await authService.login(loginData);
      console.log('Login realizado com sucesso:', response);
      if (response && response.id && response.email) {
        localStorage.setItem('authUser', JSON.stringify({ id: response.id, email: response.email }));
      }
      
      // Login bem-sucedido
      onLoginSuccess();
    } catch (error) {
      console.error('Erro no login:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      fields={loginFields}
      buttonText="Entrar"
      linkText="Primeiro acesso>"
      onSubmit={handleLogin}
      onLinkClick={onRegisterClick}
      showLogo={true}
      isLoading={isLoading}
      error={error}
      additionalLinks={[
        {
          text: "Esqueceu a senha>",
          onClick: onForgotPasswordClick
        }
      ]}
    />
  );
};

export default LoginPage;
