import { useMemo, useState } from "react";
import { CustomDialog } from "./common/CustomDialog";
import { InputField } from "./common/form";
import { Button } from "./ui/button";
import { TextAreaInput } from "./common/TextAreaInput";
import { CustomSheet } from "./common/CustomSheet";
import useSWR from "swr";
import fetcher from "@/app/actions/fetcher";
import { Module } from "@/types/module";
import { NewMultiSelect } from "./common/NewMultiSelect";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { toast } from "react-toastify";
import { createSubscriptionPlan } from "@/app/actions/subscriptions";

export const AddSubscriptionPlan = ({ refetch }: { refetch: () => void }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    maxRooms: "10",
    maxStaff: "10",
    supportLevel: "none",
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (
        formData.name == "" ||
        formData.description == "" ||
        formData.price == ""
      ) {
        toast.error("Please fill all fields");
        return;
      }

      const payload = {
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

      await createSubscriptionPlan(payload);

      toast.success("Subscription plan created successfully");
      setFormData({
        name: "",
        price: "",
        description: "",
        maxRooms: "10",
        maxStaff: "10",
        supportLevel: "none",
      });
      refetch();
      setIsDrawerOpen(false);
    } catch (error) {
      if (typeof error === "string") toast.error(error);
      else toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const roomOptions = [
    { value: "10", label: "10 Rooms" },
    { value: "15", label: "15 Rooms" },
    { value: "16-40", label: "16-40 Rooms" },
    { value: "unlimited", label: "Unlimited " },
  ];

  const staffOptions = [
    { value: "10", label: "10 Staff" },
    { value: "15", label: "15 Staff" },
    { value: "16-40", label: "16-40 Staff" },
    { value: "unlimited", label: "Unlimited Staff" },
  ];

  const supportOptions = [
    { value: "none", label: "None" },
    { value: "basic", label: "Basic Support" },
    { value: "premium", label: "Premium Support" },
  ];

  return (
    <CustomSheet
      loading={loading}
      open={isDrawerOpen}
      confirmBtnTitle="Create"
      onComplete={handleSubmit}
      setOpen={setIsDrawerOpen}
      title="Add Subscription Plan"
      trigger={<Button>Add Plan</Button>}
      subTitle="Input the details of the plan below"
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
          className="min-h-24"
          onChange={handleFormInput}
          value={formData.description}
          placeholder="Input a description of the plan benefits"
        />

        {/* Max Rooms Radio Group */}
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

        {/* Max Staff Radio Group */}
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

        {/* Support Level Radio Group */}
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
