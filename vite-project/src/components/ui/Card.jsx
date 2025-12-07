import React from 'react';
import { twMerge } from 'tailwind-merge';

const Card = ({ children, className, hoverEffect = true, ...props }) => {
  return (
    <div
      className={twMerge(
        'bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300',
        hoverEffect && 'hover:shadow-md hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
