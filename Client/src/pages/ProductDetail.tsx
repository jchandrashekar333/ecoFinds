import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      await axios.post('/cart/add', {
        productId: product?._id,
        quantity
      });
      setMessage('Product added to cart!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const [showBuyNowForm, setShowBuyNowForm] = useState(false);
  const [buyNowForm, setBuyNowForm] = useState({
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    paymentMethod: 'Cash'
  });
  const [buyingNow, setBuyingNow] = useState(false);

  const handleBuyNowFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('shippingAddress.')) {
      const field = name.split('.')[1];
      setBuyNowForm({
        ...buyNowForm,
        shippingAddress: {
          ...buyNowForm.shippingAddress,
          [field]: value
        }
      });
    } else {
      setBuyNowForm({
        ...buyNowForm,
        [name]: value
      });
    }
  };

  const handleBuyNowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuyingNow(true);

    try {
      await axios.post('/purchases/single', {
        productId: product?._id,
        quantity,
        ...buyNowForm
      });
      setMessage('Purchase completed successfully! Redirecting to purchases...');
      setTimeout(() => {
        navigate('/purchases');
      }, 2000);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Purchase failed');
    } finally {
      setBuyingNow(false);
    }
  };

  const buyNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowBuyNowForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === product.seller._id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showBuyNowForm ? (
          // Buy Now Form
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <button
                  onClick={() => setShowBuyNowForm(false)}
                  className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Product
                </button>
                <h2 className="text-2xl font-bold text-gray-900">Buy Now</h2>
                <p className="text-gray-600">Complete your purchase of {product?.title}</p>
              </div>

              <form onSubmit={handleBuyNowSubmit} className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Order Summary</h3>
                  <div className="flex items-center space-x-4">
                    {product?.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                        <span className="text-gray-400 text-2xl">📦</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product?.title}</h4>
                      <p className="text-sm text-gray-600">Quantity: {quantity}</p>
                      <p className="text-lg font-semibold text-primary-600">
                        ${product ? (product.price * quantity).toFixed(2) : '0.00'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="shippingAddress.street"
                        value={buyNowForm.shippingAddress.street}
                        onChange={handleBuyNowFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="123 Main St"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="shippingAddress.city"
                        value={buyNowForm.shippingAddress.city}
                        onChange={handleBuyNowFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        name="shippingAddress.state"
                        value={buyNowForm.shippingAddress.state}
                        onChange={handleBuyNowFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="NY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        name="shippingAddress.zipCode"
                        value={buyNowForm.shippingAddress.zipCode}
                        onChange={handleBuyNowFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="10001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        name="shippingAddress.country"
                        value={buyNowForm.shippingAddress.country}
                        onChange={handleBuyNowFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="United States"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
                  <select
                    name="paymentMethod"
                    value={buyNowForm.paymentMethod}
                    onChange={handleBuyNowFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Cash">Cash on Delivery</option>
                    <option value="Card">Credit/Debit Card</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowBuyNowForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={buyingNow}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
                  >
                    {buyingNow ? 'Processing...' : 'Complete Purchase'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
              {/* Product Images */}
              <div>
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-6xl">📦</span>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {product.title}
                  </h1>
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                      {product.category}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      {product.condition}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-primary-600 mb-4">
                    ${product.price}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Location</h4>
                    <p className="text-gray-900">{product.location}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Quantity Available</h4>
                    <p className="text-gray-900">{product.quantity}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Seller</h4>
                    <p className="text-gray-900">{product.seller.username}</p>
                  </div>
                </div>

                {!isOwner && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <select
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>

                    {message && (
                      <div className={`p-3 rounded-md ${
                        message.includes('added') 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {message}
                      </div>
                    )}

                    <div className="flex space-x-4">
                      <button
                        onClick={addToCart}
                        disabled={addingToCart}
                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md font-medium disabled:opacity-50"
                      >
                        {addingToCart ? 'Adding...' : 'Add to Cart'}
                      </button>
                      <button
                        onClick={buyNow}
                        className="flex-1 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-md font-medium"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                )}

                {isOwner && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-yellow-800">
                      This is your own product. You cannot purchase it.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
