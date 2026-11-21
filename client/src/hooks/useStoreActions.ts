import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { useCallback } from "react";
import { toast } from "sonner";

/** Cart / favourite actions shared by product cards, detail page and wishlist. */
export function useStoreActions() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const favIds = trpc.favorites.ids.useQuery(undefined, { enabled: isAuthenticated });

  const addMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.count.invalidate();
      utils.cart.list.invalidate();
    },
    onError: e => toast.error(e.message),
  });

  const toggleMutation = trpc.favorites.toggle.useMutation({
    onMutate: async ({ productId }) => {
      await utils.favorites.ids.cancel();
      const prev = utils.favorites.ids.getData();
      utils.favorites.ids.setData(undefined, old =>
        old?.includes(productId) ? old.filter(id => id !== productId) : [...(old ?? []), productId],
      );
      return { prev };
    },
    onError: (e, _v, ctx) => {
      utils.favorites.ids.setData(undefined, ctx?.prev);
      toast.error(e.message);
    },
    onSuccess: ({ added }) => {
      toast(added ? "أُضيفت القطعة إلى المفضلة" : "أُزيلت القطعة من المفضلة");
    },
    onSettled: () => {
      utils.favorites.ids.invalidate();
      utils.favorites.list.invalidate();
    },
  });

  const requireLogin = useCallback(
    (message: string) => {
      if (isAuthenticated) return true;
      toast(message, {
        description: "سجّلي الدخول لنحفظ اختياراتك في حسابك.",
        action: { label: "تسجيل الدخول", onClick: () => startLogin() },
      });
      return false;
    },
    [isAuthenticated],
  );

  const addToCart = useCallback(
    async (productId: number, color = "", quantity = 1) => {
      if (!requireLogin("الحقيبة بانتظارك")) return false;
      await addMutation.mutateAsync({ productId, color, quantity });
      toast.success("أُضيفت القطعة إلى حقيبة التسوق");
      return true;
    },
    [addMutation, requireLogin],
  );

  const toggleFavorite = useCallback(
    (productId: number) => {
      if (!requireLogin("احفظي ما يلفت نظرك")) return;
      toggleMutation.mutate({ productId });
    },
    [toggleMutation, requireLogin],
  );

  const isFavorite = useCallback((productId: number) => favIds.data?.includes(productId) ?? false, [favIds.data]);

  return { addToCart, toggleFavorite, isFavorite, adding: addMutation.isPending };
}
