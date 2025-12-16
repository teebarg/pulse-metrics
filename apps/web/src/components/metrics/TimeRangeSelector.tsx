import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TimeRangeSelectorProps {
    selected: string;
    onChange: (range: string) => void;
    className?: string;
}

const ranges = [
    { value: "1h", label: "1H" },
    { value: "6h", label: "6H" },
    { value: "24h", label: "24H" },
    { value: "7d", label: "7D" },
    { value: "30d", label: "30D" },
];

export function TimeRangeSelector({ selected, onChange, className }: TimeRangeSelectorProps) {
    return (
        <div className={cn("inline-flex rounded-lg bg-secondary p-1", className)}>
            {ranges.map((range) => (
                <Button
                    key={range.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => onChange(range.value)}
                    className={cn(
                        "px-3 py-1.5 text-xs font-medium transition-all",
                        selected === range.value
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                    )}
                >
                    {range.label}
                </Button>
            ))}
        </div>
    );
}
