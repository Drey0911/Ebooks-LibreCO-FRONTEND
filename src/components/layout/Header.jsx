import React, { useState } from 'react';
import { Menu, BookOpen, X, ShoppingCart, User } from 'lucide-react';

// Componente del dropdown del carrito
const CartDropdown = ({ 
  cart, 
  removeFromCart,  
  clearCart, 
  calculateTotal, 
  proceedToCheckout 
}) => (
  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50">
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-900">Carrito de Compras</h3>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-sm text-gray-500 bg-white border border-gray-200 shadow-2xl hover:text-red-700"
          >
            Vaciar
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-8">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Tu carrito está vacío</p>
        </div>
      ) : (
        <>
          <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
            {cart.map((item) => (
              <div key={item._id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                <img 
                  src={item.portada} 
                  alt={item.titulo}
                  className="w-12 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-900 truncate">{item.titulo}</h4>
                  <p className="text-xs text-gray-600">{item.autor}</p>
                  <p className="text-sm font-bold text-[#F54927]">${item.precioFinal.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="text-xl font-bold text-[#F54927]">
                ${calculateTotal().toFixed(2)}
              </span>
            </div>
            <button
              onClick={proceedToCheckout}
              className="w-full px-4 py-3 bg-[#F54927] text-white font-semibold rounded-lg hover:bg-[#e04123] transition-all duration-200"
            >
              Proceder al Pago
            </button>
          </div>
        </>
      )}
    </div>
  </div>
);

const Header = ({ 
  user, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  openModal, 
  handleLogout, 
  showAlert,
  cart,
  removeFromCart,
  updateQuantity,
  clearCart,
  getTotalItems
}) => {
  const [showCartDropdown, setShowCartDropdown] = useState(false);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.precioFinal * item.quantity), 0);
  };

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      showAlert('warning', 'Carrito vacío', 'Agrega libros al carrito antes de comprar');
      return;
    }

    // Disparar evento para abrir el checkout
    window.dispatchEvent(new CustomEvent('openCheckout'));
    setShowCartDropdown(false);
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-12">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F54927] rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="text-white w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl sm:text-2xl font-bold text-gray-900">LibreCO</span>
                <div className="h-1 w-10 bg-[#F54927] rounded-full mt-1"></div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <NavLink href="#inicio">Inicio</NavLink>
              <NavLink href="#destacados">Destacados</NavLink>
              <NavLink href="#catalogo">Catálogo</NavLink>
              <NavLink href="#acerca">Acerca de</NavLink>
              {user && <NavLink href="#biblioteca">Mi Biblioteca</NavLink>}
            </nav>
          </div>

          {/* Desktop Auth & User Section */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <>
                {/* Carrito de compras */}
                <div className="relative">
                  <button 
                    className="p-2 text-gray-700 hover:text-[#F54927] transition-colors duration-200 relative bg-white border border-gray-200 rounded-xl hover:border-[#F54927]"
                    onClick={() => setShowCartDropdown(!showCartDropdown)}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#F54927] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {getTotalItems()}
                      </span>
                    )}
                  </button>
                  {showCartDropdown && (
                    <CartDropdown 
                      cart={cart}
                      removeFromCart={removeFromCart}
                      updateQuantity={updateQuantity}
                      clearCart={clearCart}
                      calculateTotal={calculateTotal}
                      proceedToCheckout={proceedToCheckout}
                    />
                  )}
                </div>

                {/* Información del usuario */}
                <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                  <div className="w-8 h-8 bg-[#F54927] rounded-full flex items-center justify-center shadow-md">
                    <User className="text-white w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-700 font-medium text-sm">
                      {user.nombres} {user.apellidos}
                    </span>
                    <span className="text-xs text-gray-500">Mi cuenta</span>
                  </div>
                </div>
                
                {/* Botón cerrar sesión */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#F54927] rounded-xl hover:bg-[#e04123] transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => openModal('login')}
                  className="px-6 py-2 text-sm font-medium text-white bg-gray-800 rounded-xl hover:bg-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => openModal('register')}
                  className="px-6 py-2 text-sm font-medium text-white bg-[#F54927] rounded-xl hover:bg-[#e04123] transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-2">
            {/* Carrito en móvil */}
            {user && (
              <div className="relative">
                <button 
                  className="p-2 text-gray-700 hover:text-[#F54927] transition-colors duration-200 relative bg-white border border-gray-200 rounded-lg hover:border-[#F54927]"
                  onClick={() => setShowCartDropdown(!showCartDropdown)}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#F54927] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                      {getTotalItems()}
                    </span>
                  )}
                </button>
                {showCartDropdown && (
                  <CartDropdown 
                    cart={cart}
                    removeFromCart={removeFromCart}
                    updateQuantity={updateQuantity}
                    clearCart={clearCart}
                    calculateTotal={calculateTotal}
                    proceedToCheckout={proceedToCheckout}
                  />
                )}
              </div>
            )}
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 bg-white">
            <div className="flex flex-col space-y-0">
              {/* Navigation Links */}
              <MobileNavLink href="#inicio" onClick={() => setMobileMenuOpen(false)}>Inicio</MobileNavLink>
              <MobileNavLink href="#destacados" onClick={() => setMobileMenuOpen(false)}>Destacados</MobileNavLink>
              <MobileNavLink href="#catalogo" onClick={() => setMobileMenuOpen(false)}>Catálogo</MobileNavLink>
              <MobileNavLink href="#acerca" onClick={() => setMobileMenuOpen(false)}>Acerca de</MobileNavLink>
              {user && <MobileNavLink href="#biblioteca" onClick={() => setMobileMenuOpen(false)}>Mi Biblioteca</MobileNavLink>}
              
              {/* User Info in Mobile */}
              {user && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#F54927] rounded-full flex items-center justify-center shadow-md">
                      <User className="text-white w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-700 font-medium text-sm block">
                        {user.nombres} {user.apellidos}
                      </span>
                      <span className="text-xs text-gray-500">Mi cuenta</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Auth Buttons in Mobile */}
              {!user && (
                <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200 px-4">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openModal('login');
                    }}
                    className="w-full px-4 py-3 text-base font-medium text-white bg-gray-800 rounded-xl hover:bg-gray-900 transition-all duration-200"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openModal('register');
                    }}
                    className="w-full px-4 py-3 text-base font-medium text-white bg-[#F54927] rounded-xl hover:bg-[#e04123] transition-all duration-200"
                  >
                    Registrarse
                  </button>
                </div>
              )}

              {/* Logout in Mobile */}
              {user && (
                <div className="pt-3 border-t border-gray-200 px-4">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full px-4 py-3 text-base font-medium text-white bg-[#F54927] rounded-xl hover:bg-[#e04123] transition-all duration-200"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

const NavLink = ({ href, children }) => (
  <a 
    href={href} 
    className="text-gray-700 hover:text-[#F54927] font-medium transition-colors duration-200 relative group whitespace-nowrap py-2"
    onClick={(e) => {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }}
  >
    {children}
    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#F54927] group-hover:w-full transition-all duration-200"></div>
  </a>
);

const MobileNavLink = ({ href, children, onClick }) => (
  <a 
    href={href} 
    className="text-gray-700 hover:text-[#F54927] font-medium transition-colors duration-200 py-4 px-4 border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100"
    onClick={(e) => {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      onClick();
    }}
  >
    {children}
  </a>
);

export default Header;