import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { fetchCampaignInventories, fetchJimatshopCampaigns } from "@/lib/api/jimatshopCampaigns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InventoryCard } from "@/components/inventory/InventoryCard";

const formatDate = (dateString: string) => {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const JimatshopCampaignDetails = () => {
  const { campaignId } = useParams();

  const { data: campaignResp, isLoading: campaignLoading } = useQuery({
    queryKey: ["jimatshop-campaign", campaignId],
    enabled: Boolean(campaignId),
    queryFn: () => fetchJimatshopCampaigns({ campaign_id: campaignId, status: "all", limit_count: 1 }),
  });

  const { data: inventoryResp, isLoading: inventoryLoading } = useQuery({
    queryKey: ["jimatshop-campaign-inventories", campaignId],
    enabled: Boolean(campaignId),
    queryFn: () => fetchCampaignInventories(campaignId!, { limit_count: 200 }),
  });

  const campaign = campaignResp?.data?.[0];
  const inventories = inventoryResp?.data || [];

  const statusBadge = useMemo(() => {
    if (!campaign) return null;
    const now = new Date();
    const start = new Date(campaign.start_date);
    const end = new Date(campaign.end_date);
    if (now < start) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Upcoming</Badge>;
    }
    if (now > end) {
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Ended</Badge>;
    }
    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
  }, [campaign]);

  const participatingOutlets = useMemo(() => {
    const byBuyerId = new Map<string, { id: string; name: string; address?: string | null }>();
    inventories.forEach((item) => {
      if (!item.buyer_id) return;
      if (!byBuyerId.has(item.buyer_id)) {
        byBuyerId.set(item.buyer_id, {
          id: item.buyer_id,
          name: item.buyer_name || "Outlet",
          address: item.buyer_address || null,
        });
      }
    });
    return Array.from(byBuyerId.values());
  }, [inventories]);

  if (!campaignId) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Campaign not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-5">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">
            {campaignLoading ? "Loading campaign..." : campaign?.title || "Campaign"}
          </h1>
          {statusBadge}
        </div>
        <p className="text-sm text-muted-foreground">
          {campaign?.subtitle || "Browse products from participating outlets."}
        </p>
        <p className="text-xs text-muted-foreground">
          {campaign ? `${formatDate(campaign.start_date)} - ${formatDate(campaign.end_date)}` : ""}
        </p>
      </div>

      {campaign?.cover_image_url && (
        <img
          src={campaign.cover_image_url}
          alt={campaign.title}
          className="h-48 w-full rounded-xl object-cover"
        />
      )}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Participating Outlets</h2>
        {inventoryLoading ? (
          <p className="text-sm text-muted-foreground">Loading outlets...</p>
        ) : participatingOutlets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No outlets available for this campaign yet.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
            {participatingOutlets.map((outlet) => (
              <div
                key={outlet.id}
                className="flex-none w-[calc((100%-3*0.75rem)/4)] min-w-[120px] rounded-xl border bg-white p-3 shadow-sm snap-start"
              >
                <div className="text-xs font-semibold text-foreground line-clamp-2">{outlet.name}</div>
                {outlet.address && (
                  <div className="text-[10px] text-muted-foreground mt-1 line-clamp-3">
                    {outlet.address}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Participating Products</h2>
        <Button variant="outline" size="sm" onClick={() => window.history.back()}>
          Back
        </Button>
      </div>


      {inventoryLoading ? (
        <p className="text-sm text-muted-foreground">Loading inventory...</p>
      ) : inventories.length === 0 ? (
        <p className="text-sm text-muted-foreground">No inventory available for this campaign yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {inventories.map((item, index) => (
            <div key={item.inventory_id} className="relative">
              {item.promo_price != null && (
                <span className="absolute top-2 left-2 z-10 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-white">
                  Promo RM{Number(item.promo_price).toFixed(2)}
                </span>
              )}
              <InventoryCard
                inventoryId={item.inventory_id}
                productId={item.product_id}
                productName={item.product_name}
                buyerName={item.buyer_name}
                price={item.promo_price ?? item.retail_price}
                stockLevel={item.stock_level}
                coverImageUrl={item.cover_image_url}
                delay={index * 40}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JimatshopCampaignDetails;

