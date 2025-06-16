'use client'

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { CartItem } from "@/lib/store/cart";

interface CartItemProps {
  item: CartItem;
  onRemove: (id: string) => void;
}

export function CartItem({ item, onRemove }: CartItemProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className="relative aspect-square h-16 w-16 overflow-hidden rounded-md">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-medium">{item.title}</h3>
            <p className="text-sm text-muted-foreground">
              {formatPrice(item.price)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onRemove(item.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
} 