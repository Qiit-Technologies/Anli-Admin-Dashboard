import { Member } from '@/types/membership/membership';
import { ArrowDown } from 'lucide-react';
import { StatusBadge, Table, Tbody, Td, Th, Thead, Tr } from '../customTable';

const ReferralTable = ({
    referrals,
}: {
    referrals: Member['referredMembers'];
}) => {
    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start py-4 sm:items-center gap-3">
                <h2 className="text-xl font-semibold">Referral List</h2>
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <Thead>
                        <Tr>
                            <Th>Name</Th>
                            <Th>Tier</Th>
                            <Th withIcon>Relationship</Th>
                            <Th withIcon>Phone</Th>
                            <Th
                                withIcon
                                icon={<ArrowDown size={16} color="#667085" />}
                            >
                                Status
                            </Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {referrals.map((row) => (
                            <Tr key={row.id}>
                                <Td>{`${row.firstName} ${row.lastName}`}</Td>
                                <Td>{row.membershipTier}</Td>
                                <Td>{row.relationshipToPlanOwner}</Td>
                                <Td>{row.phone}</Td>
                                <Td>
                                    <StatusBadge
                                        status={row.status}
                                        statusColorMap={{
                                            active: 'green',
                                        }}
                                    />
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </div>
        </>
    );
};

export default ReferralTable;
