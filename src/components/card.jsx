import React from "react";

const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-emerald-100 ${className}`}>
      {children}
    </div>
  );
};

export default Card;