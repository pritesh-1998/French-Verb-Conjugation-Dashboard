import React from 'react';

interface AccentKeyboardProps {
  onInsert: (char: string) => void;
  className?: string;
}

const ACCENT_CHARS = ['é', 'è', 'ê', 'à', 'â', 'ç', 'î', 'ï', 'ô', 'ù', 'û', 'œ'];

export const AccentKeyboard: React.FC<AccentKeyboardProps> = ({ onInsert, className = '' }) => {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <span className="text-xs font-medium text-stone-600 mr-1 select-none">
        Accents:
      </span>
      {ACCENT_CHARS.map((char) => (
        <button
          key={char}
          type="button"
          onClick={() => onInsert(char)}
          className="h-8 min-w-[2rem] px-2 text-sm font-mono font-medium bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-800 rounded border border-stone-200 transition-colors shadow-xs select-none cursor-pointer"
          title={`Insert ${char}`}
        >
          {char}
        </button>
      ))}
    </div>
  );
};
