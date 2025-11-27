import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  className = '',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-sans font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-full";

  const variants = {
    primary: "bg-qrave-dark text-black hover:bg-black shadow-lg shadow-stone-300/50",
    secondary: "bg-qrave-accent text-black hover:bg-orange-700 shadow-lg shadow-orange-900/20",
    outline: "border-2 border-qrave-dark text-qrave-dark hover:bg-stone-100",
    ghost: "text-qrave-dark hover:bg-stone-100"
  };

  const sizes = {
    sm: "px-4 py-1.5 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
};
