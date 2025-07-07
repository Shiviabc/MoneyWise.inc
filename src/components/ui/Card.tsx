import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, icon }) => {
  return (
    <div className={`card ${className}`}>
      {(title || icon) && (
        <div className="flex items-center mb-4">
          {icon && <div className="mr-2 text-primary-600">{icon}</div>}
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;