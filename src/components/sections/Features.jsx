import { BookOpen, User, Shield } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Amplia Colección',
      description: 'Miles de libros de todos los géneros literarios, categorias y autores disponibles'
    },
    {
      icon: User,
      title: 'Acceso Ilimitado',
      description: 'Lee donde y cuando quieras sin restricciones y con la mejor calidad posible'
    },
    {
      icon: Shield,
      title: 'Plataforma Segura',
      description: 'Tus datos y compras siempre estaran protegidas'
    }
  ];

  return (
    <section className="py-16 bg-white-50 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-[#F54927] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;