import React, { useState, useEffect } from "react";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_URL;
import { ShoppingCart, TrendingUp } from "lucide-react";

const DemandAnalysis = () => {
    const [demandProducts, setDemandProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDemandData();
    }, []);

    const fetchDemandData = async () => {
        setIsLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("authToken");
            const res = await axios.get(`${BASE_URL}/api/products/analytics/demand`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDemandProducts(res.data);
        } catch (err) {
            console.error("Error fetching demand data:", err);
            setError("Failed to load demand analysis data");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={24} className="text-blue-600" />
                <h1 className="text-2xl md:text-3xl font-bold">Products in Demand</h1>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : demandProducts.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500 text-lg">No demand data available yet.</p>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg p-4 md:p-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cart Adds
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Demand %
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {demandProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {product.imageUrl && (
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img
                                                            className="h-10 w-10 rounded-full object-cover"
                                                            src={product.imageUrl}
                                                            alt={product.title}
                                                        />
                                                    </div>
                                                )}
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {product.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500 line-clamp-1">
                                                        {product.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {product.category}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${product.price.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <ShoppingCart size={16} className="mr-1 text-blue-500" />
                                                {product.cartAdds}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                                    <div
                                                        className="bg-blue-600 h-2.5 rounded-full"
                                                        style={{ width: `${product.demandPercentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">
                                                    {product.demandPercentage.toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-blue-800 mb-2">Demand Analysis Insights</h3>
                        <p className="text-blue-700">
                            This table shows products that are most frequently added to carts, indicating high customer interest.
                            Products with higher demand percentages are more popular among your customers.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DemandAnalysis;