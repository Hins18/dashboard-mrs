// src/components/YearScroller.tsx
import { useState, useRef, useEffect, useCallback } from 'react';

interface YearScrollerProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const generateYears = (centerYear: number, count = 15) => {
  const half = Math.floor(count / 2);
  return Array.from({ length: count }, (_, i) => centerYear + half - i);
};

export default function YearScroller({ selectedYear, onYearChange }: YearScrollerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [years, setYears] = useState(() => generateYears(selectedYear));
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Logika untuk menambah tahun saat scroll
  const handleScroll = useCallback(() => {
    const list = listRef.current;
    if (!list) return;

    // Jika scroll mendekati bawah (melihat tahun-tahun lama)
    if (list.scrollTop + list.clientHeight >= list.scrollHeight - 20) {
      setYears(prev => {
        const oldestYear = prev[prev.length - 1];
        const newYears = Array.from({ length: 5 }, (_, i) => oldestYear - 1 - i);
        return [...prev, ...newYears];
      });
    }

    // Jika scroll mendekati atas (melihat tahun-tahun baru)
    if (list.scrollTop < 20) {
      setYears(prev => {
        const newestYear = prev[0];
        const newYears = Array.from({ length: 5 }, (_, i) => newestYear + 5 - i);
        // Hapus duplikat dan gabungkan
        const combined = [...newYears, ...prev];
        return [...new Set(combined)].sort((a, b) => b - a);
      });
    }
  }, []);

  // Menutup dropdown saat klik di luar komponen
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);
  
  const handleYearClick = (year: number) => {
    onYearChange(year);
    setIsOpen(false);
  };
  
  // Reset daftar tahun jika selectedYear berubah dari luar
  useEffect(() => {
    setYears(generateYears(selectedYear));
  }, [selectedYear]);

  return (
    <div className="relative w-40" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-md border p-2 bg-white shadow-sm flex justify-between items-center"
      >
        <span>{selectedYear}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {isOpen && (
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto"
          // max-h-48 akan menampilkan sekitar 5 item dan membuatnya bisa di-scroll
        >
          {years.map(year => (
            <div
              key={year}
              onClick={() => handleYearClick(year)}
              className={`p-2 hover:bg-gray-100 cursor-pointer text-center ${year === selectedYear ? 'font-bold bg-gray-100' : ''}`}
            >
              {year}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}