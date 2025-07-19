"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { FormDataProps, LoginResponse } from "./types";
import { toast } from "react-toastify";
import { useRouter } from "next13-progressbar";
import { AxiosError } from "axios";
import { ErrorResponseData } from "@/hooks/types";
import { axiosPost } from "../lib/api";
import { useUser } from "@/context/userContext";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useUser();

  const router = useRouter();

  const [formData, setFormData] = useState<FormDataProps>({
    email: undefined,
    password: undefined,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { email, password } = formData;

      if (email?.trim() === "" || password?.trim() === "") {
        toast.warning("Email and password must not be empty");
      }

      return await axiosPost<LoginResponse>(
        "/auth/super-admin/login",
        {
          email,
          password,
        },
        {
          currentPath: "/login",
        }
      );
    },
    onSuccess: (response) => {
      if (response?.data) {
        toast.success(response?.message || "Login successful");
        setUser({
          id: response.data.id,
          email: response.data.email,
          fullName: response.data.fullName,
          profileImage: response.data.profileImage,
          status: response.data.status,
          roleId: response.data.roleId,
        });
        router.push("/business-list");
      } else {
        toast.error(
          response?.message || "Login failed. Please check your credentials."
        );
      }
    },
    onError: (error: AxiosError) => {
      const message =
        (error.response?.data as ErrorResponseData)?.message ||
        "An unexpected error occurred";
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-[#FFE2CC] relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      {/* Background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* bottom-left grey polygon */}
        <div
          className="
            absolute
            -left-32     /* pushes it partly outside the canvas */
            -bottom-28   /* idem, so only the upper part is visible */
            w-[520px]    /* big enough to survive every breakpoint */
            h-[420px]
            bg-[#E4DBD6] /* light-grey fill */
            rounded-[22px]
            -rotate-[9deg] /* gentle tilt, matches screenshot */
          "
          style={{
            /* top edge almost horizontal, right edge goes straight down  */
            clipPath: "polygon(0 12%, 100% 25%, 68% 100%, 0 100%)",
          }}
        />

        {/* top-right peach polygon */}
        <div
          className="
            absolute
            -top-32
            -right-32
            w-[540px]
            h-[540px]
            bg-[#F0D6C3]
            opacity-90  /* a tad of transparency */
          "
          style={{
            /* vertical right edge, diagonal to the left-bottom corner    */
            clipPath: "polygon(100% 0, 100% 100%, 0 70%)",
          }}
        />
      </div>

      {/* Centered login container */}
      <div className="flex-1 flex flex-col items-center justify-center w-full z-20">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/logo.svg"
            width={140}
            height={80}
            alt="Anli Logo"
            className="w-[120px] sm:w-[140px] h-auto mx-auto"
          />
        </div>

        <div className="bg-[#F9ECE1] p-6 sm:p-8 rounded-2xl shadow-md border border-app-secondary w-full max-w-md">
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block mb-1 text-[14px] font-medium text-[#070707]"
              >
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Frank@Hotellagrand.com"
                className="h-[50px] sm:h-[53px]"
                onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block mb-1 text-[14px] font-medium text-[#070707]"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="h-[50px] sm:h-[53px]"
                  onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? (
                    <EyeOffIcon size={18} />
                  ) : (
                    <EyeIcon size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              disabled={isPending}
              className="w-full bg-app-primary hover:bg-app-primary text-white text-base font-medium rounded-md h-11"
            >
              {isPending ? "Please wait" : "Continue"}
            </Button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 z-10">
        <p className="text-[14px] text-[#070707] font-normal">
          &copy; Anli {new Date().getFullYear()} All copyright reserved
        </p>
      </footer>
    </div>
  );
}
