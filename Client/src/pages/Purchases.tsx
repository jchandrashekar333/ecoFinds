import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Purchase } from '../types';

const Purchases: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/purchases');
      setPurchases(response.data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Purchases</h1>
          <p className="text-gray-600 mt-2">View your purchase history and order details</p>
        </div>

        {purchases.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No purchases yet</h3>
            <p className="text-gray-600 mb-6">Start shopping to see your purchases here</p>
            <Link
              to="/products"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md font-medium"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {purchases.map((purchase) => (
              <div key={purchase._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {purchase.product.images && purchase.product.images.length > 0 ? (
                          <img
                            src={purchase.product.images[0]}
                            alt={purchase.product.title}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                            <span className="text-gray-400 text-2xl">📦</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {purchase.product.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Sold by {purchase.seller.username}
                        </p>
                        <p className="text-sm text-gray-500">
                          {purchase.product.category} • Qty: {purchase.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ${purchase.totalAmount.toFixed(2)}
                      </p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                        {purchase.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Purchase Date</h4>
                      <p className="text-gray-600">
                        {new Date(purchase.purchaseDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Payment Method</h4>
                      <p className="text-gray-600">{purchase.paymentMethod}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Shipping Address</h4>
                      <p className="text-gray-600">
                        {purchase.shippingAddress.street}<br />
                        {purchase.shippingAddress.city}, {purchase.shippingAddress.state} {purchase.shippingAddress.zipCode}<br />
                        {purchase.shippingAddress.country}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Order ID</h4>
                      <p className="text-gray-600 font-mono text-xs">
                        {purchase._id}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-4">
                        <Link
                          to={`/product/${purchase.product._id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          View Product
                        </Link>
                        <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                          Contact Seller
                        </button>
                      </div>
                      {purchase.status === 'Pending' && (
                        <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Purchases;
