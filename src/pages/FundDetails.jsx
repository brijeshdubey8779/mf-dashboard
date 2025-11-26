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
        <div className="max-w-4xl mx-auto p-6">
            <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Search
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{fund.meta.scheme_name}</h1>
                        <p className="text-gray-500">{fund.meta.fund_house} • {fund.meta.scheme_category}</p>
                    </div>
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                    </button>
                </div>

                <div className="mb-8">
                    <div className="text-3xl font-bold text-gray-900">₹{fund.data[0].nav}</div>
                    <div className="text-sm text-gray-500">Latest NAV ({fund.data[0].date})</div>
                </div>

                <div ref={chartRef} className="mb-8">
                    <NavChart data={fund.data.slice(0, 10)} />
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent NAV History</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="py-3 text-sm font-medium text-gray-500">Date</th>
                                    <th className="py-3 text-sm font-medium text-gray-500">NAV</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fund.data.slice(0, 10).map((entry) => (
                                    <tr key={entry.date} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                        <td className="py-3 text-gray-900">{entry.date}</td>
                                        <td className="py-3 text-gray-900">₹{entry.nav}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FundDetails;
