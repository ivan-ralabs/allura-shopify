// const CartStorage = {
//   key: 'shoppingCart', // Key for storing cart data

//   // Load cart data (returns an object)
//   load() {
//     const storedData = localStorage.getItem(this.key);
//     return storedData ? JSON.parse(storedData) : { products: [], bundles: [] };
//   },

//   // Save cart data (products and bundles)
//   save(data) {
//     console.log('save');
//     console.log('data:', data);
//     if (!data || typeof data !== 'object') {
//       throw new Error('Data must be an object containing products and bundles.');
//     }
//     localStorage.setItem(this.key, JSON.stringify(data));
//   },

//   // Add a product to the cart
//   addProduct(productId) {
//     const cart = this.load();
//     console.log('cart:', cart);
//     console.log('product id:', productId);
//     if (!cart.products.includes(productId)) {
//       console.log('condition true')
//       cart.products.push(productId);
//       this.save(cart);
//     }
//   },

//   // Remove a product from the cart
//   removeProduct(productId) {
//     const cart = this.load();
//     cart.products = cart.products.filter(id => id !== productId);
//     this.save(cart);
//   },

//   // Add a bundle (type and product ID)
//   addBundle(productType, productId) {
//     const cart = this.load();
//     const bundle = { type: productType, id: productId };

//     // Prevent adding duplicate bundles
//     if (!cart.bundles.some(b => b.type === productType && b.id === productId)) {
//       cart.bundles.push(bundle);
//       this.save(cart);
//     }
//   },

//   // Remove a bundle by type and product ID
//   removeBundle(productType, productId) {
//     const cart = this.load();
//     cart.bundles = cart.bundles.filter(b => !(b.type === productType && b.id === productId));
//     this.save(cart);
//   },

//   // Clear all cart data
//   clear() {
//     localStorage.removeItem(this.key);
//   },

//   // Subscribe to changes (for multi-tab syncing)
//   onChange(callback) {
//     window.addEventListener('storage', (event) => {
//       if (event.key === this.key) {
//         const newData = event.newValue ? JSON.parse(event.newValue) : { products: [], bundles: [] };
//         callback(newData);
//       }
//     });
//   }
// };

// function canAddToCart(item) {
//   // Load the cart data
//   const cart = CartStorage.load();

//   // Check if the input is for a single product (number) or a bundle (array)
//   if (typeof item === 'number') {
//     // Validate single product
//     return !cart.products.includes(item); // True if the product is not already in the cart
//   } else if (Array.isArray(item) && item.length === 2) {
//     const [productType, productId] = item;

//     // Validate bundle
//     if (typeof productType === 'string' && typeof productId === 'number') {
//       return !cart.bundles.some(bundle => bundle.type === productType && bundle.id === productId); // True if the bundle is not in the cart
//     }
//   }

//   // If input is invalid or criteria not met
//   return false;
// }

// // Your JavaScript code for retrieving items from the cart
// function getCartItems() {
//   fetch('/cart.json')
//     .then(response => response.json()) // Get cart data in JSON format
//     .then(data => {
//       console.log('Items in the cart:', data.items); // Log the items in the console
//       return data.items; // Return the list of items
//     })
//     .catch(error => {
//       console.error('Error retrieving items from the cart:', error);
//     });
// }

// // Call the function after the page has loaded
// document.addEventListener('DOMContentLoaded', function() {
//   getCartItems(); // Call the function after the page has loaded
// });