import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, X, ArrowLeft, Calendar } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { resolveShopperId } from "@/lib/api/shopper";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatJimatshopOrderNumber } from "@/lib/orders/formatOrderNumber";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  checked: boolean;
  product_id: string;
  refund_qty: number;
}

interface OrderData {
  id: string;
  buyer_id: string;
  shopper_id: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  status: string;
  refund_status?: string | null;
  delivery_date?: string | null;
}

export default function RefundRequest() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const id = orderId ?? "";

  useEffect(() => {
    async function fetchOrderData() {
      if (!id || !user) return;

      setLoading(true);
      try {
        const shopperId = await resolveShopperId({ authUserId: user.id, email: user.email });
        if (!shopperId) {
          toast.error("Shopper profile not found");
          setLoading(false);
          return;
        }

        // 1. Fetch order details
        const { data: orderData, error: orderErr } = await supabase
          .from("jimatshop_orders")
          .select("id, status, total_amount, created_at, updated_at, shopper_id, buyer_id, refund_status")
          .eq("id", id)
          .maybeSingle();

        if (orderErr) throw orderErr;
        if (!orderData) {
          toast.error("Order not found");
          setLoading(false);
          return;
        }

        if (orderData.shopper_id !== shopperId) {
          toast.error("Unauthorized to access this order");
          setLoading(false);
          return;
        }

        // 2. Fetch deliveries to find delivery date
        let deliveryDate: string | null = null;
        const { data: deliveries, error: delErr } = await supabase
          .from("jimatshop_deliveries")
          .select("delivery_date")
          .eq("jimatshop_order_id", id)
          .order("updated_at", { ascending: false })
          .limit(1);

        if (!delErr && deliveries && deliveries.length > 0) {
          deliveryDate = deliveries[0].delivery_date;
        }

        setOrder({
          id: orderData.id,
          buyer_id: orderData.buyer_id,
          shopper_id: orderData.shopper_id,
          total_amount: Number(orderData.total_amount),
          created_at: orderData.created_at,
          updated_at: orderData.updated_at,
          status: orderData.status,
          refund_status: orderData.refund_status,
          delivery_date: deliveryDate,
        });

        // 3. Fetch order items
        const { data: itemRows, error: itemsErr } = await supabase
          .from("jimatshop_order_items")
          .select("id, quantity, unit_price, subtotal, buyer_inventory_id")
          .eq("order_id", id);

        if (itemsErr) throw itemsErr;

        if (itemRows && itemRows.length > 0) {
          // Fetch product names for items
          const inventoryIds = itemRows.map(r => r.buyer_inventory_id).filter(Boolean);
          let inventoryMap = new Map<string, { product_id: string; product_name: string }>();

          if (inventoryIds.length > 0) {
            const { data: inventories, error: invErr } = await supabase
              .from("buyer_inventories")
              .select("id, product_id")
              .in("id", inventoryIds);

            if (!invErr && inventories) {
              const productIds = inventories.map(i => i.product_id).filter(Boolean);
              
              if (productIds.length > 0) {
                const { data: products, error: prodErr } = await supabase
                  .from("products")
                  .select("id, name")
                  .in("id", productIds);

                if (!prodErr && products) {
                  const productMap = new Map(products.map(p => [p.id, p.name]));
                  inventories.forEach(inv => {
                    inventoryMap.set(inv.id, {
                      product_id: inv.product_id,
                      product_name: productMap.get(inv.product_id) || "Product",
                    });
                  });
                }
              }
            }
          }

          const mappedItems: OrderItem[] = itemRows.map((it: any) => {
            const invInfo = inventoryMap.get(it.buyer_inventory_id);
            return {
              id: it.id,
              name: invInfo?.product_name || "Item",
              price: Number(it.unit_price) || 0,
              quantity: it.quantity || 0,
              subtotal: Number(it.subtotal) || 0,
              checked: false,
              product_id: invInfo?.product_id || "",
              refund_qty: 0,
            };
          });

          setItems(mappedItems);
        }
      } catch (error) {
        console.error("Error loading order data:", error);
        toast.error("Failed to load order data");
      } finally {
        setLoading(false);
      }
    }

    fetchOrderData();
  }, [id, user]);

  // Eligibility calculation (7 days window)
  const completedDate = order?.delivery_date ? new Date(order.delivery_date) : (order ? new Date(order.updated_at) : null);
  const currentDate = new Date();
  const daysDifference = completedDate
    ? Math.floor((currentDate.getTime() - completedDate.getTime()) / (1000 * 3600 * 24))
    : 0;
  const daysLeft = 7 - daysDifference;
  const hasExistingRefund = order?.refund_status === "pending" || order?.refund_status === "approved" || order?.refund_status === "refunded";
  const isEligible = order?.status === "completed" && completedDate && daysLeft > 0 && !hasExistingRefund;

  const toggleItem = (itemId: string) => {
    setItems(items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked, refund_qty: !item.checked ? item.quantity : 0 } : item
    ));
  };

  const handleRefundQtyChange = (itemId: string, qty: number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(0, Math.min(qty, item.quantity));
        return {
          ...item,
          refund_qty: newQty,
          checked: newQty > 0,
        };
      }
      return item;
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    const files = e.target.files;
    if (!files) return;

    const fileList = Array.from(files);
    if (fileList.length > 3) {
      setUploadError("Maximum 3 images allowed");
      return;
    }

    const invalid = fileList.filter(f => !f.type.startsWith("image/") || f.size > 5 * 1024 * 1024);
    if (invalid.length > 0) {
      setUploadError("Only images up to 5MB are allowed");
      return;
    }

    setUploadedFiles(fileList);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const selectedTotal = items
    .filter(item => item.checked)
    .reduce((sum, item) => sum + (item.refund_qty * item.price), 0);

  const uploadEvidence = async (): Promise<string[]> => {
    if (uploadedFiles.length === 0) return [];
    setIsUploading(true);
    const urls: string[] = [];

    try {
      for (const file of uploadedFiles) {
        const uniqueName = `${crypto.randomUUID()}-${file.name.replace(/\s/g, "_")}`;
        const filePath = `shopper-refund-${id}/${uniqueName}`;

        const { data, error } = await supabase.storage
          .from("refunds")
          .upload(filePath, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from("refunds")
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          urls.push(urlData.publicUrl);
        }
      }
      return urls;
    } catch (e) {
      console.error("Storage upload error:", e);
      throw new Error("Failed to upload evidence files");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    if (!items.some(it => it.checked && it.refund_qty > 0)) {
      toast.error("Please select at least one item to refund");
      return;
    }

    if (!reason) {
      toast.error("Please select a reason");
      return;
    }

    if (!description.trim()) {
      toast.error("Please provide a description");
      return;
    }

    setIsSubmitting(true);
    try {
      const evidenceUrls = await uploadEvidence();

      // Create jimatshop_refund_requests
      const { data: refundReq, error: reqErr } = await supabase
        .from("jimatshop_refund_requests")
        .insert({
          jimatshop_order_id: id,
          shopper_id: order.shopper_id,
          buyer_id: order.buyer_id,
          refund_reason: reason,
          refund_description: description,
          refund_amount: selectedTotal,
          refund_evidence: evidenceUrls,
          status: "pending",
          payment_method: "jimatcoins",
        })
        .select()
        .single();

      if (reqErr) throw reqErr;

      // Create jimatshop_refund_items
      const refundItemsPayload = items
        .filter(it => it.checked && it.refund_qty > 0)
        .map(it => ({
          refund_request_id: refundReq.id,
          jimatshop_order_id: id,
          jimatshop_order_item_id: it.id,
          shopper_id: order.shopper_id,
          buyer_id: order.buyer_id,
          product_id: it.product_id,
          product_name: it.name,
          ordered_qty: it.quantity,
          refund_qty: it.refund_qty,
          unit_price: it.price,
          refund_amount: it.refund_qty * it.price,
          status: "pending",
        }));

      const { error: itemsErr } = await supabase
        .from("jimatshop_refund_items")
        .insert(refundItemsPayload);

      if (itemsErr) throw itemsErr;

      // Update jimatshop_orders.refund_status
      const { error: orderUpdateErr } = await supabase
        .from("jimatshop_orders")
        .update({ refund_status: "pending" })
        .eq("id", id);

      if (orderUpdateErr) throw orderUpdateErr;

      toast.success("Refund request submitted successfully");
      navigate(`/orders/${id}`);
    } catch (err: any) {
      console.error("Submit refund error:", err);
      toast.error(err.message || "Failed to submit refund request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatMYR = (val: number) =>
    new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" }).format(val);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header />
        <main className="px-4 py-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header />
        <main className="px-4 py-4">
          <Alert variant="destructive">
            <AlertDescription>Order details not found.</AlertDescription>
          </Alert>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      <main className="px-4 py-4 max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Back"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Request Refund</h2>
            <p className="text-xs text-muted-foreground">
              Storefront Order {formatJimatshopOrderNumber(order.id)}
            </p>
          </div>
        </div>

        {!isEligible ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                {hasExistingRefund ? (
                  order.refund_status === "pending"
                    ? "A refund request is already pending approval for this order."
                    : order.refund_status === "approved" || order.refund_status === "refunded"
                    ? "A refund has already been completed/approved for this order."
                    : "Your refund request was rejected."
                ) : order.status !== "completed" ? (
                  "Only completed orders are eligible for refunds."
                ) : (
                  "Refund requests must be submitted within 7 days of order completion/delivery."
                )}
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate(-1)} className="w-full" data-testid="back-to-order-btn">
              Back to Order Details
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
              <Calendar className="h-4 w-4 text-yellow-800" />
              <AlertDescription className="text-xs">
                You have {daysLeft} {daysLeft === 1 ? "day" : "days"} left to request a refund. Reimbursements will be credited as Jimatshop Coins.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-semibold">Select items to refund</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {items.map(item => (
                  <div key={item.id} className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`chk-${item.id}`}
                        checked={item.checked}
                        onCheckedChange={() => toggleItem(item.id)}
                        data-testid={`select-item-checkbox-${item.id}`}
                        className="mt-1"
                      />
                      <div>
                        <Label htmlFor={`chk-${item.id}`} className="font-medium text-sm block cursor-pointer">
                          {item.name}
                        </Label>
                        <span className="text-xs text-muted-foreground block mt-0.5">
                          Price: {formatMYR(item.price)} | Max Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max={item.quantity}
                        value={item.refund_qty || ""}
                        disabled={!item.checked}
                        onChange={e => handleRefundQtyChange(item.id, parseInt(e.target.value) || 0)}
                        className="w-16 h-8 text-center"
                        data-testid={`refund-qty-input-${item.id}`}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-semibold">Refund Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Refund</Label>
                  <Select required onValueChange={setReason} value={reason}>
                    <SelectTrigger id="reason" data-testid="refund-reason-select">
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="damaged">Damaged Product</SelectItem>
                      <SelectItem value="wrong_item">Wrong Item Received</SelectItem>
                      <SelectItem value="missing">Missing Item</SelectItem>
                      <SelectItem value="quality">Poor Quality</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    placeholder="Provide details about the issue"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                    data-testid="refund-description-textarea"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="evidence">Evidence Images (Required, Max 3)</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="evidence"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      required={uploadedFiles.length === 0}
                      className="hidden"
                      data-testid="refund-evidence-input"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("evidence")?.click()}
                      data-testid="upload-evidence-btn"
                    >
                      <Upload className="h-4 w-4 mr-2" /> Upload Images
                    </Button>
                    <span className="text-xs text-muted-foreground">{uploadedFiles.length} files selected</span>
                  </div>

                  {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}

                  {uploadedFiles.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="relative aspect-square border rounded-lg overflow-hidden group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`evidence-preview-${idx}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="absolute top-1 right-1 bg-destructive/80 text-destructive-foreground p-1 rounded-full hover:bg-destructive transition-colors"
                            data-testid={`remove-preview-btn-${idx}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4 flex justify-between items-center">
                <div>
                  <span className="text-xs text-muted-foreground block">Estimated Refund Total</span>
                  <span className="text-lg font-bold text-green-600 block">{formatMYR(selectedTotal)}</span>
                </div>
                <Button
                  type="submit"
                  disabled={selectedTotal === 0 || isSubmitting || isUploading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid="submit-refund-btn"
                >
                  {isSubmitting || isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </CardContent>
            </Card>
          </form>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
