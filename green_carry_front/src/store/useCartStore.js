import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      superTotalPrice: 0,
      deliveryPrice: 0,
      usingEcoPoint: 0,
      storeName: "",
      storeId: 0,
      finalCarbon: 0,

      // 장바구니 담기 (중복 체크 수정)
      addToCart: (newItem) =>
        set((state) => {
          const existingItemIndex = state.cart.findIndex((item) => {
            const isSameMenu = String(item.menuId) === String(newItem.menuId);

            const isSameOptions =
              JSON.stringify(item.options) === JSON.stringify(newItem.options);

            return isSameMenu && isSameOptions;
          });

          if (existingItemIndex !== -1) {
            const updatedCart = [...state.cart];
            updatedCart[existingItemIndex] = {
              ...updatedCart[existingItemIndex],
              quantity:
                Number(updatedCart[existingItemIndex].quantity) +
                Number(newItem.quantity || 1),

              // 단가는 유지
              savedCarbon: updatedCart[existingItemIndex].savedCarbon,
              totalPrice: updatedCart[existingItemIndex].totalPrice,
            };
            return { cart: updatedCart };
          }

          return { cart: [...state.cart, newItem] };
        }),

      clearCart: () =>
        set({
          cart: [],
          superTotalPrice: 0,
          deliveryPrice: 0,
          usingEcoPoint: 0,
          storeName: "",
          storeId: 0,
        }),

      // 수량 증가 (이름 options로 통일)
      increaseQuantity: (menuId, options) =>
        set((state) => ({
          cart: state.cart.map((c) =>
            String(c.menuId) === String(menuId) &&
            JSON.stringify(c.options) === JSON.stringify(options)
              ? { ...c, quantity: Number(c.quantity) + 1 }
              : c,
          ),
        })),

      //수량 감소 (이름 options로 통일)
      decreaseQuantity: (menuId, options) =>
        set((state) => ({
          cart: state.cart
            .map((c) =>
              String(c.menuId) === String(menuId) &&
              JSON.stringify(c.options) === JSON.stringify(options)
                ? { ...c, quantity: Number(c.quantity) - 1 }
                : c,
            )
            .filter((c) => c.quantity > 0),
        })),

      setSuperTotalPrice: (price) => set({ superTotalPrice: price }),
      setDeliveryPrice: (price) => set({ deliveryPrice: price }),
      setUsingEcoPoint: (price) => set({ usingEcoPoint: price }),

      setStoreName: (storeName) => set({ storeName: storeName }),
      setStoreId: (storeId) => set({ storeId: storeId }),
      setFinalCarbon: (finalCarbon) => set({ finalCarbon: finalCarbon }),

      getTotalSavedCarbon: () =>
        Math.round(
          get().cart.reduce(
            (sum, item) =>
              sum + Number(item.savedCarbon || 0) * Number(item.quantity || 0),
            0,
          ),
        ),
    }),
    {
      name: "cart-storage",
    },
  ),
);

export default useCartStore;
