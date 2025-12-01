import { useState } from 'react';
import { CreditCard, Mail, Building, X, ShoppingCart } from 'lucide-react';
import { purchaseService } from '../../services/purchaseService';

const Checkout = ({ showAlert, onClose, cart, setCart }) => {
  const [paymentMethod, setPaymentMethod] = useState('tarjeta');
  const [processing, setProcessing] = useState(false);
  
  // Estados para formularios de pago
  const [cardData, setCardData] = useState({
    numero: '', expiracion: '', cvv: '', nombre: ''
  });
  const [paypalData, setPaypalData] = useState({ email: '' });
  const [transferenciaData, setTransferenciaData] = useState({ referencia: '' });

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.precioFinal * item.quantity), 0);
  };

  const processPurchase = async () => {
    try {
      setProcessing(true);

      if (cart.length === 0) {
        showAlert('error', 'Error', 'El carrito está vacío');
        return;
      }

      // Procesar cada libro del carrito 
      const purchaseResults = [];
      const failedPurchases = [];
      
      for (const item of cart) {
        try {
          const purchaseData = {
            libroId: item._id,
            metodoPago: paymentMethod,
          };

          // Agregar datos de pago según el método
          if (paymentMethod === 'tarjeta') {
            purchaseData.cardData = cardData;
          } else if (paymentMethod === 'paypal') {
            purchaseData.paypalData = paypalData;
          } else if (paymentMethod === 'transferencia') {
            purchaseData.transferenciaData = transferenciaData;
          }

          const result = await purchaseService.createPurchase(purchaseData);
          
          if (result.success) {
            purchaseResults.push({
              libro: item.titulo,
              success: true
            });
          } else {
            failedPurchases.push({
              libro: item.titulo,
              error: result.message || 'Error desconocido'
            });
          }
        } catch (error) {
          // Manejar error específico para este libro
          failedPurchases.push({
            libro: item.titulo,
            error: error.message || 'Error al procesar la compra'
          });
        }
      }

      const successfulPurchases = purchaseResults.filter(result => result.success);
      
      if (successfulPurchases.length > 0) {
        // Limpiar solo los libros que se compraron exitosamente
        const successfulBookIds = successfulPurchases.map(result => 
          cart.find(item => item.titulo === result.libro)?._id
        ).filter(Boolean);
        
        // Remover del carrito solo los libros comprados exitosamente
        setCart(prevCart => prevCart.filter(item => !successfulBookIds.includes(item._id)));
        
        // Guardar carrito actualizado en localStorage
        localStorage.setItem('shoppingCart', JSON.stringify(
          cart.filter(item => !successfulBookIds.includes(item._id))
        ));

        // Mostrar alerta de éxito
        if (failedPurchases.length === 0) {
          showAlert('success', '¡Compra exitosa!', 'Todos los libros han sido añadidos a tu biblioteca');
          onClose();
        } else {
          showAlert(
            'warning', 
            'Compra parcialmente exitosa', 
            `${successfulPurchases.length} libro(s) comprado(s) exitosamente. ${failedPurchases.length} libro(s) no pudieron ser comprados.`
          );
        }
        
        // Disparar evento para actualizar biblioteca
        window.dispatchEvent(new Event('purchaseCompleted'));
      }

      if (failedPurchases.length > 0) {
        const errorMessages = failedPurchases.map(failed => 
          `• ${failed.libro}: ${failed.error}`
        ).join('\n');
        
        if (successfulPurchases.length === 0) {
          // Si todas las compras fallaron
          showAlert('error', 'Error en la compra', `No se pudo completar ninguna compra:\n${errorMessages}`);
        } else {
          // Si algunas compras fallaron, ya mostramos la alerta warning arriba
          console.log('Libros que fallaron:', failedPurchases);
        }
      }

    } catch (error) {
      console.error('Error procesando compra:', error);
      showAlert('error', 'Error', 'No se pudo procesar la compra. Inténtalo de nuevo.');
    } finally {
      setProcessing(false);
    }
  };

  const removeFromCart = (bookId) => {
    setCart(prev => prev.filter(item => item._id !== bookId));
  };

  // Renderizar formulario de pago
  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'tarjeta':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Tarjeta
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardData.numero}
                onChange={(e) => {
                  let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                  if (value.length > 0) {
                    value = value.match(new RegExp('.{1,4}', 'g')).join(' ');
                  }
                  setCardData({...cardData, numero: value});
                }}
                maxLength={19}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F54927] focus:border-transparent outline-none transition-all duration-200 text-black placeholder-gray-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Expiración
                </label>
                <input
                  type="text"
                  placeholder="MM/AA"
                  value={cardData.expiracion}
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^0-9]/g, '');
                    if (value.length >= 2) {
                      value = value.substring(0, 2) + '/' + value.substring(2, 4);
                    }
                    setCardData({...cardData, expiracion: value});
                  }}
                  maxLength={5}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F54927] focus:border-transparent outline-none transition-all duration-200 text-black placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').substring(0, 4);
                    setCardData({...cardData, cvv: value});
                  }}
                  maxLength={4}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F54927] focus:border-transparent outline-none transition-all duration-200 text-black placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre en la Tarjeta
              </label>
              <input
                type="text"
                placeholder="Juan Pérez"
                value={cardData.nombre}
                onChange={(e) => setCardData({...cardData, nombre: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F54927] focus:border-transparent outline-none transition-all duration-200 text-black placeholder-gray-500"
              />
            </div>
          </>
        );

      case 'paypal':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de PayPal
            </label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={paypalData.email}
              onChange={(e) => setPaypalData({...paypalData, email: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F54927] focus:border-transparent outline-none transition-all duration-200 text-black placeholder-gray-500"
            />
            <p className="text-sm text-gray-500 mt-2">
              Serás redirigido a PayPal para completar el pago
            </p>
          </div>
        );

      case 'transferencia':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Referencia
            </label>
            <input
              type="text"
              placeholder="TRF123456789"
              value={transferenciaData.referencia}
              onChange={(e) => setTransferenciaData({...transferenciaData, referencia: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F54927] focus:border-transparent outline-none transition-all duration-200 text-black placeholder-gray-500"
            />
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Datos para transferencia:</h4>
              <p className="text-sm text-gray-600">Banco: Tu Banco</p>
              <p className="text-sm text-gray-600">Cuenta: 1234-5678-9012-3456</p>
              <p className="text-sm text-gray-600">Titular: LibreCO</p>
              <p className="text-sm text-gray-600">Monto: ${calculateTotal().toFixed(2)}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (cart.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Carrito Vacío</h3>
          <p className="text-gray-600 mb-6">No hay libros en el carrito</p>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-[#F54927] text-white font-semibold rounded-lg hover:bg-[#e04123] transition-all"
          >
            Continuar Comprando
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Finalizar Compra</h2>
          <button onClick={onClose} className="text-white hover:text-red-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resumen del carrito */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Pedido</h3>
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img src={item.portada} alt={item.titulo} className="w-16 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.titulo}</h4>
                    <p className="text-sm text-gray-600">{item.autor}</p>
                    <p className="text-lg font-bold text-[#F54927]">${item.precioFinal.toFixed(2)}</p>
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
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span className="text-[#F54927]">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Formulario de pago */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Pago</h3>
            
            {/* Selección de método de pago */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Método de Pago
              </label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('tarjeta')}
                  className={`p-3 border rounded-lg text-center bg-white transition-all ${
                    paymentMethod === 'tarjeta' 
                      ? 'border-[#F54927] bg-red-50' 
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <CreditCard className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="text-xs text-gray-600">Tarjeta</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-3 border rounded-lg text-center bg-white transition-all ${
                    paymentMethod === 'paypal' 
                      ? 'border-[#F54927] bg-red-50' 
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Mail className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="text-xs text-gray-600">PayPal</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setPaymentMethod('transferencia')}
                  className={`p-3 border rounded-lg text-center bg-white transition-all ${
                    paymentMethod === 'transferencia' 
                      ? 'border-[#F54927] bg-red-50' 
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Building className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="text-xs text-gray-600">Transferencia</div>
                </button>
              </div>
            </div>

            {renderPaymentForm()}

            <div className="pt-6">
              <button
                onClick={processPurchase}
                disabled={processing}
                className="w-full px-6 py-4 bg-[#F54927] text-white font-semibold rounded-lg hover:bg-[#e04123] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
              >
                {processing ? 'Procesando...' : `Comprar por $${calculateTotal().toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;