import { BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-[#F54927] rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold">LibreCO</span>
                  <div className="h-1 w-12 bg-[#F54927] rounded-full mt-1"></div>
                </div>
              </div>
              <p className="text-gray-400">E-Books A la mano</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2 text-gray-400">
                <li><FooterLink href="#inicio">Inicio</FooterLink></li>
                <li><FooterLink href="#destacados">Destacados</FooterLink></li>
                <li><FooterLink href="#catalogo">Catálogo</FooterLink></li>
                <li><FooterLink href="#acerca">Acerca de</FooterLink></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <p className="text-gray-400">info@libreco.com</p>
              <p className="text-gray-400">+57 300000000</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><FooterLink href="#">Términos</FooterLink></li>
                <li><FooterLink href="#">Privacidad</FooterLink></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 LibreCO. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ href, children }) => (
  <a href={href} className="hover:text-white transition-colors duration-200">
    {children}
  </a>
);

export default Footer;