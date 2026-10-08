import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, Eye, MoreVertical, X } from 'lucide-react';
import Link from 'next/link';
interface Payroll {
    id: string;
    employeeId: string;
    paymentId: string;
    employeeName: string;
    employeeImage: string;
    jobTitle: string;
    date: string;
    salary: number;
    status: 'paid' | 'pending' | 'failed';
}

const PayrollAction = ({ payroll }: { payroll: Payroll }) => {
    const approvePayroll = () => {
        console.log('approved');
    };

    const rejectPayroll = () => {
        console.log('rejected');
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <Link href={`/employee/payroll/${payroll.id}/payslip`}>
                    <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={() => approvePayroll()}>
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => rejectPayroll()}>
                    <X className="mr-2 h-4 w-4" />
                    Reject
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default PayrollAction;
