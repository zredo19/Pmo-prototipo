import { Droplets, Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

/**
 * Navigation bar component with responsive mobile menu.
 * Displays branding and navigation links.
 */
export default function Navbar({ activeTab, setActiveTab, theme, toggleTheme }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { id: 'priority', label: 'Priorizador' },
        { id: 'crosscheck', label: 'Validación Cruzada' },
        { id: 'history', label: 'Historial' },
    ];

    const handleNavClick = (tabId) => {
        setActiveTab(tabId);
        setMobileMenuOpen(false);
    };

    return (
        <nav className="glass fixed top-4 left-4 right-4 z-50 rounded-2xl px-6 py-4 transition-colors duration-300">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo & Brand */}
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-600 rounded-xl">
                        <Droplets className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-semibold text-slate-800 dark:text-white">Aguas Andinas</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Agente PMO</span>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${activeTab === item.id
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-slate-600 dark:text-slate-300"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50 animate-fade-in">
                    <div className="flex flex-col gap-2">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all duration-200 cursor-pointer ${activeTab === item.id
                                    ? 'bg-primary-600 text-white'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}
