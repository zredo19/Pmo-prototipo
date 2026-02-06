import { AlertTriangle, CheckCircle, Info, FileSpreadsheet, Presentation, TrendingUp } from 'lucide-react';

/**
 * Dashboard component displaying analysis results and discrepancies.
 * Shows file info, match score, and detailed discrepancy list.
 */
export default function ResultsDashboard({ results }) {
    if (!results) {
        return (
            <div className="text-center py-16 animate-fade-in">
                <div className="p-4 bg-slate-200 dark:bg-slate-700/30 rounded-2xl inline-block mb-4">
                    <Info className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">Aún sin Resultados</h3>
                <p className="text-sm text-slate-500 mt-2">Sube y analiza archivos para ver discrepancias aquí.</p>
            </div>
        );
    }

    const { discrepancies, summary, match_score, excel_info, pptx_info } = results;

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
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        if (score >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'from-green-600/20 to-green-600/5';
        if (score >= 60) return 'from-yellow-600/20 to-yellow-600/5';
        if (score >= 40) return 'from-orange-600/20 to-orange-600/5';
        return 'from-red-600/20 to-red-600/5';
    };

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Resultados del Análisis</h2>
                <p className="text-slate-500 dark:text-slate-400">{summary}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-4">
                {/* Match Score */}
                <div className={`glass rounded-2xl p-6 bg-gradient-to-br ${getScoreBg(match_score)}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-slate-700/50 rounded-lg">
                            <TrendingUp className={`w-5 h-5 ${getScoreColor(match_score)}`} />
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">Puntaje de Coincidencia</span>
                    </div>
                    <p className={`text-4xl font-bold ${getScoreColor(match_score)}`}>{match_score}%</p>
                </div>

                {/* Excel Info */}
                <div className="glass rounded-2xl p-6 bg-white/50 dark:bg-slate-800/40">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-600/20 rounded-lg">
                            <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">Archivo Excel</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white truncate">{excel_info?.filename}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {excel_info?.sheets} hoja(s) • {excel_info?.total_rows} filas
                    </p>
                </div>

                {/* PPTX Info */}
                <div className="glass rounded-2xl p-6 bg-white/50 dark:bg-slate-800/40">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-600/20 rounded-lg">
                            <Presentation className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">Archivo PowerPoint</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white truncate">{pptx_info?.filename}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{pptx_info?.total_slides} diapositiva(s)</p>
                </div>
            </div>

            {/* Discrepancies List */}
            <div className="glass rounded-2xl p-6 bg-white/50 dark:bg-slate-800/40">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Discrepancias Encontradas</h3>
                    <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700/50 rounded-full text-sm text-slate-700 dark:text-slate-300">
                        {discrepancies.length} problema(s)
                    </span>
                </div>

                {discrepancies.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="p-3 bg-green-600/20 rounded-xl inline-block mb-3">
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-green-600 dark:text-green-400 font-medium">¡No se encontraron discrepancias!</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Los archivos parecen consistentes.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {discrepancies.map((item, index) => {
                            const styles = getSeverityStyles(item.severity);
                            const IconComponent = styles.icon;

                            return (
                                <div
                                    key={index}
                                    className={`${styles.bg} border ${styles.border} rounded-xl p-4 animate-fade-in`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg flex-shrink-0">
                                            <IconComponent className={`w-5 h-5 ${styles.iconColor}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <span className={`px-2 py-0.5 ${styles.badge} rounded text-xs font-medium uppercase`}>
                                                    {item.severity}
                                                </span>
                                                <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded text-xs capitalize">
                                                    {item.type}
                                                </span>
                                            </div>
                                            <p className="text-slate-900 dark:text-white font-medium">{item.description}</p>

                                            {(item.excel_value || item.pptx_value) && (
                                                <div className="grid md:grid-cols-2 gap-4 mt-3">
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
