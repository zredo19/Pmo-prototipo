import { useState } from 'react';
import { Calculator, TrendingUp, AlertTriangle, Target, Users, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

/**
 * Project prioritization form component.
 * Collects project metrics and calculates priority score via API.
 */
export default function ProjectScorer() {
    const [formData, setFormData] = useState({
        roi: 50,
        urgency: 50,
        risk: 50,
        strategic_alignment: 50,
        resource_availability: 50,
    });

    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSliderChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: Number(value),
        }));
        setResult(null);
    };

    const handleCalculate = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${API_URL}/prioritize`, formData);
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to calculate priority score.');
        } finally {
            setIsLoading(false);
        }
    };

    const sliderConfig = [
        {
            key: 'roi',
            label: 'Return on Investment (ROI)',
            description: 'Expected financial return relative to cost',
            icon: TrendingUp,
            color: 'green',
        },
        {
            key: 'urgency',
            label: 'Urgency',
            description: 'Time sensitivity and deadline pressure',
            icon: AlertTriangle,
            color: 'orange',
        },
        {
            key: 'risk',
            label: 'Risk Level',
            description: 'Higher values indicate higher risk',
            icon: AlertTriangle,
            color: 'red',
        },
        {
            key: 'strategic_alignment',
            label: 'Strategic Alignment',
            description: 'Alignment with company goals and vision',
            icon: Target,
            color: 'blue',
        },
        {
            key: 'resource_availability',
            label: 'Resource Availability',
            description: 'Available team, budget, and tools',
            icon: Users,
            color: 'purple',
        },
    ];

    const getColorClasses = (color) => {
        const colors = {
            green: 'bg-green-600',
            orange: 'bg-orange-600',
            red: 'bg-red-600',
            blue: 'bg-blue-600',
            purple: 'bg-purple-600',
        };
        return colors[color] || 'bg-primary-600';
    };

    const getSliderBg = (value, color) => {
        const colors = {
            green: `linear-gradient(to right, #16a34a ${value}%, #334155 ${value}%)`,
            orange: `linear-gradient(to right, #ea580c ${value}%, #334155 ${value}%)`,
            red: `linear-gradient(to right, #dc2626 ${value}%, #334155 ${value}%)`,
            blue: `linear-gradient(to right, #2563eb ${value}%, #334155 ${value}%)`,
            purple: `linear-gradient(to right, #9333ea ${value}%, #334155 ${value}%)`,
        };
        return colors[color] || `linear-gradient(to right, #2563eb ${value}%, #334155 ${value}%)`;
    };

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Project Priority Scorer</h2>
                <p className="text-slate-400">Evaluate project priority using weighted scoring metrics</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Input Form */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-primary-400" />
                        Project Metrics
                    </h3>

                    <div className="space-y-6">
                        {sliderConfig.map(({ key, label, description, icon: Icon, color }) => (
                            <div key={key} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Icon className={`w-4 h-4 text-${color}-400`} style={{ color: `var(--tw-${color}-400, currentColor)` }} />
                                        <label className="text-sm font-medium text-white">{label}</label>
                                    </div>
                                    <span className={`text-lg font-bold ${getColorClasses(color).replace('bg-', 'text-').replace('-600', '-400')}`}>
                                        {formData[key]}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={formData[key]}
                                    onChange={(e) => handleSliderChange(key, e.target.value)}
                                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                    style={{
                                        background: getSliderBg(formData[key], color),
                                    }}
                                />
                                <p className="text-xs text-slate-500">{description}</p>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleCalculate}
                        disabled={isLoading}
                        className="w-full mt-6 py-4 rounded-xl font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Calculating...
                            </>
                        ) : (
                            <>
                                <Calculator className="w-5 h-5" />
                                Calculate Priority Score
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="mt-4 p-4 bg-red-600/10 border border-red-600/30 rounded-xl">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}
                </div>

                {/* Results Panel */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Priority Analysis</h3>

                    {!result ? (
                        <div className="text-center py-12">
                            <div className="p-4 bg-slate-700/30 rounded-2xl inline-block mb-4">
                                <Target className="w-10 h-10 text-slate-400" />
                            </div>
                            <p className="text-slate-400">Adjust the sliders and calculate to see results</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            {/* Score Display */}
                            <div
                                className="text-center p-8 rounded-2xl"
                                style={{ background: `linear-gradient(135deg, ${result.tier_color}20, transparent)` }}
                            >
                                <p className="text-6xl font-bold text-white mb-2">{result.score}</p>
                                <div
                                    className="inline-block px-4 py-2 rounded-full text-sm font-semibold text-white"
                                    style={{ backgroundColor: result.tier_color }}
                                >
                                    {result.tier} Priority
                                </div>
                            </div>

                            {/* Score Breakdown */}
                            <div>
                                <h4 className="text-sm font-medium text-slate-400 mb-4">Score Breakdown</h4>
                                <div className="space-y-3">
                                    {Object.entries(result.breakdown).map(([key, data]) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <span className="text-sm text-slate-300 capitalize">{key.replace('_', ' ')}</span>
                                            <div className="flex items-center gap-3">
                                                <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary-500 rounded-full transition-all duration-500"
                                                        style={{ width: `${data.value}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-white w-12 text-right">
                                                    +{data.contribution}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recommendation */}
                            <div className="p-4 bg-slate-700/30 rounded-xl">
                                <p className="text-xs text-slate-400 mb-2">Recommendation</p>
                                <p className="text-sm text-white">{result.recommendation}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
