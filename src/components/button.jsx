import React from "react";

const Button = ({ children, className = "", variant = "default", size = "default", ...props }) => {
  const baseClasses = "font-medium rounded-xl transition-all focus:outline-none focus:ring-4 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none";
  
  const variants = {
    default: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg focus:ring-emerald-300/50",
    outline: "bg-transparent border border-emerald-200 hover:bg-emerald-50 text-emerald-700 focus:ring-emerald-200/50",
    ghost: "bg-transparent hover:bg-slate-100/70 text-slate-700 focus:ring-slate-200/50"
  };
  
  const sizes = {
    sm: "py-1 px-3 text-xs",
    default: "py-2 px-5 text-sm",
    lg: "py-2.5 px-6 text-base",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;