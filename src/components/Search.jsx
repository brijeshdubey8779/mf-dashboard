import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { searchMutualFunds } from '../services/api';

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 3) {
                setLoading(true);
                const data = await searchMutualFunds(query);
                setResults(data);
                setLoading(false);
                setShowDropdown(true);
            } else {
                setResults([]);
                setShowDropdown(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (schemeCode) => {
        navigate(`/fund/${schemeCode}`);
        setShowDropdown(false);
        setQuery('');
    };

    return (
        <div className="relative w-full max-w-xl mx-auto" ref={dropdownRef}>
            <div className="relative">
                <input
                    type="text"
                    className="w-full p-4 pl-12 text-gray-900 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Search mutual funds (e.g., Axis, SBI)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                {loading && (
                    <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5 animate-spin" />
                )}
            </div>

            {showDropdown && results.length > 0 && (
                <div className="absolute w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-96 overflow-y-auto z-50">
                    {results.map((fund) => (
                        <div
                            key={fund.schemeCode}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                            onClick={() => handleSelect(fund.schemeCode)}
                        >
                            <p className="text-sm font-medium text-gray-800">{fund.schemeName}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Search;
