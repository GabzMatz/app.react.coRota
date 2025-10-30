import React from 'react';
import logo from '../assets/logo.png';
import panelAuth from '../assets/panel-auth.png';

export interface AuthField {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
  customComponent?: React.ReactNode;
}

export interface AuthCardProps {
  title?: string;
  fields: AuthField[];
  buttonText: string;
  linkText: string;
  onSubmit: (data: Record<string, string>) => void;
  onLinkClick: () => void;
  initialData?: Record<string, string>;
  showBackButton?: boolean;
  onBackClick?: () => void;
  fieldValidations?: Record<string, { isValid: boolean; message: string }>;
  onInputChange?: (data: Record<string, string>) => void;
  showLogo?: boolean;
  additionalLinks?: Array<{
    text: string;
    onClick: () => void;
  }>;
  isLoading?: boolean;
  error?: string;
}

const AuthCard: React.FC<AuthCardProps> = ({
  title,
  fields,
  buttonText,
  linkText,
  onSubmit,
  onLinkClick,
  initialData = {},
  showBackButton = false,
  onBackClick,
  fieldValidations = {},
  onInputChange,
  showLogo = true,
  additionalLinks = [],
  isLoading = false,
  error
}) => {
  const [formData, setFormData] = React.useState<Record<string, string>>(initialData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newData = {
      ...formData,
      [name]: value
    };
    setFormData(newData);
    
    // Se há uma função de validação externa, chama ela
    if (onInputChange) {
      onInputChange(newData);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden"
      style={{
        backgroundImage: `url(${panelAuth})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          {/* Header with back button */}
          {showBackButton && (
            <div className="mb-6">
              <button 
                onClick={onBackClick}
                className="flex items-center gap-2 text-gray-700 font-bold text-lg hover:text-blue-500 transition-colors"
              >
                <span className="text-2xl">←</span> Voltar
              </button>
            </div>
          )}
          
          {/* Logo */}
          {showLogo && (
            <div className="flex justify-center mb-8">
              <img src={logo} alt="Logo" className="w-24 h-24 object-contain" />
            </div>
          )}
          
          {/* Title */}
          {title && (
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">{title}</h2>
          )}
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label htmlFor={field.name} className="block font-bold text-gray-800 text-base">
                  {field.label}:
                </label>
                {field.type === 'checkbox' ? (
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={field.name}
                        value="Sim"
                        checked={formData[field.name] === 'Sim'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-gray-700">Sim</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={field.name}
                        value="Não"
                        checked={formData[field.name] === 'Não'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-gray-700">Não</span>
                    </label>
                  </div>
                ) : field.customComponent ? (
                  <div className="relative">
                    {field.customComponent}
                    {fieldValidations[field.name] && (
                      <span className={`absolute right-0 top-1/2 transform -translate-y-1/2 text-xs font-medium whitespace-nowrap ${
                        fieldValidations[field.name].isValid ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {fieldValidations[field.name].message}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type={field.type}
                      id={field.name}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                      disabled={field.disabled}
                      className={`w-full py-3 border-0 border-b-2 text-base outline-none transition-colors placeholder-gray-400 ${
                        field.disabled 
                          ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-300' 
                          : 'border-gray-300 text-gray-600 focus:border-blue-500 bg-transparent'
                      }`}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                    {fieldValidations[field.name] && (
                      <span className={`absolute right-0 top-1/2 transform -translate-y-1/2 text-xs font-medium whitespace-nowrap ${
                        fieldValidations[field.name].isValid ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {fieldValidations[field.name].message}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full border-0 rounded-3xl py-4 text-lg font-bold cursor-pointer transition-colors active:transform active:translate-y-0.5 mt-8 ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              {isLoading ? 'Entrando...' : buttonText}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <span 
              className="text-gray-700 underline cursor-pointer text-sm transition-colors hover:text-blue-500 block"
              onClick={onLinkClick}
            >
              {linkText}
            </span>
            {additionalLinks.map((link, index) => (
              <span 
                key={index}
                className="text-gray-700 underline cursor-pointer text-sm transition-colors hover:text-blue-500 block"
                onClick={link.onClick}
              >
                {link.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
