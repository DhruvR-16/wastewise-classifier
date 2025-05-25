import React from "react";

const Button = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl shadow-md transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
