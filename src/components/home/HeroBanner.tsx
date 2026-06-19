import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchJimatshopCampaigns } from "@/lib/api/jimatshopCampaigns";

export const HeroBanner = () => {
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["jimatshop-campaigns", "hero"],
    queryFn: () => fetchJimatshopCampaigns({ status: "active", limit_count: 1 }),
  });

  const campaign = data?.data?.[0];

  const handleAction = () => {
    if (campaign?.id) {
      navigate(`/campaigns/${campaign.id}`);
      return;
    }
    navigate("/products");
  };

  return (
    <section
      className="relative overflow-hidden bg-hero-gradient rounded-2xl mx-4 my-4 p-6 animate-fade-in"
      style={campaign?.cover_image_url ? { backgroundImage: `url(${campaign.cover_image_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {campaign?.cover_image_url && (
        <div className="absolute inset-0 bg-black/10" />
      )}
      <div className="relative flex items-end justify-center z-10 h-[320px] md:h-[260px]">
      
        <Button className="group" onClick={handleAction}>
          {campaign ? "View Campaign" : "Shop Now"}
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

    </section>
  );
};
