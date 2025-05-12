import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "@/lib/utils";

export type Option = {
  value: string | number;
  label: string;
  disabled?: boolean;
};

type MultiSelectProps = {
  options: Option[];
  selected: Option[];
  onChange: (options: Option[]) => void;
  placeholder?: string;
  className?: string;
};

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  className,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleUnselect = (index: number) => {
    const newSelected = [...selected];
    newSelected.splice(index, 1);
    onChange(newSelected);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current;
    if (input) {
      // Delete last selected item when backspace is pressed and input is empty
      if (e.key === "Backspace" && inputValue === "" && selected.length > 0) {
        handleUnselect(selected.length - 1);
      }
      
      // Force focus on input when typing
      if (e.key === "Escape") {
        input.blur();
        setOpen(false);
      }
    }
  };

  const selectables = options.filter(
    (option) => !selected.some((s) => s.value === option.value)
  );

  return (
    <Command
      onKeyDown={handleKeyDown}
      className={cn(
        "overflow-visible bg-transparent",
        className
      )}
    >
      <div
        className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      >
        <div className="flex flex-wrap gap-1">
          {selected.map((option, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="hover:bg-secondary"
            >
              {option.label}
              <button
                type="button"
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUnselect(index);
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => handleUnselect(index)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={selected.length === 0 ? placeholder : ""}
            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
          />
        </div>
      </div>
      <div className="relative">
        {open && selectables.length > 0 ? (
          <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup className="h-full overflow-auto max-h-[200px]">
              {selectables.map((option) => (
                <CommandItem
                  key={option.value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onSelect={() => {
                    setInputValue("");
                    onChange([...selected, option]);
                  }}
                  disabled={option.disabled}
                  className="cursor-pointer"
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ) : null}
      </div>
    </Command>
  );
}