export enum Type{
    Employee = "Employee",
    Finance = "Finance",
    Attendance = "Attendance"
}
export interface Report {
    id?: string,
    Snum?: string,
    type: Type,
    name: string,
    description: string,
    isDeleted?: boolean,
    createdAt?: number,
    updatedAt?: number
}

export enum ReportFrequency {
    DAILY = "Daily",
    WEEKLY = "Weekly",
    MONTHLY = "Monthly"
}

export enum ReportFormat {
    CSV = "CSV",
    PDF = "PDF",
    EXCEL = "Excel"
}   

export interface ScheduleReport {
    id?: string;
    reportId: string;
    frequency: ReportFrequency;
    startDate: string;
    hours: string;
    minutes: string;
    format: ReportFormat;
    to: string[];
    cc?: string[];
    subject: string;
    body: string;
    nextRunDate:number
    createdAt?: number;
    updatedAt?: number;
    isDeleted?: boolean;
}