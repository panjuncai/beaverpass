import { SerializedOrder } from "@/lib/types/order";
import NoDeal from "@/components/utils/no-deal";
import DealsOrderCard from "./deals-order-card";
import { BuyTabState, TabType } from "@/lib/types/enum";
export default function DealsTabBuy({
  activeTab,
  setActiveTab,
  buyTabState,
  setBuyTabState,
  activeOrders,
  historyOrders,
}: {
  activeTab: typeof TabType[keyof typeof TabType];
  setActiveTab: (tab: typeof TabType[keyof typeof TabType]) => void;
  buyTabState: typeof BuyTabState[keyof typeof BuyTabState];
  setBuyTabState: (tab: typeof BuyTabState[keyof typeof BuyTabState]) => void;
  activeOrders: SerializedOrder[];
  historyOrders: SerializedOrder[];
}) {
  return (
    <>
      <input
        type="radio"
        name="tabs_1"
        role="tab"
        className="tab text-primary font-bold text-xl"
        aria-label="Buy"
        checked={activeTab === TabType.BUY}
        onChange={() => setActiveTab(TabType.BUY)}
      />
      <div role="tabpanel" className="tab-content p-4 col-span-2">
        <div
          role="tablist"
          className="tabs tabs-boxed bg-base-100 grid grid-cols-2"
        >
          <input
            type="radio"
            name="tabs_buy"
            role="tab"
            className="tab flex-1 text-xl"
            aria-label="Active Orders"
            checked={buyTabState === BuyTabState.ACTIVE}
            onChange={() => setBuyTabState(BuyTabState.ACTIVE)}
          />
          <div role="tabpanel" className="tab-content rounded-box p-6 w-full">
            {activeOrders.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <NoDeal />
              </div>
            ) : (
              activeOrders.map((order) => (
                <DealsOrderCard key={order.id} order={order} />
              ))
            )}
          </div>

          <input
            type="radio"
            name="tabs_buy"
            role="tab"
            className="tab flex-1 text-xl"
            aria-label="History"
            checked={buyTabState === BuyTabState.HISTORY}
            onChange={() => setBuyTabState(BuyTabState.HISTORY)}
          />
          <div role="tabpanel" className="tab-content rounded-box p-6 w-full">
            {historyOrders.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <NoDeal />
              </div>
            ) : (
              historyOrders.map((order) => (
                <DealsOrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        </div>
      </div>
      
    </>
  );
}
