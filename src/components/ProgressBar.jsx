import React from "react";

const ProgressBar = ({ loading }) => {
  return (
    <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden mt-4"> 
      <div
        className={`h-full bg-green-500 transition-all duration-1000 ease-in-out ${loading ? "animate-pulse w-full" : "w-0"}`}
      ></div>
    </div>
  );
};

export default ProgressBar;
