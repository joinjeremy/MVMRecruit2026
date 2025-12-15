
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { CandidateStatus, Candidate, PaymentStatus, ScreeningRatings } from '../types';
import { DownloadIcon, ChevronDownIcon, CheckCircleIcon, XMarkIcon } from './icons';

// --- Helper Components ---

const TrendIndicator: React.FC<{ current: number; previous: number; inverse?: boolean; prefix?: string; suffix?: string }> = ({ current, previous, inverse = false, prefix = '', suffix = '' }) => {
    if (previous === 0) return <span className="text-xs text-slate-400">vs --</span>;
    
    const change = ((current - previous) / previous) * 100;
    const isPositive = change > 0;
    const isGood = inverse ? !isPositive : isPositive;
    
    const colorClass = change === 0 ? 'text-slate-400' : isGood ? 'text-green-600' : 'text-red-600';
    const Arrow = isPositive ? 
        <ChevronDownIcon className="w-3 h-3 transform rotate-180 inline" /> : 
        <ChevronDownIcon className="w-3 h-3 inline" />;

    return (
        <span className={`text-xs font-medium ${colorClass} flex items-center gap-0.5`}>
            {change !== 0 && Arrow}
            {Math.abs(change).toFixed(1)}%
            <span className="text-slate-400 font-normal ml-1">vs prev</span>
        </span>
    );
};

const KpiCard: React.FC<{ title: string; value: string | number; description: string; trend?: React.ReactNode }> = ({ title, value, description, trend }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
        <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-brand-gray-dark">{title}</p>
            {trend}
        </div>
        <p className="mt-2 text-3xl font-bold text-brand-charcoal">{value}</p>
        <p className="text-xs text-brand-gray-dark mt-1">{description}</p>
    </div>
);

const SimpleBarChart: React.FC<{ data: { label: string; value: number; color?: string }[], maxVal?: number, height?: number }> = ({ data, maxVal, height = 150 }) => {
    const max = maxVal || Math.max(...data.map(d => d.value), 1);
    
    return (
        <div className="flex items-end justify-between gap-2 w-full" style={{ height: `${height}px` }}>
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative min-w-[20px]">
                     <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-brand-charcoal text-white text-xs py-1 px-2 rounded z-10 whitespace-nowrap">
                        {d.label}: {d.value}
                    </div>
                    <div 
                        className={`w-full rounded-t-sm transition-all duration-500 ${d.color || 'bg-brand-accent'}`}
                        style={{ height: `${(d.value / max) * 100}%` }}
                    ></div>
                    <p className="text-[10px] text-brand-gray-dark mt-2 text-center truncate w-full" title={d.label}>{d.label}</p>
                </div>
            ))}
        </div>
    );
};

// --- Logic Helpers ---

type DateRangePreset = '7d' | '30d' | '90d' | 'year';

const getDateRange = (preset: DateRangePreset): { start: Date, end: Date, prevStart: Date, prevEnd: Date } => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    
    let days = 30;
    if (preset === '7d') days = 7;
    if (preset === '90d') days = 90;
    if (preset === 'year') days = 365;
    
    start.setDate(start.getDate() - days);

    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    prevEnd.setHours(23, 59, 59, 999);
    
    const prevStart = new Date(prevEnd);
    prevStart.setHours(0,0,0,0);
    prevStart.setDate(prevStart.getDate() - days);

    return { start, end, prevStart, prevEnd };
}

const getWithdrawalReason = (c: Candidate) => {
    if (c.status !== CandidateStatus.WITHDRAWN) return null;
    const systemNote = c.notes.find(n => n.author === 'System' && n.content.includes('Reason:'));
    if (systemNote) {
        const match = systemNote.content.match(/Reason: (.+)/);
        return match ? match[1] : 'Unknown';
    }
    return 'Unknown';
};

const getPostcodeArea = (postcode: string) => {
    if (!postcode) return 'Unknown';
    const match = postcode.match(/^([A-Z]{1,2}[0-9][0-9A-Z]?)/i);
    return match ? match[1].toUpperCase() : 'Other';
};

const ReportingView: React.FC = () => {
    const { state } = useAppContext();
    const { candidates } = state;
    
    const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>('30d');

    const ranges = useMemo(() => getDateRange(dateRangePreset), [dateRangePreset]);

    const metrics = useMemo(() => {
        const calculateMetrics = (startDate: Date, endDate: Date) => {
            const periodCandidates = candidates.filter(c => {
                const date = new Date(c.createdAt);
                return date >= startDate && date <= endDate && c.status !== CandidateStatus.LEGACY;
            });

            const hired = periodCandidates.filter(c => c.status === CandidateStatus.HIRED);
            const hiredCount = hired.length;
            const total = periodCandidates.length;
            
            // Time to Hire
            let timeToHireTotal = 0;
            let timeToHireCount = 0;
            hired.forEach(c => {
                if (c.hiredAt) {
                    const diff = new Date(c.hiredAt).getTime() - new Date(c.createdAt).getTime();
                    timeToHireTotal += diff / (1000 * 60 * 60 * 24);
                    timeToHireCount++;
                }
            });
            const avgTimeToHire = timeToHireCount > 0 ? timeToHireTotal / timeToHireCount : 0;

            // Costs
            const totalCost = periodCandidates.reduce((sum, c) => {
                return sum + (c.providerCost?.reduce((acc, cost) => acc + cost.amount, 0) || 0);
            }, 0);

            return { total, hiredCount, avgTimeToHire, totalCost, candidates: periodCandidates };
        };

        const current = calculateMetrics(ranges.start, ranges.end);
        const previous = calculateMetrics(ranges.prevStart, ranges.prevEnd);

        // Analysis Lists (Current Period Only)
        
        // 1. Withdrawal Reasons
        const withdrawals = current.candidates.filter(c => c.status === CandidateStatus.WITHDRAWN);
        const withdrawalReasons: Record<string, number> = {};
        withdrawals.forEach(c => {
            const reason = getWithdrawalReason(c) || 'Unknown';
            withdrawalReasons[reason] = (withdrawalReasons[reason] || 0) + 1;
        });
        const withdrawalChartData = Object.entries(withdrawalReasons)
            .map(([label, value]) => ({ label, value, color: 'bg-red-400' }))
            .sort((a,b) => b.value - a.value);

        // 2. Geographics
        const geoCounts: Record<string, number> = {};
        current.candidates.forEach(c => {
            if (c.postcode) {
                const area = getPostcodeArea(c.postcode);
                geoCounts[area] = (geoCounts[area] || 0) + 1;
            }
        });
        const geoData = Object.entries(geoCounts)
            .map(([area, count]) => ({ area, count }))
            .sort((a,b) => b.count - a.count)
            .slice(0, 5);

        // 3. Screening Scores Analysis
        const scoredCandidates = current.candidates.filter(c => c.screeningRatings?.completed);
        const hiredWithScore = scoredCandidates.filter(c => c.status === CandidateStatus.HIRED);
        const rejectedWithScore = scoredCandidates.filter(c => c.status === CandidateStatus.REJECTED || c.status === CandidateStatus.TERMINATED);

        const getAvgScore = (list: Candidate[]) => {
            if (list.length === 0) return 0;
            const sum = list.reduce((acc, c) => {
                const ratings = c.screeningRatings!;
                return acc + ratings.financialViability + ratings.logisticsAvailability + ratings.complianceTech + ratings.attitudeExperience;
            }, 0);
            return sum / list.length;
        };

        const avgScoreHired = getAvgScore(hiredWithScore);
        const avgScoreRejected = getAvgScore(rejectedWithScore);

        // 4. Funnel
        const funnelStatuses = [CandidateStatus.NEW, CandidateStatus.SCREENING, CandidateStatus.VIDEO_INTERVIEW, CandidateStatus.INDUCTION, CandidateStatus.HIRED];
        const funnelData = funnelStatuses.map(status => ({
            label: status,
            value: current.candidates.filter(c => c.status === status || (c.status === CandidateStatus.HIRED && status !== CandidateStatus.HIRED)).length, // Simple inclusive funnel logic approximation
            color: status === CandidateStatus.HIRED ? 'bg-green-500' : 'bg-brand-plum'
        }));
        // Fix funnel logic to be exact count per status for bar chart
        const statusDistribution = funnelStatuses.map(status => ({
            label: status,
            value: current.candidates.filter(c => c.status === status).length,
            color: status === CandidateStatus.HIRED ? 'bg-green-500' : 'bg-brand-plum opacity-80'
        }));


        return { current, previous, withdrawalChartData, geoData, avgScoreHired, avgScoreRejected, statusDistribution };
    }, [candidates, ranges]);

    const handleExport = () => {
        const rows = [
            ['ID', 'Name', 'Email', 'Status', 'Date Added', 'Hired Date', 'Source', 'Total Cost', 'Screening Score', 'Postcode Area'],
            ...metrics.current.candidates.map(c => {
                const score = c.screeningRatings?.completed 
                    ? (c.screeningRatings.financialViability + c.screeningRatings.logisticsAvailability + c.screeningRatings.complianceTech + c.screeningRatings.attitudeExperience)
                    : '';
                const cost = c.providerCost?.reduce((acc, cost) => acc + cost.amount, 0) || 0;
                
                return [
                    c.id, c.name, c.email, c.status, c.createdAt, c.hiredAt || '', c.referralSource?.type || '', cost, score, getPostcodeArea(c.postcode)
                ];
            })
        ];

        const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `recruitment_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-brand-charcoal">Analytics & Reporting</h1>
                    <p className="text-brand-gray-dark mt-1">
                        Performance metrics for period: <span className="font-medium text-brand-charcoal">{ranges.start.toLocaleDateString()} - {ranges.end.toLocaleDateString()}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select 
                            value={dateRangePreset}
                            onChange={(e) => setDateRangePreset(e.target.value as DateRangePreset)}
                            className="pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-brand-accent focus:border-brand-accent shadow-sm"
                        >
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="90d">Last 3 Months</option>
                            <option value="year">Last Year</option>
                        </select>
                    </div>
                    <button 
                        onClick={handleExport}
                        className="flex items-center bg-white border border-slate-300 text-brand-gray-dark px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard 
                    title="Total Applications" 
                    value={metrics.current.total} 
                    description="Candidates added"
                    trend={<TrendIndicator current={metrics.current.total} previous={metrics.previous.total} />}
                />
                <KpiCard 
                    title="Total Hired" 
                    value={metrics.current.hiredCount} 
                    description="Candidates hired"
                    trend={<TrendIndicator current={metrics.current.hiredCount} previous={metrics.previous.hiredCount} />}
                />
                <KpiCard 
                    title="Avg Time to Hire" 
                    value={`${metrics.current.avgTimeToHire.toFixed(1)} days`} 
                    description="From added to hired"
                    trend={<TrendIndicator current={metrics.current.avgTimeToHire} previous={metrics.previous.avgTimeToHire} inverse suffix="days" />}
                />
                 <KpiCard 
                    title="Total Spend" 
                    value={`£${metrics.current.totalCost.toLocaleString()}`} 
                    description="Provider & Kit costs"
                    trend={<TrendIndicator current={metrics.current.totalCost} previous={metrics.previous.totalCost} inverse />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Attrition Analysis */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 lg:col-span-2">
                    <h3 className="text-lg font-bold text-brand-charcoal mb-4">Attrition Analysis: Withdrawal Reasons</h3>
                    <div className="flex flex-col sm:flex-row gap-8 items-center">
                        <div className="flex-1 w-full">
                            {metrics.withdrawalChartData.length > 0 ? (
                                <SimpleBarChart data={metrics.withdrawalChartData} height={200} />
                            ) : (
                                <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded">
                                    No withdrawals recorded in this period.
                                </div>
                            )}
                        </div>
                        <div className="w-full sm:w-64 space-y-3">
                            <h4 className="text-sm font-semibold text-brand-charcoal border-b border-slate-200 pb-2">Top Reasons</h4>
                            {metrics.withdrawalChartData.slice(0, 4).map((d, i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <span className="text-brand-gray-dark truncate mr-2" title={d.label}>{d.label}</span>
                                    <span className="font-bold text-slate-700">{d.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. Geographic Heatmap (List) */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
                    <h3 className="text-lg font-bold text-brand-charcoal mb-4">Top Locations</h3>
                    <div className="overflow-hidden rounded-lg border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-brand-gray-dark uppercase">Area</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-brand-gray-dark uppercase">Candidates</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {metrics.geoData.length > 0 ? (
                                    metrics.geoData.map((d, i) => (
                                        <tr key={i}>
                                            <td className="px-4 py-2 text-sm text-brand-charcoal font-medium">{d.area}</td>
                                            <td className="px-4 py-2 text-sm text-brand-gray-dark text-right">{d.count}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={2} className="px-4 py-4 text-center text-sm text-slate-400">No location data available.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* 3. Screening Correlation */}
                 <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-brand-charcoal">Screening Effectiveness</h3>
                    </div>
                    
                    <div className="flex items-center justify-center gap-12 py-4">
                        <div className="text-center">
                            <div className="w-24 h-24 rounded-full bg-green-50 border-4 border-green-200 flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl font-bold text-green-700">{metrics.avgScoreHired.toFixed(1)}</span>
                            </div>
                            <p className="font-semibold text-brand-charcoal">Avg Score (Hired)</p>
                            <p className="text-xs text-brand-gray-dark">Out of 20</p>
                        </div>
                        
                        <div className="h-24 w-px bg-slate-200"></div>

                        <div className="text-center">
                            <div className="w-24 h-24 rounded-full bg-red-50 border-4 border-red-200 flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl font-bold text-red-700">{metrics.avgScoreRejected.toFixed(1)}</span>
                            </div>
                            <p className="font-semibold text-brand-charcoal">Avg Score (Rejected)</p>
                            <p className="text-xs text-brand-gray-dark">Out of 20</p>
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-slate-50 rounded text-xs text-brand-gray-dark text-center">
                        Higher screening scores for Hired candidates indicate your screening process is effectively predicting success.
                    </div>
                </div>

                {/* 4. Pipeline Status Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
                    <h3 className="text-lg font-bold text-brand-charcoal mb-6">Current Pipeline Distribution</h3>
                     <SimpleBarChart data={metrics.statusDistribution} height={200} />
                     <div className="mt-6 grid grid-cols-2 gap-4">
                         {metrics.statusDistribution.map(d => (
                             <div key={d.label} className="flex items-center text-xs">
                                 <span className={`w-2 h-2 rounded-full mr-2 ${d.color || 'bg-brand-accent'}`}></span>
                                 <span className="text-brand-gray-dark truncate flex-1">{d.label}</span>
                                 <span className="font-bold text-brand-charcoal">{d.value}</span>
                             </div>
                         ))}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default ReportingView;
