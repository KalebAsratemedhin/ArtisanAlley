import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem as ICartItem, useCartStore } from "@/lib/store/cart";

interface CartItemProps {
  item: ICartItem;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();

  const handleQuantityChange = (change: number) => {
    const newQuantity = item.quantity + change;
    if (newQuantity < 1) {
      removeItem(item.id);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  return (
    <div className="flex gap-4 py-4">
      <div className="relative aspect-square h-24 w-24 min-w-[96px] overflow-hidden rounded-md">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div className="space-y-1">
            <h3 className="font-medium">{item.title}</h3>
            <p className="text-sm text-muted-foreground">
              ${item.price.toFixed(2)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => removeItem(item.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-auto">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(-1)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 