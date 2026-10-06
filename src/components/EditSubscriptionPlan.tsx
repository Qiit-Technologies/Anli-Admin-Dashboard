import { useEffect, useMemo, useState } from "react";
import { CustomSheet } from "./common/CustomSheet";
import { InputField } from "./common/form";
import { TextAreaInput } from "./common/TextAreaInput";
import { SubscriptionPlan } from "@/types/subscriptions";
import useSWR from "swr";
import fetcher from "@/app/actions/fetcher";
import { Module } from "@/types/module";
import { NewMultiSelect } from "./common/NewMultiSelect";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { toast } from "react-toastify";
import { updateSubscriptionPlan } from "@/app/actions/subscriptions";
import {
  roomOptions,
  staffOptions,
  supportOptions,
} from "@/data.ts/subscription";

interface EditSubscriptionPlanProps {
  isOpen: boolean;
  setOpen: (val: boolean) => void;
  plan: SubscriptionPlan;
  refetch: () => void;
}

export const EditSubscriptionPlan = ({
  isOpen,
  setOpen,
  plan,
  refetch,
}: EditSubscriptionPlanProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: plan.name,
    price: plan.price.toString(),
    description: plan.description,
    maxRooms:
      plan.features?.maxRooms === -1
        ? "unlimited"
        : plan.features?.maxRooms?.toString() || "10",
    maxStaff:
      plan.features?.maxStaff === -1
        ? "unlimited"
        : plan.features?.maxStaff?.toString() || "10",
    supportLevel: plan.features?.supportLevel || "none",
  });

  const { data: modulesData } = useSWR(
    "/modules/public-modules",
    (url: string) => fetcher<Module[]>(url),
  );

  const modules = useMemo(() => modulesData ?? [], [modulesData]);

  const handleFormInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRadioChange = (name: string) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditPlan = async () => {
    setLoading(true);
    try {
      if (
        formData.name === "" ||
        formData.description === "" ||
        formData.price === ""
      ) {
        toast.error("Please fill all fields");
        return;
      }

      const payload = {
        id: plan.id,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        features: {
          moduleAllowed: selectedModules,
          maxRooms:
            formData.maxRooms === "unlimited"
              ? -1
              : parseInt(formData.maxRooms),
          maxStaff:
            formData.maxStaff === "unlimited"
              ? -1
              : parseInt(formData.maxStaff),
          supportLevel: formData.supportLevel,
        },
      };

      await updateSubscriptionPlan(plan.id, payload);

      toast.success("Subscription plan updated successfully");
      refetch();
      setOpen(false);
    } catch (error: any) {
      if (typeof error === "string") toast.error(error);
      else toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (plan?.features?.moduleAllowed && modules.length > 0) {
      const selected = plan?.features?.moduleAllowed
        .map((mid) => String(mid))
        .filter((id: string) =>
          modules.some((mod: Module) => String(mod.id) === id),
        );

      setSelectedModules(selected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modules, plan?.features?.moduleAllowed]);

  return (
    <CustomSheet
      open={isOpen}
      setOpen={setOpen}
      loading={loading}
      confirmBtnTitle="Update"
      onComplete={handleEditPlan}
      title="Edit Subscription Plan"
      onClose={() => setOpen(false)}
      subTitle="Update the details of the subscription plan below"
    >
      <div className="flex flex-col gap-3">
        <InputField
          id="name"
          name="name"
          label="Plan Name"
          placeholder="Input plan name"
          required={true}
          onChange={handleFormInput}
          value={formData.name}
        />

        <InputField
          id="price"
          name="price"
          label="Price"
          type="number"
          required={true}
          value={formData.price}
          onChange={handleFormInput}
          placeholder="Input a price for the plan"
        />

        <TextAreaInput
          id="description"
          name="description"
          label="Description"
          className="min-h-24 noscroll"
          onChange={handleFormInput}
          value={formData.description}
          placeholder="Input a description of the plan benefits"
        />

        <div className="space-y-2">
          <label htmlFor="maxRooms">Maximum Rooms</label>
          <RadioGroup
            onValueChange={handleRadioChange("maxRooms")}
            value={formData.maxRooms}
            id="maxRooms"
            className="flex flex-wrap gap-4"
          >
            {roomOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`rooms-${option.value}`}
                />
                <label htmlFor={`rooms-${option.value}`}>{option.label}</label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <label htmlFor="maxStaff">Maximum Staff</label>
          <RadioGroup
            onValueChange={handleRadioChange("maxStaff")}
            value={formData.maxStaff}
            id="maxStaff"
            className="flex flex-wrap gap-4"
          >
            {staffOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`staff-${option.value}`}
                />
                <label htmlFor={`staff-${option.value}`}>{option.label}</label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <label htmlFor="supportLevel">Support Level</label>
          <RadioGroup
            onValueChange={handleRadioChange("supportLevel")}
            value={formData.supportLevel}
            id="supportLevel"
            className="flex flex-wrap gap-4"
          >
            {supportOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`support-${option.value}`}
                />
                <label htmlFor={`support-${option.value}`}>
                  {option.label}
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <NewMultiSelect
          items={modules}
          value={selectedModules
            .map((id) => modules.find((m: Module) => m.id.toString() === id))
            .filter((m): m is Module => Boolean(m))}
          onChange={(items: Module[]) =>
            setSelectedModules(() => items.map((item) => item.id.toString()))
          }
          placeholder="Select modules"
          label="Allowed Modules"
          id="modules-multiselect"
          disabled={false}
          displayValue={(module: Module) => module.name}
          searchPlaceholder="Search modules..."
          maxSelectedDisplay={3}
        />
      </div>
    </CustomSheet>
  );
};
