import React from "react";

const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white p-6 rounded-2xl shadow-xl border border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
