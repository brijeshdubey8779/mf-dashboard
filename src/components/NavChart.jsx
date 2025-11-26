import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const NavChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    // Data is expected to be in reverse chronological order from API usually, but we need chronological for chart
    // API returns [{date: "dd-mm-yyyy", nav: "123.45"}] 
    // so we need to reverse it and parse nav to number for recharts
    const chartData = [...data]
        .reverse()
        .map(item => ({
            date: item.date,
            nav: parseFloat(item.nav)
        }));

    return (
        <div className="h-[300px] w-full bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">NAV History</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        formatter={(value) => [`₹${value}`, 'NAV']}
                    />
                    <Line
                        type="monotone"
                        dataKey="nav"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default NavChart;
