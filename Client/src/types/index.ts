export interface User {
  id: string;
  username: string;
  email: string;
  profileImage: string;
  bio: string;
  location: string;
  phone: string;
  dateJoined: string;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  seller: {
    _id: string;
    username: string;
    email: string;
  };
  condition: string;
  location: string;
  quantity: number;
  isAvailable: boolean;
  dateCreated: string;
  dateUpdated: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  _id: string;
  user: string;
  products: CartItem[];
  totalAmount: number;
  lastUpdated: string;
}

export interface Purchase {
  _id: string;
  buyer: string;
  seller: {
    _id: string;
    username: string;
    email: string;
  };
  product: {
    _id: string;
    title: string;
    price: number;
    images: string[];
    category: string;
  };
  quantity: number;
  totalAmount: number;
  purchaseDate: string;
  status: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  totalPages?: number;
  currentPage?: number;
  total?: number;
}
