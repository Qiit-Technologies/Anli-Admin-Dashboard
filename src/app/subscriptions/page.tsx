"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import useSWR from "swr";
import fetcher from "../actions/fetcher";
import { getSubscriptionPlansResponse } from "../actions/types";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@/components/common/customTable";
import { useState } from "react";
import { SubscriptionPlan } from "@/types/subscriptions";
import { EditSubscriptionPlan } from "@/components/EditSubscriptionPlan";
import { AddSubscriptionPlan } from "@/components/AddSubscriptionPlan";

export default function SubscriptionsPage() {
  const router = useRouter();
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  const {
    data: response,
    isLoading,
    mutate,
  } = useSWR("/super-admin/subscription-plan", (url: string) =>
    fetcher<getSubscriptionPlansResponse>(url),
  );

  const plans = response?.data.plans || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/business-list")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm sm:text-base"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back to Business List</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <div className="hidden sm:block w-24"></div> {/* Spacer for centering */}
        </div>
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/logo.svg"
            alt="Anli logo"
            width={120}
            height={70}
            className="mx-auto"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border mx-4 sm:mx-20">
        <div className="flex flex-col px-4 sm:px-6 py-4 sm:flex-row justify-between items-start sm:items-center gap-3 border-b">
          <h2 className="text-base sm:text-lg font-normal text-[#101828]">
            Subscription Plans
          </h2>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <AddSubscriptionPlan refetch={mutate} />
          </div>
        </div>
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="w-full flex flex-col items-center justify-center mx-auto py-20">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-full inline-block align-middle">
                <Table>
                  <Thead>
                    <Tr>
                      <Th withIcon>Name</Th>
                      <Th>Price</Th>
                      <Th withIcon>Description</Th>
                      <Th>Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {plans.map((plan) => (
                      <Tr key={plan.id}>
                        <Td className="min-w-[120px]">{plan.name}</Td>
                        <Td className="min-w-[100px]">
                          {Number(plan.price).toLocaleString("en-NG", {
                            style: "currency",
                            currency: "NGN",
                          })}
                        </Td>
                        <Td className="min-w-[150px]">{plan.description}</Td>
                        <Td className="text-blue-600 hover:underline cursor-pointer py-4 px-4 min-w-[80px]">
                          <span
                            className="cursor-pointer text-blue-600 hover:underline text-sm"
                            onClick={() => {
                              setSelectedPlan(plan);
                              setIsViewDrawerOpen(true);
                            }}
                          >
                            Edit
                          </span>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>
      {selectedPlan && (
        <EditSubscriptionPlan
          refetch={mutate}
          plan={selectedPlan}
          isOpen={isViewDrawerOpen}
          setOpen={(val: boolean) => {
            setSelectedPlan(null);
            setIsViewDrawerOpen(val);
          }}
        />
      )}
    </div>
  );
}
