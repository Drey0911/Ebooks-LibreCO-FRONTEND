import { BookOpen } from 'lucide-react';

const About = () => {
  return (
    <section id="acerca" className="py-12 md:py-16 bg-white w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl md:rounded-3xl shadow-lg md:shadow-xl p-6 md:p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Text Content */}
              <div className="text-center lg:text-left">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
                  Acerca de <span className="text-[#F54927]">LibreCO</span>
                </h2>
                <div className="space-y-3 md:space-y-4 text-gray-600">
                  <p className="text-base md:text-lg leading-relaxed">
                    Somos una plataforma innovadora dedicada a conectar a los amantes de la lectura 
                    con miles de libros digitales de todos los géneros literarios.
                  </p>
                  <p className="text-base leading-relaxed">
                    Nuestra misión es hacer que la lectura sea accesible para todos, en cualquier 
                    momento y lugar, eliminando las barreras físicas y geográficas.
                  </p>
                </div>
                <div className="mt-6 md:mt-8 flex items-center justify-center lg:justify-start space-x-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-[#F54927] rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl font-bold text-gray-900">10,000+</div>
                    <div className="text-sm md:text-base text-gray-600">Libros disponibles</div>
                  </div>
                </div>
              </div>
              
              {/* Graphic Section */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 bg-gradient-to-br from-[#F54927] to-orange-500 rounded-xl md:rounded-2xl shadow-lg md:shadow-2xl flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 lg:p-8 shadow-md w-full max-w-[90%]">
                      <div className="text-center">
                        <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-[#F54927] mx-auto mb-3 md:mb-4" />
                        <div className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1 md:mb-2">LibreCO</div>
                        <div className="text-sm md:text-base text-gray-600">E-Books A la mano</div>
                      </div>
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
};

export default About;