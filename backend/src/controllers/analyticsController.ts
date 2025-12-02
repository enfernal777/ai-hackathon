import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getAnalyticsOverview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Admin access required' });
            return;
        }

        // 1. Completion Rate (Win Rate)
        const { data: employees, error: empError } = await supabase
            .from('employees')
            .select('win_rate');

        if (empError) throw empError;

        const totalEmployees = employees?.length || 0;
        const avgCompletionRate = totalEmployees > 0
            ? employees.reduce((sum: number, emp: any) => sum + (emp.win_rate || 0), 0) / totalEmployees
            : 0;

        // 2. Total Assessments
        const { count: totalAssessments, error: assessError } = await supabase
            .from('assessments')
            .select('*', { count: 'exact', head: true });

        if (assessError) throw assessError;

        // 3. Activity Timeline (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: activityData, error: activityError } = await supabase
            .from('assessments')
            .select('created_at')
            .gte('created_at', thirtyDaysAgo.toISOString());

        if (activityError) throw activityError;

        // Group by date
        const activityMap = new Map<string, number>();
        activityData?.forEach((item: any) => {
            const date = new Date(item.created_at).toISOString().split('T')[0];
            activityMap.set(date, (activityMap.get(date) || 0) + 1);
        });

        const activityTimeline = Array.from(activityMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // 4. Skill Distribution (Mocked for now as we don't have direct skill mapping in assessments yet, or need complex join)
        // We can use scenarios skill field if available.
        // Let's fetch scenarios linked to assessments.
        const { data: skillData, error: skillError } = await supabase
            .from('assessments')
            .select(`
                scenario_id,
                scenarios (
                    skill
                )
            `);

        if (skillError) throw skillError;

        const skillMap = new Map<string, number>();
        skillData?.forEach((item: any) => {
            const skill = item.scenarios?.skill || 'Unknown';
            skillMap.set(skill, (skillMap.get(skill) || 0) + 1);
        });

        const skillDistribution = Array.from(skillMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5

        res.status(200).json({
            success: true,
            data: {
                avgCompletionRate: Math.round(avgCompletionRate),
                totalAssessments: totalAssessments || 0,
                activityTimeline,
                skillDistribution
            }
        });

    } catch (error: any) {
        console.error('Analytics error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
    }
};
