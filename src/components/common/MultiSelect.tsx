import { cva, type VariantProps } from "class-variance-authority";
import {
  CheckIcon,
  ChevronDown,
  WandSparkles,
  XCircle,
  XIcon,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils/utils";
import { Button } from "../ui/button";

const multiSelectVariants = cva("m-1 transition ease-in-out delay-150", {
  variants: {
    variant: {
      default:
        "border-foreground/10 text-foreground bg-orion-blue hover:bg-orion-blue/80",
      secondary:
        "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive:
        "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      inverted: "inverted",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  onValueChange: (value: string[]) => void;
  defaultValue?: string[];
  placeholder?: string;
  animation?: number;
  maxCount?: number;
  modalPopover?: boolean;
  asChild?: boolean;
  className?: string;
  label?: string;
}

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      placeholder = "Select options",
      animation = 0,
      maxCount = 3,
      modalPopover = false,
      //asChild = false,
      className,
      label,
      ...props
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _ref, // intentionally unused
  ) => {
    console.log(_ref);
    const [internalSelectedValues, setInternalSelectedValues] =
      React.useState<string[]>(defaultValue);
    const isControlled = typeof props.value !== "undefined";
    const selectedValues = isControlled
      ? (props.value as string[])
      : internalSelectedValues;
    const setValues = isControlled ? onValueChange : setInternalSelectedValues;
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [isAnimating, setIsAnimating] = React.useState(false);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (event.key === "Enter") {
        setIsPopoverOpen(true);
      } else if (event.key === "Backspace" && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues];
        newSelectedValues.pop();
        setValues(newSelectedValues);
      }
    };

    const toggleOption = (option: string) => {
      const newSelectedValues = selectedValues.includes(option)
        ? selectedValues.filter((value) => value !== option)
        : [...selectedValues, option];
      setValues(newSelectedValues);
    };

    const handleClear = () => {
      setValues([]);
    };

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev);
    };

    const clearExtraOptions = () => {
      const newSelectedValues = selectedValues.slice(0, maxCount);
      setValues(newSelectedValues);
    };

    const toggleAll = () => {
      if (selectedValues.length === options.length) {
        handleClear();
      } else {
        const allValues = options.map((option) => option.value);
        setValues(allValues);
      }
    };

    return (
      <div>
        <div className="text-sm font-medium text-muted-foreground mb-1">
          {label}
        </div>

        <Popover
          open={isPopoverOpen}
          onOpenChange={setIsPopoverOpen}
          modal={modalPopover}
        >
          <PopoverTrigger className="mt-0" asChild>
            <Button
              ref={buttonRef}
              {...props}
              onClick={handleTogglePopover}
              className={cn(
                "flex w-full p-1 mt-0 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit [&_svg]:pointer-events-auto",
                className,
              )}
            >
              {selectedValues.length > 0 ? (
                <div className="flex justify-between items-center w-full">
                  <div className="flex flex-wrap items-center">
                    {selectedValues.slice(0, maxCount).map((value) => {
                      const option = options.find((o) => o.value === value);
                      const IconComponent = option?.icon;
                      return (
                        <Badge
                          key={value}
                          className={cn(
                            multiSelectVariants({
                              variant,
                            }),
                            "border-orion-blue hover:bg-white hover:animate-none bg-white text-orion-blue shadow-content1",
                          )}
                          style={{
                            animationDuration: `${animation}s`,
                          }}
                        >
                          {IconComponent && (
                            <IconComponent className="h-4 w-4 mr-2" />
                          )}
                          <span className="w-fit lg:max-w-54 truncate">
                            {option?.label}
                          </span>
                          <XCircle
                            className="ml-2 h-4 w-4 cursor-pointer"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleOption(value);
                            }}
                          />
                        </Badge>
                      );
                    })}
                    {selectedValues.length > maxCount && (
                      <Badge
                        className={cn(
                          "bg-transparent text-foreground border-foreground/1 hover:bg-transparent",
                          multiSelectVariants({
                            variant,
                          }),
                        )}
                        style={{
                          animationDuration: `${animation}s`,
                        }}
                      >
                        {`+ ${selectedValues.length - maxCount} more`}
                        <XCircle
                          className="ml-2 h-4 w-4 cursor-pointer"
                          onClick={(event) => {
                            event.stopPropagation();
                            clearExtraOptions();
                          }}
                        />
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <XIcon
                      className="h-4 mx-2 cursor-pointer text-muted-foreground"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleClear();
                      }}
                    />
                    <Separator
                      orientation="vertical"
                      className="flex min-h-6 h-full"
                    />
                    <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full mx-auto">
                  <span className="text-sm text-muted-foreground mx-3">
                    {placeholder}
                  </span>
                  <ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
                </div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="p-0"
            align="start"
            style={{
              width: buttonRef.current ? buttonRef.current.offsetWidth : "100%",
              minWidth: buttonRef.current
                ? buttonRef.current.offsetWidth
                : undefined,
            }}
            onEscapeKeyDown={() => setIsPopoverOpen(false)}
          >
            <Command
              className="w-full max-h-[50vh]"
              onWheel={() => {
                if (inputRef.current) {
                  inputRef.current.blur();
                }
              }}
            >
              <CommandInput
                ref={inputRef}
                placeholder="Search..."
                onKeyDown={handleInputKeyDown}
              />
              <CommandList className="overflow-y-auto">
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    key="all"
                    onSelect={toggleAll}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        selectedValues.length === options.length
                          ? "bg-orion-blue text-white border-orion-blue"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </div>
                    <span>(Select All)</span>
                  </CommandItem>
                  {options.map((option) => {
                    const isSelected = selectedValues.includes(option.value);
                    return (
                      <CommandItem
                        key={option.value}
                        onSelect={() => toggleOption(option.value)}
                        className="cursor-pointer"
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            isSelected
                              ? "bg-orion-blue text-white border-orion-blue"
                              : "opacity-50 [&_svg]:invisible",
                          )}
                        >
                          <CheckIcon className="h-4 w-4" />
                        </div>
                        {option.icon && (
                          <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                        )}
                        <span>{option.label}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <div className="flex items-center justify-between">
                    {selectedValues.length > 0 && (
                      <>
                        <CommandItem
                          onSelect={handleClear}
                          className="flex-1 justify-center cursor-pointer"
                        >
                          Clear
                        </CommandItem>
                        <Separator
                          orientation="vertical"
                          className="flex min-h-6 h-full"
                        />
                      </>
                    )}
                    <CommandItem
                      onSelect={() => setIsPopoverOpen(false)}
                      className="flex-1 justify-center cursor-pointer max-w-full"
                    >
                      Close
                    </CommandItem>
                  </div>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
          {animation > 0 && selectedValues.length > 0 && (
            <WandSparkles
              className={cn(
                "cursor-pointer my-2 text-foreground bg-background w-3 h-3",
                isAnimating ? "" : "text-muted-foreground",
              )}
              onClick={() => setIsAnimating(!isAnimating)}
            />
          )}
        </Popover>
      </div>
    );
  },
);
MultiSelect.displayName = "MultiSelect";
