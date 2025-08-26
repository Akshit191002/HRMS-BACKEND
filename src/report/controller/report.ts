import * as admin from 'firebase-admin';
import logger from '../../utils/logger';
import { Report, ScheduleReport } from '../models/report';
import { increaseSequence } from '../../gettingStarted/sequenceNumber/sequence.service';
import { error } from 'console';

const db = admin.firestore();
const reportCollection = db.collection('reports');
const scheduleReportCollection = db.collection('scheduleReports');

export const generateReportId = async (): Promise<string> => {
    const report = await increaseSequence("Report");
    const prefix = report?.prefix;
    let code = report?.nextAvailableNumber;
    if (!code) {
        throw error;
    }
    code -= 1;
    return `${prefix}${String(code)}`;
};

export const calculateNextRunDate = (
    frequency: "Daily" | "Weekly" | "Monthly",
    startDate: string,
    hours: number,
    minutes: number
): number => {
    const now = new Date();

    let nextDate = new Date(startDate);
    nextDate.setHours(hours, minutes, 0, 0);

    if (frequency === "Daily") {
        if (nextDate <= now) {
            nextDate.setDate(nextDate.getDate() + 1);
        }
    } else if (frequency === "Weekly") {
        if (nextDate <= now) {
            nextDate.setDate(nextDate.getDate() + 7);
        }
    } else if (frequency === "Monthly") {
        if (nextDate <= now) {
            nextDate.setMonth(nextDate.getMonth() + 1);
        }
    }

    return nextDate.getTime(); 
};

export const formattedDated = (nextRunDate:number)=>{
    const formatted = new Date(nextRunDate).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
    return formatted;
}
    

export const createReport = async (data: Report) => {
    try {
        logger.info('Creating new report');

        const docRef = reportCollection.doc();
        const report: Report = {
            ...data,
            id: docRef.id,
            Snum: await generateReportId(),
            isDeleted: false,
            createdAt: Date.now()
        };
        await docRef.set(report);
        logger.info('Report created successfully', { reportId: docRef.id });

        return {
            message: 'Report created successfully',
            report: report,
        };
    } catch (error) {
        logger.error('Error creating report', { error });
        throw error;
    }
};

export const deleteReport = async (id: string) => {
    try {
        logger.info('Deleting report', { reportId: id });

        const reportRef = reportCollection.doc(id);
        const snap = await reportRef.get();

        if (!snap.exists) {
            throw new Error("Report not found");
        }

        await reportRef.update({ isDeleted: true });

        logger.info('Report deleted successfully', { reportId: id });
        return {
            message: 'Report deleted successfully',
        };
    } catch (error) {
        logger.error('Error deleting report', { error });
        throw error;
    }
};

export const getAllReport = async (page: number, limit: number) => {
    try {
        logger.info(`Fetching reports | page: ${page}, limit: ${limit}`);

        const query = reportCollection
            .where('isDeleted', '==', false)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .offset((page - 1) * limit);

        const snapshot = await query.get();

        if (snapshot.empty) {
            logger.warn('No reports found');
            return {
                message: 'No reports found',
                reports: [],
                page,
                limit,
            };
        }

        const reports = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Report[];

        logger.info('Reports fetched successfully');
        return {
            message: 'Reports fetched successfully',
            reports,
            page,
            limit,
            total: snapshot.size,
        };
    } catch (error) {
        logger.error('Error fetching reports', { error });
        throw error;
    }
};

export const createScheduleReport = async (reportId: string, data: ScheduleReport) => {
    try {
        logger.info("Creating schedule report");
        const reportSnap = await reportCollection.doc(reportId).get();
        if (!reportSnap.exists) {
            throw new Error(`Report with ID ${reportId} not found`);
        }
        const docRef = scheduleReportCollection.doc();

        const nextRunDate = calculateNextRunDate(
            data.frequency,
            data.startDate,
            Number(data.hours),
            Number(data.minutes)
        );
        
        const scheduleReport: ScheduleReport = {
            ...data,
            nextRunDate,
            id: docRef.id,
            reportId: reportId,
            createdAt: Date.now(),
            isDeleted: false,
        };

        await docRef.set(scheduleReport);

        logger.info("Schedule report created successfully", { id: docRef.id });

        return {
            message: "Schedule report created successfully",
            scheduleReport: scheduleReport,
        };
    } catch (error) {
        logger.error("Error creating schedule report", { error });
        throw error;
    }
};

export const getAllScheduledReports = async (page: number, limit: number) => {
    try {
        const query = scheduleReportCollection
            .where("isDeleted", "==", false)
            .orderBy("createdAt", "desc")
            .limit(limit)
            .offset((page - 1) * limit);

        const snapshot = await query.get();
        const scheduledReports = snapshot.docs.map(doc => {
            const formattedDate = formattedDated(doc.data().nextRunDate);
            return {
                id: doc.id,
                ...doc.data(),
                nextRunDate: formattedDate
            };
        });
        return {
            message: "Scheduled reports fetched successfully",
            reports: scheduledReports,
            page,
            limit,
            total: snapshot.size,
        };
    } catch (error) {
        logger.error("Error fetching scheduled reports", { error });
        throw error;
    }
};

export const updateScheduledReport = async (id: string, data: Partial<ScheduleReport>) => {
    try {
        const docRef = scheduleReportCollection.doc(id);
        const snap = await docRef.get();

        if (!snap.exists) {
            throw new Error(`Scheduled report with ID ${id} not found`);
        }

        await docRef.update({
            ...data,
            updatedAt: Date.now(),
        });

        return { message: "Scheduled report updated successfully" };
    } catch (error) {
        logger.error("Error updating scheduled report", { error });
        throw error;
    }
};

export const deleteScheduledReport = async (id: string) => {
    try {
        const docRef = scheduleReportCollection.doc(id);
        await docRef.update({ isDeleted: true });
        return { message: "Scheduled report deleted successfully" };
    } catch (error) {
        logger.error("Error deleting scheduled report", { error });
        throw error;
    }
};
