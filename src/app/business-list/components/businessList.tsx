"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BusinessDTO, businessListResponse } from "./types";
import SearchWithIcon from "@/components/common/searchWithIcon";
import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/hooks/useAxios";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/common/pagination";
import { AxiosError } from "axios";
import { ErrorResponseData } from "@/hooks/types";
import { toast } from "sonner";

export default function BusinessList() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [data, setData] = useState<BusinessDTO[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const { axiosGet } = useAxios();

  const filtered = data.filter((b) =>
    b.name.toLowerCase().includes(query.toLowerCase())
  );

  const { mutate: getBusinesses, isPending } = useMutation({
    mutationFn: async () => {
      return await axiosGet<businessListResponse>("/super-admin/hotels", {
        page,
        limit,
      });
    },

    //   return {
    //     success: true,
    //     data: {
    //       hotels: [
    //         {
    //           id: 2,
    //           name: "Prudent Crypto",
    //           isActive: true,
    //           address: "Plot 233, day",
    //           businessType: "HOTEL",
    //           registrationNumber: null,
    //           country: "Nigeria",
    //           state: "Lagos",
    //           coverImage: null,
    //           cacImage: null,
    //           isCacVerified: false,
    //           isEmailVerified: false,
    //           createdAt: "2025-07-08T16:52:40.162Z",
    //           taxId: null,
    //           incorporationCert: null,
    //           boardingToken:
    //             "$2b$10$MNmz3DJwm.Zvjb0lCJB3xeLUwSGgOxGY16Wa24eS8NH/VFn2MpB7a",
    //           services: null,
    //           disbursementType: "IN_APP_DISBURSEMENT",
    //         },
    //         {
    //           id: 1,
    //           name: "Sip and Kings",
    //           isActive: true,
    //           address: "Lagos Island",
    //           businessType: "HOTEL",
    //           registrationNumber: "12345",
    //           country: "Nigeria",
    //           state: "Lagos",
    //           coverImage: null,
    //           cacImage: null,
    //           isCacVerified: true,
    //           isEmailVerified: true,
    //           createdAt: "2025-07-07T16:36:33.890Z",
    //           taxId: "1234",
    //           incorporationCert: null,
    //           boardingToken: null,
    //           services: null,
    //           disbursementType: "IN_APP_DISBURSEMENT",
    //         },
    //       ],
    //     },
    //     total: 2,
    //     page: 1,
    //     limit: 9,
    //     totalPages: 1,
    //     message: "All hotels retrieved successfully",
    //   };
    // },
    onSuccess: (response) => {
      if (response?.data) {
        setData(response.data.hotels);
        setTotalPages(response?.totalPages || 1);
      }
    },
    onError: (error: AxiosError) => {
      const message =
        (error.response?.data as ErrorResponseData)?.message ||
        "An unexpected error occurred";
      toast.error(message);
    },
  });

  useEffect(() => {
    getBusinesses();
  }, []);

  // const handleSearch = () => {
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden px-4 py-6">
      {/* Background triangles */}
      <div className="absolute inset-0 overflow-hidden z-10">
        <div
          className="absolute top-0 left-0 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] bg-[#FFE2CC]"
          style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] bg-[#CDE9F4]"
          style={{ clipPath: "polygon(100% 100%, 0 100%, 100% 0)" }}
        />
      </div>

      {/* Header */}
      <div className="text-center mb-8 z-20 relative px-4">
        <Image
          src="/logo.svg"
          alt="Anli logo"
          width={120}
          height={70}
          className="mx-auto mb-5"
        />
        <h1 className="text-2xl sm:text-[32px] font-medium text-black">
          Welcome Back
        </h1>
        <p className="text-sm sm:text-md text-black font-medium">
          All Businesses in our system
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-10 z-20 relative">
        <SearchWithIcon
          onChange={(e) => setQuery(e.target.value)}
          value={query}
        />
      </div>
      {isPending ? (
        <div className="flex items-center gap-3">
          <Spinner>Loading...</Spinner>
        </div>
      ) : data?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto z-20 relative px-4">
          {filtered.map((b, idx) => (
            <div
              key={idx}
              className="bg-white border rounded-2xl py-4 px-5 text-center transition-all border-gray-200 hover:border-[#F47411] cursor-pointer"
              style={{
                boxShadow:
                  "0px 1px 3px 0px #F4E7DD0F, 0px 3px 2px 0px #0000001A",
              }}
            >
              <Image
                src={b?.coverImage || "/sample-company.png"}
                alt={b.name}
                width={70}
                height={70}
                className="mx-auto mb-3 object-contain"
              />
              <h2 className="font-medium text-lg sm:text-xl text-black hover:text-[#F47411]">
                {b.name}
              </h2>
              <p className="text-sm sm:text-md text-gray-500 font-normal">
                {b.address}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center">
          Please check back later, no Hotels were found
        </p>
      )}

      {data?.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
