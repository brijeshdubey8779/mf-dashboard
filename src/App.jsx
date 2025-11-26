import { Routes, Route } from 'react-router-dom';
import Search from './components/Search';
import FundDetails from './pages/FundDetails';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Routes>
        <Route path="/" element={
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-4xl font-bold mb-8 text-center bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Mutual Fund Dashboard
            </h1>
            <p className="text-gray-500 mb-8 text-center max-w-md">
              Search and analyze mutual funds with real-time data and historical performance.
            </p>
            <Search />
          </div>
        } />
        <Route path="/fund/:id" element={<FundDetails />} />
      </Routes>
    </div>
  );
}

export default App;
