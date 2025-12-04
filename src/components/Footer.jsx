import { Twitter, Facebook, Linkedin, Github, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-16 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <span className="text-2xl font-bold text-mineral-green mb-4 block">OHoldings</span>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                            Un sistema seguro e inteligente que conecta clientes con información confiable y agentes automatizados.
                        </p>
                        <div className="flex space-x-4 mt-6">
                            <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-mineral-green transition-colors" aria-label="Twitter">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-mineral-green transition-colors" aria-label="Facebook">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-mineral-green transition-colors" aria-label="LinkedIn">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-mineral-green transition-colors" aria-label="GitHub">
                                <Github className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Product Section */}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Producto</h3>
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                            <li><a href="#about" className="hover:text-mineral-green transition-colors">Características</a></li>
                            <li><a href="#appointments" className="hover:text-mineral-green transition-colors">Agendar Consulta</a></li>
                            <li><a href="#" className="hover:text-mineral-green transition-colors">Integraciones</a></li>
                            <li><a href="#" className="hover:text-mineral-green transition-colors">Seguridad</a></li>
                        </ul>
                    </div>

                    {/* Company Section */}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Compañía</h3>
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                            <li><a href="#about" className="hover:text-mineral-green transition-colors">Acerca de</a></li>
                            <li><a href="#appointments" className="hover:text-mineral-green transition-colors">Servicios</a></li>
                            <li><a href="#" className="hover:text-mineral-green transition-colors">Contacto</a></li>
                            <li><a href="#" className="hover:text-mineral-green transition-colors">Privacidad</a></li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Contacto</h3>
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-start gap-2">
                                <Mail className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                                <a href="mailto:contacto@oholdings.com" className="hover:text-mineral-green transition-colors">
                                    contacto@oholdings.com
                                </a>
                            </li>
                            <li className="flex items-start gap-2">
                                <Phone className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                                <span>+591 123 456 789</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                                <span>Bolivia</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 md:mb-0">
                        © 2024 OHoldings. Todos los derechos reservados.
                    </p>
                    <div className="flex flex-wrap gap-6 text-sm text-gray-500 dark:text-gray-400">
                        <a href="#" className="hover:text-mineral-green transition-colors">Términos de Servicio</a>
                        <a href="#" className="hover:text-mineral-green transition-colors">Política de Privacidad</a>
                        <a href="#" className="hover:text-mineral-green transition-colors">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
