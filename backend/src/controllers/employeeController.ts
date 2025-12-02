import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabase } from '../config/database';

/**
 * Get Employee Dashboard Stats
 * GET /api/employees/dashboard
 */
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'employee') {
            res.status(403).json({
                success: false,
                message: 'Access denied'
            });
            return;
        }

        const { id } = req.user;

        // Fetch employee details
        const { data: employee, error } = await supabase
            .from('employees')
            .select('ranking, win_rate, streak')
            .eq('id', id)
            .single();

        if (error || !employee) {
            res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
            return;
        }

        // Mock data for total assessments (replace with real count when assessments table exists)
        const totalAssessments = 12;

        res.status(200).json({
            success: true,
            stats: {
                ranking: employee.ranking,
                win_rate: employee.win_rate,
                streak: employee.streak,
                total_assessments: totalAssessments
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get All Employees (Admin only)
 * GET /api/employees/all
 */
export const getAllEmployees = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            console.log('Access denied for user:', req.user);
            res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
            return;
        }

        console.log('Fetching all employees...');
        const { data: employees, error } = await supabase
            .from('employees')
            .select('id, name, job_title, department, ranking, win_rate, streak')
            .order('name');

        if (error) {
            console.error('Database error fetching employees:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch employees'
            });
            return;
        }

        console.log(`Found ${employees?.length} employees`);

        // Transform data for dashboard
        const formattedEmployees = employees.map(emp => ({
            id: emp.id,
            name: emp.name,
            role: emp.job_title, // Using job_title as role for display
            department: emp.department || 'Unassigned',
            progress: emp.win_rate || 0, // Using win_rate as progress proxy
            status: 'Active' // Mock status for now
        }));

        res.status(200).json({
            success: true,
            employees: formattedEmployees
        });
    } catch (error) {
        console.error('Get all employees error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get Employee Details (Admin only)
 * GET /api/employees/:id/details
 */
export const getEmployeeDetails = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
            return;
        }

        const { id } = req.params;

        // Fetch employee basic info
        const { data: employee, error: empError } = await supabase
            .from('employees')
            .select('id, name, job_title, department, ranking, win_rate, streak')
            .eq('id', id)
            .single();

        if (empError || !employee) {
            res.status(404).json({ success: false, message: 'Employee not found' });
            return;
        }

        // Fetch recent assessments
        const { data: assessments, error: assessError } = await supabase
            .from('assessments')
            .select('id, score, feedback, created_at, difficulty, scenario:scenarios(title, skill)')
            .eq('user_id', id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (assessError) {
            console.error('Error fetching assessments:', assessError);
        }

        res.status(200).json({
            success: true,
            employee: {
                ...employee,
                assessments: assessments || []
            }
        });

    } catch (error) {
        console.error('Get employee details error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
