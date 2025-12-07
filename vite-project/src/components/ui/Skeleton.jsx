import React from 'react';
import { twMerge } from 'tailwind-merge';

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={twMerge('animate-pulse bg-slate-200 rounded-md', className)}
      {...props}
    />
  );
};

export default Skeleton;
