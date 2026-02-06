import { useState, useEffect } from 'react';
import { X, AlertTriangle, Info, CheckCircle, FileSpreadsheet, Presentation, TrendingUp, Clock, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.DEV ? 'http://localhost:8000' : '';

/**
 * Modal/Panel component displaying detailed analysis results.
 * Supports both cross-check and prioritization history types.
 */
export default function HistoryDetail({ type, recordId, onClose }) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (recordId) {
            fetchDetail();
        }
    }, [recordId, type]);

    const fetchDetail = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const endpoint = type === 'crosscheck'
                ? `${API_URL}/history/${recordId}`
                : `${API_URL}/priority-history/${recordId}`;

            const response = await axios.get(endpoint);
            setData(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al cargar los detalles');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const getSeverityStyles = (severity) => {
        const normalizedSeverity = severity?.toLowerCase() || '';
        if (normalizedSeverity === 'high' || normalizedSeverity === 'alta') {
            return {
                bg: 'bg-red-600/20',
                border: 'border-red-600/30',
                badge: 'bg-red-600 text-white',
                icon: AlertTriangle,
                iconColor: 'text-red-400',
            };
        } else if (normalizedSeverity === 'medium' || normalizedSeverity === 'media') {
            return {
                bg: 'bg-yellow-600/20',
                border: 'border-yellow-600/30',
                badge: 'bg-yellow-600 text-white',
                icon: AlertTriangle,
                iconColor: 'text-yellow-400',
            };
        } else {
            return {
                bg: 'bg-blue-600/20',
                border: 'border-blue-600/30',
                badge: 'bg-blue-600 text-white',
                icon: Info,
                iconColor: 'text-blue-400',
            };
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-red-400';
        if (score >= 60) return 'text-orange-400';
        if (score >= 40) return 'text-yellow-400';
        return 'text-green-400';
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="glass rounded-2xl p-8 max-w-4xl w-full bg-white dark:bg-slate-900 animate-pulse">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-8"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="glass rounded-2xl max-w-4xl w-full my-8 bg-white dark:bg-slate-900 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-500" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {type === 'crosscheck' ? 'Detalle del Análisis' : 'Detalle de Priorización'}
                            </h2>
                            {data && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(data.analysis_date)}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {error ? (
                        <div className="p-4 bg-red-100 dark:bg-red-600/10 border border-red-200 dark:border-red-600/30 rounded-xl">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    ) : type === 'crosscheck' ? (
                        <CrossCheckDetail data={data} getSeverityStyles={getSeverityStyles} />
                    ) : (
                        <PriorityDetail data={data} getScoreColor={getScoreColor} />
                    )}
                </div>
            </div>
        </div>
    );
}


function CrossCheckDetail({ data, getSeverityStyles }) {
    if (!data) return null;

    return (
        <div className="space-y-6">
            {/* File Info */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="glass rounded-xl p-4 bg-white/50 dark:bg-slate-800/40">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-600/20 rounded-lg">
                            <FileSpreadsheet className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Archivo Excel</span>
                    </div>
                    <p className="font-medium text-slate-900 dark:text-white truncate">{data.excel_filename}</p>
                </div>
                <div className="glass rounded-xl p-4 bg-white/50 dark:bg-slate-800/40">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-600/20 rounded-lg">
                            <Presentation className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Archivo PowerPoint</span>
                    </div>
                    <p className="font-medium text-slate-900 dark:text-white truncate">{data.pptx_filename}</p>
                </div>
            </div>

            {/* Summary */}
            {data.summary && (
                <div className="glass rounded-xl p-4 bg-white/50 dark:bg-slate-800/40">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Resumen</h3>
                    <p className="text-slate-900 dark:text-white">{data.summary}</p>
                </div>
            )}

            {/* Discrepancies */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Discrepancias</h3>
                    <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700/50 rounded-full text-sm text-slate-700 dark:text-slate-300">
                        {data.discrepancies?.length || 0} problema(s)
                    </span>
                </div>

                {(!data.discrepancies || data.discrepancies.length === 0) ? (
                    <div className="text-center py-8 glass rounded-xl bg-white/50 dark:bg-slate-800/40">
                        <div className="p-3 bg-green-600/20 rounded-xl inline-block mb-3">
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-green-600 dark:text-green-400 font-medium">¡Sin discrepancias!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {data.discrepancies.map((item, index) => {
                            const styles = getSeverityStyles(item.severity);
                            const IconComponent = styles.icon;

                            return (
                                <div
                                    key={index}
                                    className={`${styles.bg} border ${styles.border} rounded-xl p-4`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg shrink-0">
                                            <IconComponent className={`w-5 h-5 ${styles.iconColor}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <span className={`px-2 py-0.5 ${styles.badge} rounded text-xs font-medium uppercase`}>
                                                    {item.severity}
                                                </span>
                                                <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded text-xs capitalize">
                                                    {item.type}
                                                </span>
                                            </div>
                                            <p className="text-slate-900 dark:text-white font-medium">{item.description}</p>

                                            {(item.excel_value || item.pptx_value) && (
                                                <div className="grid md:grid-cols-2 gap-3 mt-3">
                                                    {item.excel_value && (
                                                        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-3">
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Valor Excel</p>
                                                            <p className="text-sm text-green-600 dark:text-green-400 font-mono">{item.excel_value}</p>
                                                        </div>
                                                    )}
                                                    {item.pptx_value && (
                                                        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-3">
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Valor PowerPoint</p>
                                                            <p className="text-sm text-orange-600 dark:text-orange-400 font-mono">{item.pptx_value}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {item.recommendation && (
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                                                    <span className="text-slate-700 dark:text-slate-500">Recomendación:</span> {item.recommendation}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}


function PriorityDetail({ data, getScoreColor }) {
    if (!data) return null;

    const getTierBadge = (tier, colorHex) => (
        <span
            className="px-2 py-1 rounded-full text-xs font-semibold border"
            style={{
                color: colorHex,
                borderColor: `${colorHex}40`,
                backgroundColor: `${colorHex}10`
            }}
        >
            {tier}
        </span>
    );

    return (
        <div className="space-y-6">
            {/* File Info */}
            <div className="glass rounded-xl p-4 bg-white/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-600/20 rounded-lg">
                        <FileSpreadsheet className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">Archivo Analizado</span>
                </div>
                <p className="font-medium text-slate-900 dark:text-white">{data.filename}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{data.total_projects} proyectos</p>
            </div>

            {/* Results Table */}
            <div className="glass rounded-xl overflow-hidden bg-white/50 dark:bg-slate-800/40">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-500" />
                        Ranking de Proyectos
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                <th className="p-3 font-medium">#</th>
                                <th className="p-3 font-medium">Proyecto</th>
                                <th className="p-3 font-medium text-center">Puntaje</th>
                                <th className="p-3 font-medium text-center">Nivel</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.results?.map((project, index) => (
                                <tr key={project.id || index} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                    <td className="p-3 text-slate-500 font-mono">#{index + 1}</td>
                                    <td className="p-3">
                                        <div className="font-medium text-slate-900 dark:text-white">{project.name}</div>
                                        <div className="text-xs text-slate-500">{project.id} • {project.area}</div>
                                    </td>
                                    <td className={`p-3 text-center font-bold ${getScoreColor(project.score)}`}>
                                        {project.score}
                                    </td>
                                    <td className="p-3 text-center">
                                        {getTierBadge(project.tier, project.tier_color)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
