// 订单状态枚举
export const OrderStatus = {
    PENDING_PAYMENT: "PENDING_PAYMENT",    // 待付款
    PAID: "PAID",                         // 已付款
    SHIPPED: "SHIPPED",                   // 已发货
    DELIVERED: "DELIVERED",               // 已送达
    COMPLETED: "COMPLETED",               // 已完成
    CANCELLED: "CANCELLED",               // 已取消
    REFUNDED: "REFUNDED"                  // 已退款
  } as const;
  
  // 支付方式枚举
  export const PaymentMethod = {
    CREDIT_CARD: "CREDIT_CARD",          // 信用卡
    DEBIT_CARD: "DEBIT_CARD",           // 借记卡
    PAYPAL: "PAYPAL",                    // PayPal
    VENMO: "VENMO"                       // Venmo
  } as const;

  // 消息类型枚举
  export const MessageType = {
    TEXT: "TEXT",
    IMAGE: "IMAGE",
    POST: "POST"
  } as const;

  // 配送方式枚举
  export const DeliveryType = {
    HOME_DELIVERY: "HOME_DELIVERY",
    PICKUP: "PICKUP",
    BOTH: "BOTH"
  } as const;

  // 商品状态枚举
  export const PostCondition = {
    LIKE_NEW: "LIKE_NEW",
    GENTLY_USED: "GENTLY_USED",
    MINOR_SCRATCHES: "MINOR_SCRATCHES",
    STAINS: "STAINS",
    NEEDS_REPAIR: "NEEDS_REPAIR",
  } as const;

  // 商品分类枚举
  export const PostCategory = {
    LIVING_ROOM_FURNITURE: "LIVING_ROOM_FURNITURE",
    BEDROOM_FURNITURE: "BEDROOM_FURNITURE",
    DINING_ROOM_FURNITURE: "DINING_ROOM_FURNITURE",
    OFFICE_FURNITURE: "OFFICE_FURNITURE",
    OUTDOOR_FURNITURE: "OUTDOOR_FURNITURE",
    STORAGE: "STORAGE",
    OTHER: "OTHER"
  } as const;
  