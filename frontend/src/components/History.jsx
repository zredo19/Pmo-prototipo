import { useState, useEffect } from 'react';
import { Clock, FileSpreadsheet, Presentation, ChevronRight, BarChart3 } from 'lucide-react';
import axios from 'axios';
import HistoryDetail from './HistoryDetail';

const API_URL = import.meta.env.DEV ? 'http://localhost:8000' : '';

/**
 * History component showing past analysis records.
 * Supports tabs for Cross-Check and Prioritization history.
 */
export default function History() {
    const [activeTab, setActiveTab] = useState('crosscheck');
    const [crosscheckRecords, setCrosscheckRecords] = useState([]);
    const [priorityRecords, setPriorityRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [crosscheckRes, priorityRes] = await Promise.all([
                axios.get(`${API_URL}/history`),
                axios.get(`${API_URL}/priority-history`)
            ]);
            setCrosscheckRecords(crosscheckRes.data);
            setPriorityRecords(priorityRes.data);
        } catch (err) {
            setError('Error al cargar historial. Asegúrate de que el backend esté corriendo.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-CL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const handleRecordClick = (record, type) => {
        setSelectedRecord({ id: record.id, type });
    };

    const handleCloseDetail = () => {
        setSelectedRecord(null);
    };

    const tabs = [
        { id: 'crosscheck', label: 'Cross-Check', icon: FileSpreadsheet },
        { id: 'priority', label: 'Priorizador', icon: BarChart3 },
    ];

    if (isLoading) {
        return (
            <div className="animate-slide-up">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Historial de Análisis</h2>
                    <p className="text-slate-500 dark:text-slate-400">Ver registros de análisis anteriores</p>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="glass rounded-xl p-6 shimmer h-24 bg-white/50 dark:bg-slate-800/40" />
                    ))}
                </div>
            </div>
        );
    }

    const currentRecords = activeTab === 'crosscheck' ? crosscheckRecords : priorityRecords;

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Historial de Análisis</h2>
                <p className="text-slate-500 dark:text-slate-400">Ver registros de análisis anteriores</p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center gap-2 mb-6">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${isActive
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {error && (
                <div className="p-4 bg-red-100 dark:bg-red-600/10 border border-red-200 dark:border-red-600/30 rounded-xl">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {currentRecords.length === 0 && !error ? (
                <div className="text-center py-16">
                    <div className="p-4 bg-slate-200 dark:bg-slate-700/30 rounded-2xl inline-block mb-4">
                        <Clock className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">Sin Historial Aún</h3>
                    <p className="text-sm text-slate-500 mt-2">
                        {activeTab === 'crosscheck'
                            ? 'Los análisis cross-check aparecerán aquí.'
                            : 'Los análisis del priorizador aparecerán aquí.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {activeTab === 'crosscheck'
                        ? crosscheckRecords.map((record) => (
                            <CrossCheckCard
                                key={record.id}
                                record={record}
                                formatDate={formatDate}
                                onClick={() => handleRecordClick(record, 'crosscheck')}
                            />
                        ))
                        : priorityRecords.map((record) => (
                            <PriorityCard
                                key={record.id}
                                record={record}
                                formatDate={formatDate}
                                onClick={() => handleRecordClick(record, 'priority')}
                            />
                        ))
                    }
                </div>
            )}

            {/* Detail Modal */}
            {selectedRecord && (
                <HistoryDetail
                    type={selectedRecord.type}
                    recordId={selectedRecord.id}
                    onClose={handleCloseDetail}
                />
            )}
        </div>
    );
}


function CrossCheckCard({ record, formatDate, onClick }) {
    return (
        <div
            onClick={onClick}
            className="glass rounded-xl p-6 hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-colors group cursor-pointer bg-white/50 dark:bg-slate-800/40"
        >
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm text-slate-900 dark:text-white truncate max-w-[150px]">
                                {record.excel_filename}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Presentation className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            <span className="text-sm text-slate-900 dark:text-white truncate max-w-[150px]">
                                {record.pptx_filename}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(record.analysis_date)}
                        </span>
                        <span className={`px-2 py-0.5 rounded ${record.status === 'completed'
                            ? 'bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-400'
                            : 'bg-yellow-100 dark:bg-yellow-600/20 text-yellow-700 dark:text-yellow-400'
                            }`}>
                            {record.status === 'completed' ? 'Completado' : record.status}
                        </span>
                    </div>
                    {record.summary && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 line-clamp-2">{record.summary}</p>
                    )}
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex-shrink-0" />
            </div>
        </div>
    );
}


function PriorityCard({ record, formatDate, onClick }) {
    return (
        <div
            onClick={onClick}
            className="glass rounded-xl p-6 hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-colors group cursor-pointer bg-white/50 dark:bg-slate-800/40"
        >
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-primary-600/20 rounded-lg">
                            <BarChart3 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <span className="text-sm font-medium text-slate-900 dark:text-white truncate block max-w-[250px]">
                                {record.filename}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                {record.total_projects} proyectos analizados
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(record.analysis_date)}
                        </span>
                        <span className={`px-2 py-0.5 rounded ${record.status === 'completed'
                            ? 'bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-400'
                            : 'bg-yellow-100 dark:bg-yellow-600/20 text-yellow-700 dark:text-yellow-400'
                            }`}>
                            {record.status === 'completed' ? 'Completado' : record.status}
                        </span>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex-shrink-0" />
            </div>
        </div>
    );
}
