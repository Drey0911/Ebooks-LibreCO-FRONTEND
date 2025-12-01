// En tu index.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Modal from '../components/layout/Modal';
import Alert from '../components/UI/Alert';
import Hero from '../components/sections/Hero';
import FeaturedBooks from '../components/sections/FeaturedBooks';
import Features from '../components/sections/Features';
import About from '../components/sections/About';
import BookCatalog from '../components/sections/BookCatalog';
import MyBooks from '../components/sections/MyBooks'; 
import Checkout from '../components/sections/Checkout';

function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('login');
  const [alert, setAlert] = useState({ show: false, type: '', title: '', message: '' });
  const [showCheckout, setShowCheckout] = useState(false);

   // Estado inicial lazy para el carrito
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('shoppingCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  
  const {
    user,
    loading,
    error,
    showSuccessAlert,
    setShowSuccessAlert,
    login,
    register,
    handleLogout,
    setError
  } = useAuth();

// Solo guardar en localStorage cuando el carrito cambie
  useEffect(() => {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
  }, [cart]);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
  }, [cart]);

  const showAlert = (type, title, message) => {
    setAlert({ show: true, type, title, message });
  };

  const closeAlert = () => {
    setAlert({ show: false, type: '', title: '', message: '' });
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setError('');
  };

  // Funciones del carrito
  const addToCart = (book) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === book._id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item._id === book._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...book, quantity: 1 }];
      }
    });
    
    showAlert('success', 'Agregado al carrito', `${book.titulo} se ha añadido al carrito`);
  };

  const removeFromCart = (bookId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== bookId));
  };

  const updateQuantity = (bookId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart =>
      prevCart.map(item =>
        item._id === bookId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Manejar apertura del checkout
  useEffect(() => {
    const handleOpenCheckout = () => {
      if (cart.length === 0) {
        showAlert('warning', 'Carrito vacío', 'Agrega libros al carrito antes de comprar');
        return;
      }
      setShowCheckout(true);
    };

    window.addEventListener('openCheckout', handleOpenCheckout);
    return () => window.removeEventListener('openCheckout', handleOpenCheckout);
  }, [cart]);

  return (
    <div className="min-h-screen bg-white w-full max-w-full overflow-x-hidden flex flex-col">
      {/* Alert de éxito para registro */}
      {showSuccessAlert && (
        <Alert 
          type="success"
          title="¡Registro exitoso!"
          message="Confirma tu dirección de correo electrónico para iniciar sesión"
          onClose={() => setShowSuccessAlert(false)}
          autoClose={5000}
        />
      )}

      {/* Alert general */}
      {alert.show && (
        <Alert 
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={closeAlert}
          autoClose={5000}
        />
      )}

      <Header 
        user={user}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        openModal={openModal}
        handleLogout={handleLogout}
        showAlert={showAlert}
        cart={cart}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
        clearCart={clearCart}
        getTotalItems={getTotalItems}
      />

      <main className="flex-grow">
        <Hero />
        {user && <MyBooks showAlert={showAlert} />} 
        <FeaturedBooks />
        <BookCatalog showAlert={showAlert} addToCart={addToCart} />
        <Features />
        <About />
      </main>

      <Footer />

      {showModal && (
        <Modal 
          type={modalType}
          onClose={closeModal}
          onSwitchModal={() => setModalType(modalType === 'login' ? 'register' : 'login')}
          login={login}
          register={register}
          loading={loading}
          error={error}
          setError={setError}
        />
      )}

      {showCheckout && (
        <Checkout 
          showAlert={showAlert}
          onClose={() => setShowCheckout(false)}
          cart={cart}
          setCart={setCart}
        />
      )}
    </div>
  );
}

export default Index;