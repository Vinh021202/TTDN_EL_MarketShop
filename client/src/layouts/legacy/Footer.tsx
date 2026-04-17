import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// FOOTER COMPONENT
// ═══════════════════════════════════════════════════════════════

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto border-t border-white/10 bg-gray-900/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-3xl">🛒</span>
                            <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-orange bg-clip-text text-transparent">
                                Food Market
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-4">
                            AI-powered food shopping platform với Recipe Intelligence và Smart Chatbot.
                        </p>
                        <div className="flex gap-3">
                            <a
                                href="#"
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/products" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Products
                                </Link>
                            </li>
                            <li>
                                <Link to="/recipes" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Recipes
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Customer Service</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link to="/shipping" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Shipping Info
                                </Link>
                            </li>
                            <li>
                                <Link to="/returns" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Returns
                                </Link>
                            </li>
                            <li>
                                <Link to="/track-order" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Track Order
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Cookie Policy
                                </Link>
                            </li>
                        </ul>

                        <div className="mt-6">
                            <h4 className="text-white text-sm font-medium mb-2">Newsletter</h4>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-primary-500"
                                />
                                <button className="p-2 bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors">
                                    <Mail className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-400 text-sm">
                    <p>© {currentYear} Food Market. All rights reserved. Built with ❤️ using React & AI.</p>
                </div>
            </div>
        </footer>
    );
};
