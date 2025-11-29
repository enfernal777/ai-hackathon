import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Terminal, Shield, Target, Cpu, MessageSquare, Database, Lock, Activity, LogOut } from 'lucide-react';

export const Profile: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Mock data for the skill matrix
    const skillData = [
        { subject: 'Prompt Engineering', A: 120, fullMark: 150 },
        { subject: 'Summarization', A: 98, fullMark: 150 },
        { subject: 'Rewriting & Tone', A: 86, fullMark: 150 },
        { subject: 'Data Extraction', A: 99, fullMark: 150 },
        { subject: 'Complex Reasoning', A: 85, fullMark: 150 },
    ];

    const modules = [
        { name: 'Prompt Engineering', progress: 45, status: 'INITIALIZE', color: 'from-purple-500 to-cyan-500' },
        { name: 'Summarization', progress: 68, status: 'INITIALIZE', color: 'from-blue-500 to-teal-500' },
        { name: 'Rewriting & Tone', progress: 28, status: 'INITIALIZE', color: 'from-indigo-500 to-purple-500' },
        { name: 'Data Extraction', progress: 18, status: 'INITIALIZE', color: 'from-cyan-500 to-blue-500' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-cyan-50 font-mono selection:bg-cyan-500/30">
            {/* Top Navigation Bar Mimic */}
            <div className="border-b border-white/10 bg-black/50 backdrop-blur-md px-6 py-3 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-gray-400">
                    <Terminal size={16} />
                    <span>GenAI CTF Academy</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <Cpu size={14} />
                        <span>DEVICE_CONNECTED</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="ml-4 px-3 py-1 border border-white/20 rounded hover:bg-white/10 transition-colors text-xs font-mono"
                    >
                        RETURN_TO_BASE
                    </button>
                    <button
                        onClick={handleLogout}
                        className="ml-2 flex items-center gap-2 px-3 py-1 border border-red-500/30 text-red-400 rounded hover:bg-red-500/10 transition-colors text-xs font-mono"
                    >
                        <LogOut size={12} />
                        LOGOUT
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Header Section */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-widest text-white">OPERATIVE STATUS:</h1>
                        <span className="text-2xl font-bold text-green-500 animate-pulse">ACTIVE</span>
                    </div>
                    <p className="text-gray-400 max-w-2xl">
                        Welcome to the GenAI CTF Academy, {user?.name || 'Operative'}. Select a module to begin training.
                    </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Score */}
                    <div className="bg-[#111] border border-white/5 rounded-lg p-6 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Target size={64} />
                        </div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Score</p>
                        <p className="text-4xl font-bold text-white font-mono">120</p>
                    </div>

                    {/* Missions Complete */}
                    <div className="bg-[#111] border border-white/5 rounded-lg p-6 relative overflow-hidden group hover:border-green-500/30 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Shield size={64} />
                        </div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Missions Complete</p>
                        <p className="text-4xl font-bold text-white font-mono">3</p>
                    </div>

                    {/* Rank */}
                    <div className="bg-[#111] border border-white/5 rounded-lg p-6 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Lock size={64} />
                        </div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Rank</p>
                        <p className="text-4xl font-bold text-white font-mono">HACKER</p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Skill Matrix */}
                    <div className="bg-[#111] border border-white/5 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-cyan-400 tracking-wider flex items-center gap-2">
                                <Activity size={18} />
                                SKILL MATRIX
                            </h2>
                        </div>
                        <div className="h-[300px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                                    <PolarGrid stroke="#333" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 12 }} />
                                    <Radar
                                        name="Skills"
                                        dataKey="A"
                                        stroke="#06b6d4"
                                        strokeWidth={2}
                                        fill="#06b6d4"
                                        fillOpacity={0.3}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Available Modules */}
                    <div className="bg-[#111] border border-white/5 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-green-400 tracking-wider flex items-center gap-2">
                                <Database size={18} />
                                AVAILABLE MODULES
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {modules.map((module, idx) => (
                                <div key={idx} className="bg-black/40 border border-white/5 p-4 rounded flex items-center justify-between hover:bg-white/5 transition-colors group">
                                    <div className="space-y-2 flex-1 mr-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-bold text-gray-200 group-hover:text-white transition-colors">{module.name}</span>
                                            <span className="text-gray-500">{module.progress}%</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${module.color}`}
                                                style={{ width: `${module.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 bg-transparent border border-cyan-500/50 text-cyan-400 text-xs font-bold tracking-wider hover:bg-cyan-500/10 hover:text-cyan-300 transition-all uppercase rounded-sm">
                                        {module.status}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <button className="fixed bottom-8 right-8 w-14 h-14 bg-cyan-500 rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:scale-110 transition-transform z-50">
                <MessageSquare size={24} />
            </button>
        </div>
    );
};
