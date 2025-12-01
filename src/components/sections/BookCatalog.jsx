import { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, X, ArrowLeft, ChevronLeft, ChevronRight, CreditCard, Mail, Building } from 'lucide-react';
import { bookService } from '../../services/bookService';
import { purchaseService } from '../../services/purchaseService';

const BookCatalog = ({ showAlert, addToCart }) => {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBook, setSelectedBook] = useState(null);
    const [showPurchase, setShowPurchase] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [forceUpdate, setForceUpdate] = useState(0);
    
    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [booksPerPage] = useState(8);

    // Estados para compra
    const [paymentMethod, setPaymentMethod] = useState('tarjeta');
    const [cardData, setCardData] = useState({
        numero: '',
        expiracion: '',
        cvv: '',
        nombre: ''
    });
    const [paypalData, setPaypalData] = useState({
        email: ''
    });
    const [transferenciaData, setTransferenciaData] = useState({
        referencia: ''
    });
    const [processing, setProcessing] = useState(false);

    const checkSelectedBook = () => {
        const savedBook = sessionStorage.getItem('selectedBook');
        if (savedBook) {
            try {
                const book = JSON.parse(savedBook);
                console.log('Libro encontrado en sessionStorage:', book);
                setSelectedBook(book);
                setShowPurchase(false);
                setTimeout(() => {
                    sessionStorage.removeItem('selectedBook');
                }, 1000);
            } catch (error) {
                console.error('Error parsing saved book:', error);
            }
        }
    };

    useEffect(() => {
        const loadBooks = async () => {
            try {
                setLoading(true);
                const response = await bookService.getAllBooks();
                if (response.success) {
                    setBooks(response.data.books);
                    setFilteredBooks(response.data.books);
                    
                    const uniqueCategories = [...new Set(response.data.books.map(book => book.categoria))];
                    setCategories(uniqueCategories);
                    
                    const fromFeatured = localStorage.getItem('featuredBookNavigation');
                    if (fromFeatured === 'true') {
                        checkSelectedBook();
                        localStorage.removeItem('featuredBookNavigation');
                    }
                }
            } catch (error) {
                console.error('Error cargando libros:', error);
            } finally {
                setLoading(false);
            }
        };

        loadBooks();
        checkSelectedBook();
        
        const handleBookSelected = (event) => {
            console.log('Evento bookSelectedFromFeatured recibido:', event.detail);
            setSelectedBook(event.detail);
            setShowPurchase(false);
        };
        
        const handleForceUpdate = () => {
            console.log('Evento forceCatalogUpdate recibido');
            setForceUpdate(prev => prev + 1);
            checkSelectedBook();
        };

        window.addEventListener('bookSelectedFromFeatured', handleBookSelected);
        window.addEventListener('forceCatalogUpdate', handleForceUpdate);
        
        return () => {
            window.removeEventListener('bookSelectedFromFeatured', handleBookSelected);
            window.removeEventListener('forceCatalogUpdate', handleForceUpdate);
        };
    }, []);

    // Efecto para revisar sessionStorage cuando cambia forceUpdate
    useEffect(() => {
        if (forceUpdate > 0) {
            console.log('Force update triggered, checking sessionStorage');
            checkSelectedBook();
        }
    }, [forceUpdate]);

    // Calcular libros para la página actual
    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

    // Cambiar página
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({
            top: document.getElementById('catalogo').offsetTop - 100,
            behavior: 'smooth'
        });
    };

    // Página siguiente
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            window.scrollTo({
                top: document.getElementById('catalogo').offsetTop - 150,
                behavior: 'smooth'
            });
        }
    };

    // Página anterior
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            window.scrollTo({
                top: document.getElementById('catalogo').offsetTop - 100,
                behavior: 'smooth'
            });
        }
    };

    // Filtrar libros por categoría
    const filterByCategory = (category) => {
        setSelectedCategory(category);
        setCurrentPage(1);
        if (category === '') {
            setFilteredBooks(books);
        } else {
            const filtered = books.filter(book => 
                book.categoria.toLowerCase().includes(category.toLowerCase())
            );
            setFilteredBooks(filtered);
        }
    };

    // Buscar libros
    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(1);
        if (term === '') {
            filterByCategory(selectedCategory);
        } else {
            const filtered = books.filter(book =>
                book.titulo.toLowerCase().includes(term.toLowerCase()) ||
                book.autor.toLowerCase().includes(term.toLowerCase()) ||
                book.categoria.toLowerCase().includes(term.toLowerCase()) ||
                book.sinopsis.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredBooks(filtered);
        }
    };

    // Ver detalles del libro
    const viewBookDetails = (book) => {
        setSelectedBook(book);
        setShowPurchase(false);
    };

    // Comprar libro
    const purchaseBook = (book) => {
        setSelectedBook(book);
        setShowPurchase(true);
    };

    // Volver al catálogo
    const backToCatalog = () => {
        setSelectedBook(null);
        setShowPurchase(false);
        setCurrentPage(1);
    };

// Función para procesar compra
const processPurchase = async () => {
    try {
        setProcessing(true);

        // Preparar datos para la compra
        const purchaseData = {
            libroId: selectedBook._id,
            metodoPago: paymentMethod
        };

        // Agregar datos específicos según el método de pago
        if (paymentMethod === 'tarjeta') {
            purchaseData.cardData = {
                numero: cardData.numero.replace(/\s+/g, ''), // Limpiar espacios
                expiracion: cardData.expiracion,
                cvv: cardData.cvv,
                nombre: cardData.nombre
            };
        } else if (paymentMethod === 'paypal') {
            purchaseData.paypalData = {
                email: paypalData.email
            };
        } else if (paymentMethod === 'transferencia') {
            purchaseData.transferenciaData = {
                referencia: transferenciaData.referencia
            };
        }

        console.log('Enviando datos de compra:', purchaseData);

        // Realizar compra
        const response = await purchaseService.createPurchase(purchaseData);

        if (response.success) {
            showAlert('success', '¡Compra exitosa!', 'El libro ha sido añadido a tu biblioteca');
            setShowPurchase(false);
            setSelectedBook(null);
            
            // Limpiar formularios
            setCardData({ numero: '', expiracion: '', cvv: '', nombre: '' });
            setPaypalData({ email: '' });
            setTransferenciaData({ referencia: '' });
            
            // Disparar evento para actualizar biblioteca
            window.dispatchEvent(new Event('purchaseCompleted'));
        } else {
            showAlert('error', 'Error en la compra', response.message || 'No se pudo completar la compra');
        }

    } catch (error) {
        console.error('Error procesando compra:', error);
        showAlert('error', 'Error', error.message || 'No se pudo procesar la compra. Inténtalo de nuevo.');
    } finally {
        setProcessing(false);
    }
};

    // Renderizar formulario según método de pago
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
                            <p className="text-sm text-gray-600">Monto: ${selectedBook?.precioFinal?.toFixed(2)}</p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <section id="catalogo" className="py-16 bg-gray-50 w-full">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F54927] mx-auto"></div>
                            <p className="mt-4 text-gray-600">Cargando catálogo...</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Vista de compra
    if (showPurchase && selectedBook) {
        return (
            <section id="catalogo" className="py-16 bg-gray-50 w-full">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Breadcrumb */}
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
                            <button onClick={backToCatalog} className="hover:text-[#F54927] hover:border-[#F54927] transition-colors text-gray-600 bg-white rounded-lg px-2 py-1 border">
                                Catálogo
                            </button>
                            <span>/</span>
                            <button onClick={() => setShowPurchase(false)} className="hover:text-[#F54927] hover:border-[#F54927] transition-colors text-gray-600 bg-white rounded-lg px-2 py-1 border">
                                {selectedBook.titulo}
                            </button>
                            <span>/</span>
                            <span className="text-[#F54927] font-medium">Comprar</span>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Finalizar Compra</h2>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Información del libro */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Pedido</h3>
                                        <div className="flex space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                            <img 
                                                src={selectedBook.portada} 
                                                alt={selectedBook.titulo}
                                                className="w-20 h-28 object-cover rounded-lg"
                                            />
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{selectedBook.titulo}</h4>
                                                <p className="text-sm text-gray-600">{selectedBook.autor}</p>
                                                <p className="text-lg font-bold text-[#F54927] mt-2">
                                                    ${selectedBook.precioFinal.toFixed(2)}
                                                    {selectedBook.promocional === 1 && selectedBook.oferta > 0 && (
                                                        <span className="text-sm text-gray-500 line-through ml-2">
                                                            ${selectedBook.precio.toFixed(2)}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Formulario de pago */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Pago</h3>
                                        <div className="space-y-4">
                                            {/* Selección de método de pago */}
                                            <div>
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

                                            <div className="pt-4">
                                                <button
                                                    type="button"
                                                    onClick={processPurchase}
                                                    disabled={processing}
                                                    className="w-full px-6 py-4 bg-[#F54927] text-white font-semibold rounded-lg hover:bg-[#e04123] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                                                >
                                                    {processing ? 'Procesando...' : `Comprar por $${selectedBook.precioFinal.toFixed(2)}`}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPurchase(false)}
                                                    disabled={processing}
                                                    className="w-full mt-3 px-6 py-3 text-white font-medium rounded-lg border border-gray-300 hover:bg-grey-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Vista de detalles del libro
    if (selectedBook && !showPurchase) {
        return (
            <section id="catalogo" className="py-16 bg-gray-50 w-full">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Breadcrumb */}
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
                            <button onClick={backToCatalog} className="hover:text-[#F54927] hover:border-[#F54927] transition-colors text-gray-600 bg-white rounded-lg px-2 py-1 border">
                                <ArrowLeft className="w-4 h-4 mr-1 inline" />
                                Catálogo
                            </button>
                            <span>/</span>
                            <span className="text-[#F54927] font-medium">{selectedBook.titulo}</span>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                                {/* Portada e información básica */}
                                <div>
                                    <img 
                                        src={selectedBook.portada} 
                                        alt={selectedBook.titulo}
                                        className="w-full h-96 object-cover rounded-2xl shadow-lg"
                                    />
                                    
                                    {selectedBook.promocional === 1 && selectedBook.oferta > 0 && (
                                        <div className="mt-4 inline-block bg-red-500 text-white px-4 py-2 rounded-full font-semibold text-sm">
                                            {selectedBook.oferta}% DE DESCUENTO
                                        </div>
                                    )}
                                </div>

                                {/* Información detallada */}
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedBook.titulo}</h1>
                                    <p className="text-xl text-gray-600 mb-6">por {selectedBook.autor}</p>
                                    
                                    <div className="mb-6">
                                        <p className="text-gray-700 leading-relaxed">{selectedBook.sinopsis}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <span className="text-sm text-gray-500">Editorial</span>
                                            <p className="font-medium text-black">{selectedBook.editorial}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Páginas</span>
                                            <p className="font-medium text-black">{selectedBook.paginas}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Categoría</span>
                                            <p className="font-medium text-black">{selectedBook.categoria}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Formato</span>
                                            <p className="font-medium text-black">{selectedBook.formato.toUpperCase()}</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <span className="text-3xl font-bold text-[#F54927]">
                                                    ${selectedBook.precioFinal.toFixed(2)}
                                                </span>
                                                {selectedBook.promocional === 1 && selectedBook.oferta > 0 && (
                                                    <span className="text-lg text-gray-500 line-through ml-2">
                                                        ${selectedBook.precio.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <button
                                            onClick={() => addToCart(selectedBook)}
                                            className="w-full px-8 py-4 bg-[#F54927] text-white font-semibold rounded-lg hover:bg-[#e04123] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                            >
                                            Agregar al Carrito
                                        </button>
                                        <button
                                            onClick={() => purchaseBook(selectedBook)}
                                            className="w-full mt-3 px-8 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-all duration-200"
                                            >
                                            Comprar Ahora
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Vista principal del catálogo
    return (
        <section id="catalogo" className="py-16 bg-gray-50 w-full">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Nuestro <span className="text-[#F54927]">Catálogo</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Explora nuestra amplia colección de libros digitales
                        </p>
                    </div>

                    {/* Barra de búsqueda y filtros */}
                    <div className="mb-8 space-y-4">
                        <div className="relative max-w-2xl mx-auto">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar libros, autores, categorías..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F54927] focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-500"
                            />
                        </div>

                        {/* Filtros de categoría */}
                        <div className="flex flex-wrap justify-center gap-2">
                            <button
                                onClick={() => filterByCategory('')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    selectedCategory === '' 
                                        ? 'bg-[#F54927] text-white shadow-md' 
                                        : 'bg-white text-gray-700 border border-gray-300 hover:border-[#F54927]'
                                }`}
                            >
                                Todos
                            </button>
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => filterByCategory(category)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        selectedCategory === category 
                                            ? 'bg-[#F54927] text-white shadow-md' 
                                            : 'bg-white text-gray-700 border border-gray-300 hover:border-[#F54927]'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Información de resultados y paginación superior */}
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-600 text-sm">
                            Mostrando {currentBooks.length} de {filteredBooks.length} libros
                            {selectedCategory && ` en ${selectedCategory}`}
                        </p>
                    </div>

                    {/* Grid de libros */}
                    {currentBooks.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No se encontraron libros</h3>
                            <p className="text-gray-500">Intenta con otros términos de búsqueda o categorías</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                                {currentBooks.map((book) => (
                                    <div 
                                        key={book._id} 
                                        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 cursor-pointer flex flex-col"
                                        onClick={() => viewBookDetails(book)}
                                    >
                                        <div className="h-96 relative overflow-hidden flex-shrink-0">
                                            <img 
                                                src={book.portada} 
                                                alt={book.titulo}
                                                className="w-full h-full object-cover"
                                            />
                                            {book.promocional === 1 && book.oferta > 0 && (
                                                <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                                    -{book.oferta}%
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6 flex flex-col flex-grow">
                                            <h3 className="font-bold text-gray-800 mb-2 text-lg line-clamp-2">{book.titulo}</h3>
                                            <p className="text-sm text-gray-600 mb-3">{book.autor}</p>
                                            <div className="flex items-center justify-between mt-auto">
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
                                                    onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(book);
                                                    }}
                                                    className="px-4 py-2 bg-[#F54927] text-white text-sm rounded-lg hover:bg-[#e04123] transition-colors duration-200 shadow-md"
                                                >
                                                    Agregar al Carrito
                                                </button>
                                                </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Paginación inferior */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center space-x-4 mt-8">
                                    <button
                                        onClick={prevPage}
                                        disabled={currentPage === 1}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none ${
                                            currentPage === 1 
                                                ? 'text-gray-400 cursor-not-allowed bg-white border border-gray-200' 
                                                : 'text-black bg-white border border-gray-200 hover:bg-[#F54927] hover:text-white'
                                        }`}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        <span>Anterior</span>
                                    </button>
                                    
                                    <div className="flex space-x-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                            <button
                                                key={number}
                                                onClick={() => paginate(number)}
                                                className={`w-10 h-10 rounded-lg transition-all duration-200 focus:outline-none ${
                                                    currentPage === number
                                                        ? 'bg-[#F54927] text-white shadow-md'
                                                        : 'bg-white text-black border border-gray-200 hover:bg-[#F54927] hover:text-white'
                                                }`}
                                            >
                                                {number}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <button
                                        onClick={nextPage}
                                        disabled={currentPage === totalPages}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none ${
                                            currentPage === totalPages 
                                                ? 'text-gray-400 cursor-not-allowed bg-white border border-gray-200' 
                                                : 'text-black bg-white border border-gray-200 hover:bg-[#F54927] hover:text-white'
                                        }`}
                                    >
                                        <span>Siguiente</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default BookCatalog;