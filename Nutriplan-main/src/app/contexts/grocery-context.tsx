import { createContext, useContext, useState, ReactNode } from "react";

export interface GroceryItem {
  id: string;
  name: string;
  amount: string;
  category: string;
  checked: boolean;
}

interface GroceryContextType {
  groceryItems: GroceryItem[];
  addItem: (name: string, amount: string, category: string) => void;
  removeItem: (id: string) => void;
  toggleItem: (id: string) => void;
}

const GroceryContext = createContext<GroceryContextType | undefined>(undefined);

const defaultGroceryItems: GroceryItem[] = [
  { id: "1", name: "Chicken Breast", amount: "1.5 kg", category: "Proteins", checked: false },
  { id: "2", name: "Salmon Fillets", amount: "800g", category: "Proteins", checked: true },
  { id: "3", name: "Greek Yogurt", amount: "4 containers", category: "Proteins", checked: false },
  { id: "4", name: "Eggs", amount: "2 dozen", category: "Proteins", checked: false },
  { id: "5", name: "Broccoli", amount: "500g", category: "Vegetables", checked: false },
  { id: "6", name: "Spinach", amount: "300g", category: "Vegetables", checked: true },
  { id: "7", name: "Bell Peppers", amount: "6 pieces", category: "Vegetables", checked: false },
  { id: "8", name: "Brown Rice", amount: "2kg", category: "Grains", checked: false },
  { id: "9", name: "Quinoa", amount: "500g", category: "Grains", checked: true },
  { id: "10", name: "Blueberries", amount: "400g", category: "Fruits", checked: false },
  { id: "11", name: "Bananas", amount: "1 bunch", category: "Fruits", checked: false },
  { id: "12", name: "Avocados", amount: "6 pieces", category: "Fruits", checked: true },
  { id: "13", name: "Olive Oil", amount: "1 bottle", category: "Pantry", checked: false },
  { id: "14", name: "Honey", amount: "1 jar", category: "Pantry", checked: true },
];

export function GroceryProvider({ children }: { children: ReactNode }) {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>(defaultGroceryItems);

  const addItem = (name: string, amount: string, category: string) => {
    const newItem: GroceryItem = {
      id: Date.now().toString(),
      name,
      amount,
      category,
      checked: false,
    };
    setGroceryItems((prev) => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    setGroceryItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleItem = (id: string) => {
    setGroceryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  return (
    <GroceryContext.Provider value={{ groceryItems, addItem, removeItem, toggleItem }}>
      {children}
    </GroceryContext.Provider>
  );
}

export function useGrocery() {
  const context = useContext(GroceryContext);
  if (!context) {
    throw new Error("useGrocery must be used within GroceryProvider");
  }
  return context;
}