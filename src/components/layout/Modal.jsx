import { useState } from 'react';
import { X, BookOpen } from 'lucide-react';

const Modal = ({ 
  type, 
  onClose, 
  onSwitchModal, 
  login, 
  register, 
  loading, 
  error, 
  setError 
}) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    password: ''
  });

  const isLogin = type === 'login';

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = isLogin 
      ? await login(formData.email, formData.password)
      : await register(formData);

    if (result.success) {
      onClose();
      setFormData({
        nombres: '',
        apellidos: '',
        email: '',
        telefono: '',
        password: ''
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-[#F54927] rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black">
                {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
              </h2>
              <p className="text-gray-600 text-sm">
                {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta gratis'}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombres
                    </label>
                    <input
                      type="text"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F54927] focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm"
                      placeholder="Nombres"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellidos
                    </label>
                    <input
                      type="text"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F54927] focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm"
                      placeholder="Apellidos"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F54927] focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm"
                    placeholder="Teléfono"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F54927] focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F54927] focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#F54927] text-white font-semibold rounded-xl hover:bg-[#e04123] transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onSwitchModal}
              className="text-sm font-medium text-gray-700 hover:text-[#F54927] transition-colors duration-200 p-0 m-0 bg-transparent border-none shadow-none"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;