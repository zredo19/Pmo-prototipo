import { useState } from 'react';
import Navbar from './components/Navbar';
import CrossCheckView from './components/CrossCheckView';
import ResultsDashboard from './components/ResultsDashboard';
import PriorityBatchView from './components/PriorityBatchView';
import History from './components/History';

/**
 * Main application component.
 * Manages navigation state and renders appropriate content.
 */
function App() {
    const [activeTab, setActiveTab] = useState('priority');
    const [theme, setTheme] = useState('dark');
    const [analysisResults, setAnalysisResults] = useState(null);

    // Toggle dark class on html element
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const handleAnalysisComplete = (results) => {
        setAnalysisResults(results);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'priority':
                return <PriorityBatchView />;
            case 'crosscheck':
                return (
                    <div className="space-y-8">
                        <CrossCheckView onAnalysisComplete={handleAnalysisComplete} />
                        {analysisResults && <ResultsDashboard results={analysisResults} />}
                    </div>
                );
            case 'history':
                return <History />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen text-slate-900 dark:text-slate-50 transition-colors duration-300">
            <Navbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                theme={theme}
                toggleTheme={toggleTheme}
            />

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 pt-28 pb-12">
                {renderContent()}
            </main>

            {/* Footer */}
            <footer className="text-center py-6 text-sm text-slate-500">
                <p>© 2024 Aguas Andinas. Agente PMO v1.0.0</p>
            </footer>
        </div>
    );
}

export default App;
