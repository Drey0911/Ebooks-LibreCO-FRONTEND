import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Download, Search } from 'lucide-react';
import { purchaseService } from '../../services/purchaseService';

const MyBooks = ({ showAlert }) => {
    const [purchases, setPurchases] = useState([]);
    const [filteredPurchases, setFilteredPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadUserPurchases = useCallback(async () => {
        try {
            setLoading(true);
            const response = await purchaseService.getUserPurchases();
            if (response.success) {
                setPurchases(response.data.purchases);
                setFilteredPurchases(response.data.purchases);
            }
        } catch (error) {
            console.error('Error cargando biblioteca:', error);
            showAlert('error', 'Error', 'No se pudieron cargar tus libros');
        } finally {
            setLoading(false);
        }
    }, [showAlert]);

    useEffect(() => {
        loadUserPurchases();
        
        const handlePurchaseCompleted = () => {
            loadUserPurchases();
        };

        window.addEventListener('purchaseCompleted', handlePurchaseCompleted);
        
        return () => {
            window.removeEventListener('purchaseCompleted', handlePurchaseCompleted);
        };
    }, [loadUserPurchases]);

    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        if (term === '') {
            setFilteredPurchases(purchases);
        } else {
            const filtered = purchases.filter(purchase =>
                purchase.libro.titulo.toLowerCase().includes(term.toLowerCase()) ||
                purchase.libro.autor.toLowerCase().includes(term.toLowerCase()) ||
                purchase.libro.categoria.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredPurchases(filtered);
        }
    }, [purchases]);

    const openEbook = useCallback((purchase) => {
        if (purchase.libro.ebook) {
            // Abrir en nueva pestaña
            window.open(purchase.libro.ebook, '_blank', 'noopener,noreferrer');
        }
    }, []);

    const downloadEbook = useCallback(async (purchase) => {
        if (purchase.libro.ebook) {
            try {
                // Crear un enlace temporal para descarga
                const link = document.createElement('a');
                link.href = purchase.libro.ebook;
                link.download = `${purchase.libro.titulo}.${purchase.libro.formato}`;
                link.setAttribute('target', '_blank');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error('Error descargando ebook:', error);
                showAlert('error', 'Error', 'No se pudo descargar el libro');
            }
        }
    }, [showAlert]);

    // Efecto para filtrar cuando cambian las compras
    useEffect(() => {
        if (searchTerm === '') {
            setFilteredPurchases(purchases);
        } else {
            const filtered = purchases.filter(purchase =>
                purchase.libro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                purchase.libro.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                purchase.libro.categoria.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredPurchases(filtered);
        }
    }, [purchases, searchTerm]);

    if (loading) {
        return (
            <section id="biblioteca" className="py-16 bg-gray-50 w-full">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F54927] mx-auto"></div>
                            <p className="mt-4 text-gray-600">Cargando tu biblioteca...</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="biblioteca" className="py-16 bg-gray-50 w-full">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Mi <span className="text-[#F54927]">Biblioteca</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Todos los libros que has adquirido están disponibles aquí
                        </p>
                    </div>

                    {/* Barra de búsqueda */}
                    <div className="mb-8">
                        <div className="relative max-w-2xl mx-auto">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar en tu biblioteca..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F54927] focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-500"
                            />
                        </div>
                    </div>

                    {/* Información de resultados */}
                    {purchases.length > 0 && (
                        <div className="mb-6">
                            <p className="text-gray-600 text-sm text-center">
                                Mostrando {filteredPurchases.length} de {purchases.length} libros
                                {searchTerm && ` para "${searchTerm}"`}
                            </p>
                        </div>
                    )}

                    {/* Grid de libros */}
                    {filteredPurchases.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                {purchases.length === 0 ? 'Tu biblioteca está vacía' : 'No se encontraron libros'}
                            </h3>
                            <p className="text-gray-500">
                                {purchases.length === 0 
                                    ? 'Compra tu primer libro para comenzar tu colección' 
                                    : 'Intenta con otros términos de búsqueda'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredPurchases.map((purchase) => (
                                <div 
                                    key={purchase._id} 
                                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    <div className="h-64 relative overflow-hidden">
                                        <img 
                                            src={purchase.libro.portada} 
                                            alt={purchase.libro.titulo}
                                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/300x400?text=Portada+No+Disponible';
                                            }}
                                        />
                                        <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                                            Adquirido
                                        </div>
                                    </div>
                                    
                                    <div className="p-6">
                                        <h3 className="font-bold text-gray-800 mb-2 text-lg line-clamp-2 hover:text-[#F54927] transition-colors cursor-default">
                                            {purchase.libro.titulo}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-3">{purchase.libro.autor}</p>
                                        <p className="text-xs text-gray-500 mb-4 capitalize">
                                            {purchase.libro.categoria} • {purchase.libro.formato.toUpperCase()}
                                        </p>
                                        
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => openEbook(purchase)}
                                                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-[#F54927] text-white text-sm rounded-lg hover:bg-[#e04123] transition-all duration-200 shadow-md hover:shadow-lg"
                                            >
                                                <BookOpen className="w-4 h-4" />
                                                <span>Leer</span>
                                            </button>
                                            
                                            <button
                                                onClick={() => downloadEbook(purchase)}
                                                className="flex items-center justify-center px-3 py-2 border border-gray-300 text-white text-sm rounded-lg hover:border-[#F54927] hover:text-[#F54927] transition-all duration-200"
                                                title="Descargar"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <p className="text-xs text-gray-500">
                                                Comprado el {new Date(purchase.fechaCompra).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Precio: ${purchase.precioPagado?.toFixed(2) || '0.00'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Mensaje cuando hay búsqueda sin resultados pero hay libros */}
                    {searchTerm && filteredPurchases.length === 0 && purchases.length > 0 && (
                        <div className="text-center mt-8">
                            <button
                                onClick={() => handleSearch('')}
                                className="px-6 py-2 bg-[#F54927] text-white rounded-lg hover:bg-[#e04123] transition-colors duration-200"
                            >
                                Mostrar todos los libros
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default MyBooks;