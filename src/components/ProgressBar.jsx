import React from "react";

const ProgressBar = ({ loading }) => {
  return (
    <div className="w-full bg-emerald-100 h-2.5 rounded-full overflow-hidden mt-4 relative"> 
      {loading ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-300 via-teal-400 to-emerald-500"></div>
          <div className="absolute top-0 bottom-0 left-0 right-0 w-2/3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-progressAnimation"></div>
        </>
      ) : (
        <div className="h-full w-0 bg-emerald-500 transition-all duration-700"></div>
      )}
      <style jsx>{`
        @keyframes progressAnimation {
          0% {
            transform: translateX(-150%);
            width: 50%;
          }
          100% {
            transform: translateX(150%);
            width: 50%;
          }
        }
        @media (prefers-reduced-motion) {
          .animate-progressAnimation {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;