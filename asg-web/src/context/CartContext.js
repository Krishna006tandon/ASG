"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [totalGross, setTotalGross] = useState(0);

  // Load from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('asg_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart");
      }
    }
  }, []);

  // Sync to local storage and calculate totals
  useEffect(() => {
    localStorage.setItem('asg_cart', JSON.stringify(cart));
    
    const total = cart.reduce((sum, item) => {
      let unitPrice = item.price;
      if (item.isPhysicalRequested) {
        unitPrice += (item.physicalPrice || 0) + (item.shippingCost || 0);
      }
      return sum + (unitPrice * item.quantity);
    }, 0);
    setTotalGross(total);
  }, [cart]);

  const addToCart = (product, isPhysical = false) => {
    setCart(prev => {
      const isPhys = Boolean(isPhysical);
      const existing = prev.find(item => item._id === product._id && Boolean(item.isPhysicalRequested) === isPhys);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`You cannot add more than ${product.stock} of this item.`);
          return prev;
        }
        return prev.map(item => 
          (item._id === product._id && Boolean(item.isPhysicalRequested) === isPhys)
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      if (product.stock <= 0) {
        alert("This item is out of stock.");
        return prev;
      }
      return [...prev, { 
        ...product, 
        isPhysicalRequested: isPhys, 
        cartItemId: `${product._id}_${isPhys ? 'physical' : 'digital'}`,
        quantity: 1 
      }];
    });
  };

  const removeFromCart = (idOrCartItemId) => {
    setCart(prev => prev.filter(item => 
      item.cartItemId !== idOrCartItemId && item._id !== idOrCartItemId
    ));
  };

  const updateQuantity = (idOrCartItemId, quantity, isPhysical = null) => {
    if (quantity < 1) return removeFromCart(idOrCartItemId);
    
    setCart(prev => prev.map(item => {
      const matches = item.cartItemId === idOrCartItemId || 
        (item._id === idOrCartItemId && (isPhysical === null || Boolean(item.isPhysicalRequested) === Boolean(isPhysical)));
      
      if (matches) {
        if (quantity > item.stock) {
          alert(`Only ${item.stock} items left in stock!`);
          return { ...item, quantity: item.stock };
        }
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalGross }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
