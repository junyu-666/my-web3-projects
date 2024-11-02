import React from 'react';
import './HorizontalScrollList.css'; // 引入样式文件

const HorizontalScrollList = ({ activePhase }) => {
  const items = Array.from({ length: 11 }, (_, index) => `Item ${index + 1}`);

  return (
    <div className="horizontal-scroll-container">
      {items.map((_, index) => (
        <div className={`scroll-item ${activePhase === index && index != 10 ? 'blue-background' : ''}  ${index === 10 ? 'red-bg' : ''}`} key={index}>
          <div style={{color: index === 10 ? 'red' : 'white', fontWeight: 'bold', fontSize: 'smaller'}}>
            {index === 10 ? 'Phase 0' : `Phase ${index + 1}`}
            </div>
          <div style={{color: index === 10 ? 'red' : 'white', fontSize: 'smaller'}}>
            {index === 10 ? 'Mint end' : `Multiplier X${10 - index}`}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HorizontalScrollList; 