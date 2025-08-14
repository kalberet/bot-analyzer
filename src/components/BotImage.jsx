import React, { useState } from 'react';
import { getBotImageUrl } from '../utils/utils';

const BotImage = ({ botName, className = 'w-12 h-12', onClick }) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const img = getBotImageUrl(botName);

  if (!img || imgError) {
    return (
      <div className={`${className} bg-gray-200 rounded flex items-center justify-center`} onClick={onClick}>
        <span className="text-gray-400 text-[10px]">No img</span>
      </div>
    );
  }
  return (
    <div className={`${className} relative`}>
      {imgLoading && <div className={`${className} absolute inset-0 bg-gray-200 rounded animate-pulse`} />}
      <img
        src={img}
        alt={botName}
        className={`${className} object-cover rounded ${onClick ? 'cursor-pointer' : ''}`}
        onError={() => setImgError(true)}
        onLoad={() => setImgLoading(false)}
        onClick={onClick}
      />
    </div>
  );
};

export default BotImage;