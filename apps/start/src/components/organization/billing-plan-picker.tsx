import type { IServiceOrganization } from '@flarepanel/core';
import type { IPolarProduct } from '@flarepanel/payments';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckIcon, Loader2Icon, LockIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  formatEventVolume,
  monthlyEquivalent,
  recommendedPlanId,
} from './billing-plans';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNumber } from '@/hooks/use-numer-formatter';
import { useTRPC } from '@/integrations/trpc/react';
import { cn } from '@/utils/cn';
import { op } from '@/utils/op';

interface Props {
  organization: IServiceOrganization;
  currentProduct: IPolarProduct | null;
  onComplete?: () => void;
  // Switches the host modal to the cancel flow; the cancel action only
  // renders when provided.
  onCancel?: () => void;
  defaultInterval?: 'year' | 'month';
}

const getPrice = (product: IPolarProduct) => {
  return product.prices[0] && 'priceAmount' in product.prices[0]
    ? product.prices[0].priceAmount / 100
    : 0;
};

const PolarLogo = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    height="300"
    viewBox="0 0 300 300"
    width="300"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_1_4)">
      <path
        clip-rule="evenodd"
        d="M66.4284 274.26C134.876 320.593 227.925 302.666 274.258 234.219C320.593 165.771 302.666 72.7222 234.218 26.3885C165.77 -19.9451 72.721 -2.0181 26.3873 66.4297C-19.9465 134.877 -2.01938 227.927 66.4284 274.26ZM47.9555 116.67C30.8375 169.263 36.5445 221.893 59.2454 256.373C18.0412 217.361 7.27564 150.307 36.9437 92.318C55.9152 55.2362 87.5665 29.3937 122.5 18.3483C90.5911 36.7105 62.5549 71.8144 47.9555 116.67ZM175.347 283.137C211.377 272.606 244.211 246.385 263.685 208.322C293.101 150.825 282.768 84.4172 242.427 45.2673C264.22 79.7626 269.473 131.542 252.631 183.287C237.615 229.421 208.385 265.239 175.347 283.137ZM183.627 266.229C207.945 245.418 228.016 210.604 236.936 168.79C251.033 102.693 232.551 41.1978 195.112 20.6768C214.97 47.3945 225.022 99.2902 218.824 157.333C214.085 201.724 200.814 240.593 183.627 266.229ZM63.7178 131.844C49.5155 198.43 68.377 260.345 106.374 280.405C85.9962 254.009 75.5969 201.514 81.8758 142.711C86.5375 99.0536 99.4504 60.737 116.225 35.0969C92.2678 55.983 72.5384 90.4892 63.7178 131.844ZM199.834 149.561C200.908 217.473 179.59 272.878 152.222 273.309C124.853 273.742 101.797 219.039 100.724 151.127C99.6511 83.2138 120.968 27.8094 148.337 27.377C175.705 26.9446 198.762 81.648 199.834 149.561Z"
        fill="currentColor"
        fill-rule="evenodd"
      />
    </g>
    <defs>
      <clipPath id="clip0_1_4">
        <rect fill="white" height="300" width="300" />
      </clipPath>
    </defs>
  </svg>
);

export default function BillingPlanPicker({
  organization,
  currentProduct,
  onComplete,
  onCancel,
  defaultInterval,
}: Props) {
  const number = useNumber();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const productsQuery = useQuery(
    trpc.subscription.products.queryOptions({
      organizationId: organization.id,
    })
  );
  // Monthly is the default: it is the price people expect to compare. Yearly
  // is one click away and says what it saves. Existing subscribers land on
  // their current interval.
  const [recurringInterval, setRecurringInterval] = useState<'year' | 'month'>(
    defaultInterval ??
      ((organization.subscriptionInterval as 'year' | 'month') || 'month')
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    organization.subscriptionProductId || null
  );
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);
  const products = productsQuery.data || [];
  // Only treat a product as selected while it belongs to the displayed
  // interval. Opening the picker preset to yearly for a monthly subscriber
  // (or toggling the interval) must not keep the monthly plan "selected" —
  // that would render the cancel action under a list it isn't part of.
  const selectedProduct = products.find(
    (product) =>
      product.id === selectedProductId &&
      product.recurringInterval === recurringInterval
  );

  // No current plan to compare against → a plan row is the buy button (straight
  // to Polar checkout). When changing an existing plan we keep the select→confirm
  // step so the user sees the current→new price comparison.
  const directCheckout = !currentProduct;

  const plans = products
    .filter((product) =>
      // `free` no longer exists in the SDK's amountType union, but
      // retired free-plan products can still come back from Polar's API.
      product.prices.some((p) => (p.amountType as string) !== 'free')
    )
    .filter((product) => product.metadata.eventsLimit)
    .filter((product) => product.recurringInterval === recurringInterval)
    .map((product) => {
      const limit = Number(product.metadata.eventsLimit);
      return {
        product,
        id: product.id,
        limit,
        price: getPrice(product),
        // A plan smaller than what was already used cannot be chosen.
        disabled:
          (limit > 0 && organization.subscriptionPeriodEventsCount >= limit) ||
          !!product.disabled,
      };
    });
  const recommendedId = recommendedPlanId(
    plans,
    organization.subscriptionPeriodEventsCount
  );

  // Someone without a plan starts with the one that fits already picked, so
  // the page opens on an answer, not a list. Re-picked when the interval
  // changes, because monthly and yearly plans are different products.
  // biome-ignore lint/correctness/useExhaustiveDependencies: only when the fit changes
  useEffect(() => {
    if (directCheckout && recommendedId) {
      setSelectedProductId(recommendedId);
    }
  }, [directCheckout, recommendedId]);

  const checkoutMutation = useMutation(
    trpc.subscription.checkout.mutationOptions({
      onSuccess(data) {
        if (data?.url) {
          window.location.href = data.url;
        } else {
          setPendingProductId(null);
          queryClient.invalidateQueries(
            trpc.organization.get.queryOptions({
              organizationId: organization.id,
            })
          );

          queryClient.invalidateQueries(
            trpc.subscription.getCurrent.queryOptions({
              organizationId: organization.id,
            })
          );
          toast.success('Subscription updated', {
            description: 'It might take a few seconds to update',
          });
          onComplete?.();
        }
      },
      onError(error) {
        setPendingProductId(null);
        toast.error(error.message);
      },
    })
  );

  const startCheckout = (product: IPolarProduct) => {
    setPendingProductId(product.id);
    op.track('subscription_checkout_started', {
      organizationId: organization.id,
      limit: product.metadata.eventsLimit,
      price: getPrice(product),
    });
    checkoutMutation.mutate({
      organizationId: organization.id,
      productPriceId: product.prices[0].id,
      productId: product.id,
    });
  };

  const handleCheckout = () => {
    if (!selectedProduct || checkoutMutation.isPending) {
      return;
    }
    startCheckout(selectedProduct);
  };

  const handleCancelSubscription = () => {
    op.track('cancel_flow_opened', {
      organizationId: organization.id,
    });
    onCancel?.();
  };

  const renderAction = () => {
    if (!selectedProduct) {
      return null;
    }

    const isCurrentProduct = selectedProduct.id === currentProduct?.id;

    if (isCurrentProduct && organization.isActive && onCancel) {
      return (
        <Button
          className="mt-4 w-full"
          onClick={handleCancelSubscription}
          size="lg"
          variant="destructive"
        >
          Cancel subscription
        </Button>
      );
    }

    const payLabel = (() => {
      if (
        organization.isCanceled ||
        organization.isWillBeCanceled ||
        organization.isExpired
      ) {
        return isCurrentProduct
          ? 'Reactivate subscription'
          : 'Change subscription';
      }

      if (currentProduct) {
        return 'Change subscription';
      }

      return 'Pay with Polar';
    })();

    // A checkout click charges the card via Polar, so the button must lock
    // while the request is in flight — otherwise each extra click is another
    // charge attempt.
    const isCheckingOut = checkoutMutation.isPending;

    return (
      <button
        className={cn(
          'group mt-4 w-full overflow-hidden rounded-lg transition-all',
          isCheckingOut ? 'cursor-wait opacity-70' : 'hover:translate-y-[-1px]'
        )}
        disabled={isCheckingOut}
        onClick={handleCheckout}
        type="button"
      >
        {currentProduct && (
          <div className="row justify-between rounded-t-lg border-border border-t border-r border-l bg-def-200 p-2 px-4 line-through transition-colors group-hover:bg-def-100">
            <span>{currentProduct?.name}</span>
            <span>{number.currency(getPrice(currentProduct))}</span>
          </div>
        )}
        <div
          className={cn(
            'row justify-between border-border border-t border-r border-l bg-def-200 p-2 px-4 transition-colors group-hover:bg-def-100',
            !currentProduct && 'rounded-t-lg'
          )}
        >
          <span>{selectedProduct.name}</span>
          <span>{number.currency(getPrice(selectedProduct))}</span>
        </div>
        <div className="center-center row gap-4 bg-primary p-4 text-primary-foreground transition-colors group-hover:bg-primary/90">
          {isCheckingOut ? (
            <Loader2Icon className="size-6 animate-spin" />
          ) : (
            <PolarLogo className="size-6" />
          )}
          <span className="font-semibold">{payLabel}</span>
        </div>
      </button>
    );
  };

  return (
    <>
      <div className="col shrink-0 gap-4">
        {currentProduct && (
          <div className="font-medium">
            Your current usage is{' '}
            {number.format(organization.subscriptionPeriodEventsCount)} out of{' '}
            {number.format(Number(currentProduct?.metadata.eventsLimit))}{' '}
            events.{' '}
            <span className="text-muted-foreground">
              You cannot downgrade if your usage exceeds the limit of the new
              plan.
            </span>
          </div>
        )}
        <div className="row flex-wrap items-center justify-between gap-3">
          <div
            aria-label="Billing period"
            className="inline-flex rounded-lg border bg-def-100 p-1"
            role="group"
          >
            {(['month', 'year'] as const).map((interval) => (
              <button
                aria-pressed={recurringInterval === interval}
                className={cn(
                  'row items-center gap-2 rounded-md px-3 py-1.5 font-medium text-sm transition-colors',
                  recurringInterval === interval
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                key={interval}
                onClick={() => setRecurringInterval(interval)}
                type="button"
              >
                {interval === 'month' ? 'Monthly' : 'Yearly'}
                {interval === 'year' && (
                  <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-600 text-xs dark:text-emerald-400">
                    2 months free
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">
            {recurringInterval === 'year'
              ? 'Pay for 10 months, get 12.'
              : 'Every feature is in every plan. You only pick a volume.'}
          </p>
        </div>
      </div>
      <div
        aria-label="Plans"
        className="col min-h-0 divide-y divide-border overflow-y-auto rounded-lg border"
        role="radiogroup"
      >
        {productsQuery.isLoading && (
          <div className="center-center p-8 text-muted-foreground">
            <Loader2Icon className="size-5 animate-spin" />
          </div>
        )}
        {plans.map(({ product, limit, price, disabled }) => {
          const isSelected =
            selectedProductId === product.id && !!selectedProduct;
          const isCurrent = currentProduct?.id === product.id;
          const perMonth =
            recurringInterval === 'year' ? monthlyEquivalent(price) : price;
          return (
            <button
              aria-checked={isSelected}
              className={cn(
                'group row shrink-0 items-center gap-3 p-4 py-3 text-left transition-colors',
                isSelected ? 'bg-def-200' : 'hover:bg-def-100',
                disabled && '!cursor-not-allowed opacity-50'
              )}
              disabled={disabled || checkoutMutation.isPending}
              key={product.id}
              onClick={() => setSelectedProductId(product.id)}
              role="radio"
              type="button"
            >
              <span
                className={cn(
                  'center-center size-4 shrink-0 rounded-full border',
                  isSelected
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-muted-foreground/40'
                )}
              >
                {isSelected && <CheckIcon className="size-2.5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="row flex-wrap items-center gap-2">
                  <span className="font-semibold tabular-nums">
                    {formatEventVolume(limit)}
                  </span>
                  <span className="text-muted-foreground">events a month</span>
                  {product.id === recommendedId && (
                    <Badge variant="success">Fits your usage</Badge>
                  )}
                  {isCurrent && <Badge variant="secondary">Current plan</Badge>}
                </span>
                {disabled && !product.disabled && (
                  <span className="block text-muted-foreground text-xs">
                    You have already used more than this.
                  </span>
                )}
              </span>
              <span className="shrink-0 text-right">
                <span className="font-semibold tabular-nums">
                  {number.currency(perMonth)}
                </span>
                <span className="text-muted-foreground"> / month</span>
                {recurringInterval === 'year' && (
                  <span className="block text-muted-foreground text-xs">
                    {number.currency(price)} billed yearly
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      {directCheckout && (
        <div className="col shrink-0 gap-3">
          <Button
            className="w-full"
            disabled={!selectedProduct}
            loading={checkoutMutation.isPending}
            onClick={handleCheckout}
            size="lg"
          >
            {selectedProduct
              ? `Continue with ${formatEventVolume(Number(selectedProduct.metadata.eventsLimit))} events for ${number.currency(getPrice(selectedProduct))} a ${recurringInterval}`
              : 'Pick a plan to continue'}
          </Button>
          <p className="row flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-muted-foreground text-xs">
            <span className="row items-center gap-1">
              <LockIcon className="size-3" />
              Secure checkout by Polar
            </span>
            <span>First payment refundable for 14 days</span>
            <span>Cancel any time</span>
          </p>
        </div>
      )}
      {!directCheckout && <div className="shrink-0">{renderAction()}</div>}
    </>
  );
}
