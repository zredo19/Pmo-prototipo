import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, Presentation, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.DEV ? 'http://localhost:8000' : '';

/**
 * Drag and drop file upload component for Excel and PPTX files.
 * Handles file validation, upload state, and API communication.
 */
export default function CrossCheckView({ onAnalysisComplete }) {
    const [excelFile, setExcelFile] = useState(null);
    const [pptxFile, setPptxFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

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
        setError(null);

        const files = Array.from(e.dataTransfer.files);
        processFiles(files);
    }, []);

    const processFiles = (files) => {
        files.forEach((file) => {
            const extension = file.name.split('.').pop().toLowerCase();

            if (extension === 'xlsx' || extension === 'xls') {
                setExcelFile(file);
            } else if (extension === 'pptx') {
                setPptxFile(file);
            } else {
                setError(`Tipo de archivo no soportado: .${extension}. Solo se aceptan .xlsx y .pptx.`);
            }
        });
    };

    const handleFileSelect = (e, fileType) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        if (fileType === 'excel') {
            setExcelFile(file);
        } else {
            setPptxFile(file);
        }
    };

    const removeFile = (fileType) => {
        if (fileType === 'excel') {
            setExcelFile(null);
        } else {
            setPptxFile(null);
        }
        setSuccess(false);
        setError(null);
    };

    const handleAnalyze = async () => {
        if (!excelFile || !pptxFile) {
            setError('Por favor sube tanto el archivo Excel como el PowerPoint.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData();
        formData.append('file_excel', excelFile);
        formData.append('file_ppt', pptxFile);

        try {
            const response = await axios.post(`${API_URL}/analyze`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSuccess(true);
            onAnalysisComplete(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || 'Error en análisis. Por favor intenta de nuevo.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const FileCard = ({ file, type, icon: Icon, onRemove }) => (
        <div className="glass rounded-xl p-4 flex items-center gap-4 animate-fade-in bg-white/50 dark:bg-slate-800/40">
            <div className={`p-3 rounded-lg ${type === 'excel' ? 'bg-green-600/20' : 'bg-orange-600/20'}`}>
                <Icon className={`w-6 h-6 ${type === 'excel' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{file.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
                onClick={() => onRemove(type)}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                aria-label={`Remover ${file.name}`}
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Análisis de Validación Cruzada</h2>
                <p className="text-slate-500 dark:text-slate-400">Identifica discrepancias entre tu Excel Financiero y la Presentación</p>
            </div>

            {/* Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`drop-zone rounded-2xl p-12 text-center transition-all ${isDragging ? 'drag-over' : 'bg-white/50 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700'
                    }`}
            >
                <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-primary-600/20 rounded-2xl">
                        <Upload className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                        <p className="text-lg font-medium text-slate-900 dark:text-white">Arrastra y suelta tus archivos aquí</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">o haz clic para buscar</p>
                    </div>
                    <div className="flex gap-4 mt-4">
                        <label className="px-4 py-2 bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-600/30 transition-colors cursor-pointer">
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={(e) => handleFileSelect(e, 'excel')}
                                className="hidden"
                            />
                            Seleccionar Excel
                        </label>
                        <label className="px-4 py-2 bg-orange-100 dark:bg-orange-600/20 text-orange-700 dark:text-orange-400 rounded-lg text-sm font-medium hover:bg-orange-200 dark:hover:bg-orange-600/30 transition-colors cursor-pointer">
                            <input
                                type="file"
                                accept=".pptx"
                                onChange={(e) => handleFileSelect(e, 'pptx')}
                                className="hidden"
                            />
                            Seleccionar PowerPoint
                        </label>
                    </div>
                </div>
            </div>

            {/* Selected Files */}
            {(excelFile || pptxFile) && (
                <div className="grid md:grid-cols-2 gap-4">
                    {excelFile && (
                        <FileCard file={excelFile} type="excel" icon={FileSpreadsheet} onRemove={removeFile} />
                    )}
                    {pptxFile && (
                        <FileCard file={pptxFile} type="pptx" icon={Presentation} onRemove={removeFile} />
                    )}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-100 dark:bg-red-600/10 border border-red-200 dark:border-red-600/30 rounded-xl animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="flex items-center gap-3 p-4 bg-green-100 dark:bg-green-600/10 border border-green-200 dark:border-green-600/30 rounded-xl animate-fade-in">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <p className="text-sm text-green-600 dark:text-green-400">¡Análisis completado exitosamente! Ver resultados abajo.</p>
                </div>
            )}

            {/* Analyze Button */}
            <button
                onClick={handleAnalyze}
                disabled={!excelFile || !pptxFile || isLoading}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${!excelFile || !pptxFile || isLoading
                    ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-50'
                    : 'bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40'
                    }`}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analizando archivos...
                    </>
                ) : (
                    <>
                        <Upload className="w-5 h-5" />
                        Analizar Archivos
                    </>
                )}
            </button>
        </div>
    );
}
