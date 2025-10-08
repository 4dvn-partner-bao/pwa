// src/components/AnimatedTime.jsx
import React from 'react';
import Digit from './Digit';

export default function AnimatedTime({ timeString, className }) {
  // Tách chuỗi thời gian thành một mảng các ký tự
  const timeChars = timeString.split('');

  return (
    <div className={className}>
      {timeChars.map((char, index) => {
        // Dấu hai chấm hoặc các ký tự khác không cần animation
        if (isNaN(parseInt(char, 10))) {
          return <span key={index}>{char}</span>;
        }
        // Các con số sẽ được render bằng component Digit
        return <Digit key={index} char={char} />;
      })}
    </div>
  );
}