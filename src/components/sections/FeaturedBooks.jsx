import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { bookService } from '../../services/bookService';

const FeaturedBooks = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar libros promocionales al montar el componente
  useEffect(() => {
    loadFeaturedBooks();
  }, []);

  const loadFeaturedBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getPromotionalBooks();
      if (response.success) {
        setFeaturedBooks(response.data.books);
      }
    } catch (error) {
      console.error('Error cargando libros destacados:', error);
    } finally {
      setLoading(false);
    }
  };

const viewBookInCatalog = (book) => {
  console.log('Navegando al catálogo con libro:', book);
  
  // Guardar el libro seleccionado en sessionStorage
  sessionStorage.setItem('selectedBook', JSON.stringify(book));
  console.log('Libro guardado en sessionStorage');
  
  // También guardar en localStorage como backup
  localStorage.setItem('featuredBookNavigation', 'true');
  
  // Navegar a la sección de catálogo
  const catalogSection = document.getElementById('catalogo');
  if (catalogSection) {
    console.log('Encontró sección catálogo, haciendo scroll...');
    catalogSection.scrollIntoView({ behavior: 'smooth' });
    
    // Disparar un evento personalizado para que BookCatalog lo escuche
    window.dispatchEvent(new CustomEvent('bookSelectedFromFeatured', { 
      detail: book 
    }));
    
    // Forzar un pequeño delay y luego recargar el estado
    setTimeout(() => {
      window.dispatchEvent(new Event('forceCatalogUpdate'));
    }, 100);
  }
};

  if (loading) {
    return (
      <section id="destacados" className="py-16 bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Libros <span className="text-[#F54927]">Destacados</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Los títulos más populares de nuestra colección
              </p>
            </div>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F54927] mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando libros destacados...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="destacados" className="py-16 bg-white w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Libros <span className="text-[#F54927]">Destacados</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Los títulos más populares de nuestra colección
            </p>
          </div>

          {featuredBooks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay libros destacados</h3>
              <p className="text-gray-500">Próximamente tendremos nuevas promociones</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredBooks.map((book) => (
                <div 
                  key={book._id} 
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 cursor-pointer"
                >
                  <div className="h-96 relative overflow-hidden flex-shrink-0">
                    <img 
                      src={book.portada} 
                      alt={book.titulo}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {book.promocional === 1 && book.oferta > 0 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        -{book.oferta}%
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 bg-[#F54927] text-white px-2 py-1 rounded-lg text-xs font-semibold">
                      PROMOCIÓN
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-gray-800 mb-2 text-lg line-clamp-2 h-14">{book.titulo}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-1">{book.autor}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-[#F54927]">
                          ${book.precioFinal.toFixed(2)}
                        </span>
                        {book.promocional === 1 && book.oferta > 0 && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ${book.precio.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => viewBookInCatalog(book)}
                        className="px-4 py-2 bg-[#F54927] text-white text-sm rounded-lg hover:bg-[#e04123] transition-colors duration-200 shadow-md"
                      >
                        Ver Catalogo
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedBooks;