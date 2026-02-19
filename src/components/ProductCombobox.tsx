import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface Product {
    id: string;
    name: string;
    sku: string;
    defaultPrice: number;
    unit: string;
}

interface ProductComboboxProps {
    products: Product[];
    value?: string;
    onSelect: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

export function ProductCombobox({ products, value, onSelect, disabled, placeholder = "เลือกสินค้า" }: ProductComboboxProps) {
    const [open, setOpen] = React.useState(false)

    const selectedProduct = products.find((product) => product.id === value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal border-gray-200 bg-white"
                    disabled={disabled}
                >
                    {selectedProduct ? selectedProduct.name : <span className="text-muted-foreground">{placeholder}</span>}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 z-[100] bg-white w-[var(--radix-popover-trigger-width)] min-w-[300px]" align="start">
                <Command className="w-full">
                    <CommandInput placeholder="ค้นหาสินค้า..." className="h-9" />
                    <CommandList className="max-h-[200px] overflow-y-auto">
                        <CommandEmpty>No product found.</CommandEmpty>
                        <CommandGroup>
                            {products.map((product) => (
                                <CommandItem
                                    key={product.id}
                                    value={`${product.name} ${product.sku}`} // Search by name and sku
                                    onSelect={(currentValue) => {
                                        // CommandItem lowercases value, but we need ID.
                                        // Actually onSelect gives the value prop. 
                                        // To get ID back, we should probably just use ID in onSelect logic or closure.
                                        onSelect(product.id)
                                        setOpen(false)
                                    }}
                                    keywords={[product.name, product.sku]}
                                    className="cursor-pointer"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === product.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span>{product.name}</span>
                                        <span className="text-xs text-gray-400">{product.sku}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
