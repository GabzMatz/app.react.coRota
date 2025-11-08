import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...rest }) => {
  return (
    <div
      className={`bg-gray-100 rounded-lg shadow-sm border border-gray-300 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export const CardContent: React.FC<CardProps> = ({ children, className = '', ...rest }) => {
  return (
    <div className={`p-5 ${className}`} {...rest}>
      {children}
    </div>
  );
};
