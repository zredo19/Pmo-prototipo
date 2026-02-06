import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, Download, Loader2, AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:8000";

export default function PriorityBatchView() {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    }, []);

    const handleFileSelect = (e) => {
        const selectedFile = e.target?.files?.[0];
        validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (selectedFile) => {
        if (!selectedFile) return;
        const extension = selectedFile.name.split('.').pop().toLowerCase();
        if (extension === 'xlsx' || extension === 'xls') {
            setFile(selectedFile);
            setError(null);
        } else {
            setError("Tipo de archivo no soportado. Por favor sube un archivo Excel válido (.xlsx)");
        }
    };

    const handleProcess = async () => {
        if (!file) return;

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post(`${API_URL}/prioritize/batch`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setResults(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || "Falló el procesamiento. Por favor intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return "text-red-400";
        if (score >= 60) return "text-orange-400";
        if (score >= 40) return "text-yellow-400";
        return "text-green-400";
    };

    const getTierBadge = (tier, colorHex) => {
        // Map hex to tailwind classes roughly or use inline styles for dynamic colors
        return (
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
    };

    return (
        <div className="space-y-8 animate-slide-up">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Análisis de Prioridad por Lotes</h2>
                <p className="text-slate-500 dark:text-slate-400">Sube tu Excel de Portafolio para calcular prioridades de todos los proyectos al instante.</p>
            </div>

            {/* Upload Area */}
            <div className="max-w-xl mx-auto">
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`drop-zone rounded-2xl p-8 text-center transition-all bg-white/50 dark:bg-slate-800/40 border-2 border-dashed ${isDragging ? "border-primary-500 bg-primary-500/10" : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500"
                        }`}
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-3 bg-green-600/20 rounded-xl">
                            <FileSpreadsheet className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        {file ? (
                            <div className="text-slate-900 dark:text-white">
                                <p className="font-medium">{file.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                                <button
                                    onClick={() => setFile(null)}
                                    className="text-xs text-red-500 hover:underline mt-2"
                                >
                                    Eliminar
                                </button>
                            </div>
                        ) : (
                            <div>
                                <p className="text-lg font-medium text-slate-900 dark:text-white mb-1">Arrastra el archivo Excel aquí</p>
                                <label className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 cursor-pointer">
                                    o haz clic para buscar
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mt-4 flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-900/50">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                <button
                    onClick={handleProcess}
                    disabled={!file || isLoading}
                    className={`mt-6 w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${!file || isLoading
                        ? "bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-50"
                        : "bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/25"
                        }`}
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                    {isLoading ? "Procesando Estrategia..." : "Calcular Prioridades"}
                </button>
            </div>

            {/* Results Table */}
            {results && (
                <div className="glass rounded-2xl overflow-hidden mt-12 animate-fade-in bg-white/50 dark:bg-slate-800/40">
                    <div className="p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Ranking de Proyectos</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{results.total_projects} proyectos analizados</p>
                        </div>
                        {/* Placeholder for export functionality */}
                        <button className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-black/20">
                                    <th className="p-4 font-medium">Rango</th>
                                    <th className="p-4 font-medium">Proyecto</th>
                                    <th className="p-4 font-medium">Sponsor</th>
                                    <th className="p-4 font-medium text-center">ROI</th>
                                    <th className="p-4 font-medium text-center">Urgencia</th>
                                    <th className="p-4 font-medium text-center">Puntaje</th>
                                    <th className="p-4 font-medium text-center">Nivel</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.results.map((project, index) => (
                                    <tr key={project.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-slate-500 font-mono">#{index + 1}</td>
                                        <td className="p-4">
                                            <div className="font-medium text-slate-900 dark:text-white">{project.name}</div>
                                            <div className="text-xs text-slate-500">{project.id} • {project.area}</div>
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-300 text-sm">{project.sponsor}</td>
                                        <td className="p-4 text-center text-slate-600 dark:text-slate-300">{project.breakdown.roi.value.toFixed(0)}</td>
                                        <td className="p-4 text-center text-slate-600 dark:text-slate-300">{project.breakdown.urgency.value.toFixed(0)}</td>
                                        <td className={`p-4 text-center font-bold text-lg ${getScoreColor(project.score)}`}>
                                            {project.score}
                                        </td>
                                        <td className="p-4 text-center">
                                            {getTierBadge(project.tier, project.tier_color)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
