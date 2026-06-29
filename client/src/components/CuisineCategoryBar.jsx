import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CUISINES = [
  { id: 'all', name: 'All Departments' },
  { id: 'North Indian', name: 'North Indian' },
  { id: 'Biryani', name: 'Biryani' },
  { id: 'Italian', name: 'Italian' },
  { id: 'Pizza', name: 'Pizza' },
  { id: 'Pasta', name: 'Pasta' },
  { id: 'South Indian', name: 'South Indian' },
  { id: 'Chinese', name: 'Chinese' },
  { id: 'Veg', name: 'Pure Vegetarian' },
  { id: 'Street Food', name: 'Street Food' }
];

const CuisineCategoryBar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeCuisine = searchParams.get('cuisine') || 'all';

  const handleCuisineClick = (cuisineName) => {
    if (cuisineName === 'all') {
      navigate('/restaurants');
    } else {
      navigate(`/restaurants?cuisine=${encodeURIComponent(cuisineName)}`);
    }
  };

  return (
    <div className="bg-amazon-lightDark text-gray-200 border-b border-gray-700 py-2.5 overflow-x-auto no-scrollbar shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center space-x-4 whitespace-nowrap">
        {CUISINES.map((c) => {
          const isActive = activeCuisine === c.id;
          return (
            <button
              key={c.id}
              onClick={() => handleCuisineClick(c.id)}
              className={`text-xs sm:text-sm px-3.5 py-1 rounded-full font-semibold border transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'bg-amazon-orange border-amazon-orange text-amazon-dark'
                  : 'bg-[#2a3746] border-[#3f4f60] text-gray-200 hover:bg-[#344456] hover:text-white'
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CuisineCategoryBar;
