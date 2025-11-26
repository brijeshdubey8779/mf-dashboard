import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { getMutualFundDetails } from '../services/api';
import NavChart from '../components/NavChart';
import jsPDF from 'jspdf';
import { domToPng } from 'modern-screenshot';

const FundDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [fund, setFund] = useState(null);
    const [loading, setLoading] = useState(true);
    const chartRef = useRef(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            const data = await getMutualFundDetails(id);
            setFund(data);
            setLoading(false);
        };
        fetchDetails();
    }, [id]);

    const handleDownloadPDF = async () => {
        if (!fund || !chartRef.current) return;

        const pdf = new jsPDF();

        // Add text details
        pdf.setFontSize(20);
        pdf.text("Mutual Fund Report", 20, 20);

        pdf.setFontSize(14);
        pdf.text(`Scheme Name: ${fund.meta.scheme_name}`, 20, 40);
        pdf.text(`Fund House: ${fund.meta.fund_house}`, 20, 50);
        pdf.text(`Category: ${fund.meta.scheme_category}`, 20, 60);
        pdf.text(`Latest NAV: ₹${fund.data[0].nav}`, 20, 70);

        // Capture chart
        try {
            const imgData = await domToPng(chartRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
            });

            if (imgData) {
                pdf.addImage(imgData, 'PNG', 20, 80, 170, 100);
            }
        } catch (error) {
            console.error("Error generating chart image:", error);
        }

        // Add table of last 10 NAVs
        pdf.text("Last 10 NAV Entries:", 20, 190);
        let y = 200;
        fund.data.slice(0, 10).forEach((entry) => {
            pdf.text(`${entry.date}: ₹${entry.nav}`, 20, y);
            y += 10;
        });

        // Sanitize filename
        const safeFilename = fund.meta.scheme_name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        pdf.save(`${safeFilename}.pdf`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!fund) {
        return <div className="text-center mt-10">Fund not found</div>;
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-7xl">
            <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
            >
                <ArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Back to Search
            </button>

            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div className="flex-1">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 wrap-break-word">
                            {fund.meta.scheme_name}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 wrap-break-word">
                            {fund.meta.fund_house} • {fund.meta.scheme_category}
                        </p>
                    </div>
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap text-sm sm:text-base w-full sm:w-auto"
                    >
                        <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                        Download Report
                    </button>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900">
                        ₹{fund.data[0].nav}
                    </div>
                    <div className="text-xs sm:text-sm text-blue-700 mt-1">
                        Latest NAV ({fund.data[0].date})
                    </div>
                </div>

                <div ref={chartRef} className="mb-6 sm:mb-8 bg-white p-2 sm:p-4 rounded-lg overflow-hidden">
                    <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">
                        NAV History
                    </h2>
                    <div className="w-full overflow-x-auto">
                        <NavChart data={fund.data} />
                    </div>
                </div>

                <div className="overflow-hidden">
                    <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">
                        Recent NAV History
                    </h2>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            NAV
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {fund.data.slice(0, 10).map((entry, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                                                {entry.date}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                ₹{entry.nav}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FundDetails;
