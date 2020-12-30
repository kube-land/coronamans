export interface Employee {
    id: number;
    name: string;
    title: string;
    loggedIn: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Attendance {
    barcode: number;
    name: string;
    duration: string;
    createdAt: Date;
    logout: Date;
}

export interface ReportItem {
	barcode: number;
    name: string;
    duration: string;
    createdAt: Date;
    logout: Date;

	count: number
}
