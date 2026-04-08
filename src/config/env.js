const env = {
  // ─── Site ───
  siteUrl: import.meta.env.VITE_SITE_URL || "https://omzone.com",
  siteName: "OMZONE",

  // ─── Appwrite Core ───
  appwriteEndpoint:
    import.meta.env.VITE_APPWRITE_ENDPOINT || "https://aprod.racoondevs.com/v1",
  appwriteProjectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || "omzone-dev",
  appwriteDatabaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || "omzone_db",

  // ─── Collections ───
  collectionExperiences:
    import.meta.env.VITE_APPWRITE_COLLECTION_EXPERIENCES || "experiences",
  collectionEditions:
    import.meta.env.VITE_APPWRITE_COLLECTION_EDITIONS || "experience_editions",
  collectionPricingTiers:
    import.meta.env.VITE_APPWRITE_COLLECTION_PRICING_TIERS || "pricing_tiers",
  collectionPricingOptions:
    import.meta.env.VITE_APPWRITE_COLLECTION_PRICING_OPTIONS || "pricing_rules",
  collectionAddons: import.meta.env.VITE_APPWRITE_COLLECTION_ADDONS || "addons",
  collectionAddonAssignments:
    import.meta.env.VITE_APPWRITE_COLLECTION_ADDON_ASSIGNMENTS ||
    "addon_assignments",
  collectionPackages:
    import.meta.env.VITE_APPWRITE_COLLECTION_PACKAGES || "packages",
  collectionPackageItems:
    import.meta.env.VITE_APPWRITE_COLLECTION_PACKAGE_ITEMS || "package_items",
  collectionPasses: import.meta.env.VITE_APPWRITE_COLLECTION_PASSES || "passes",
  collectionUserPasses:
    import.meta.env.VITE_APPWRITE_COLLECTION_USER_PASSES || "user_passes",
  collectionPassConsumptions:
    import.meta.env.VITE_APPWRITE_COLLECTION_PASS_CONSUMPTIONS ||
    "pass_consumptions",
  collectionSlots: import.meta.env.VITE_APPWRITE_COLLECTION_SLOTS || "slots",
  collectionSlotResources:
    import.meta.env.VITE_APPWRITE_COLLECTION_SLOT_RESOURCES || "slot_resources",
  collectionResources:
    import.meta.env.VITE_APPWRITE_COLLECTION_RESOURCES || "resources",
  collectionLocations:
    import.meta.env.VITE_APPWRITE_COLLECTION_LOCATIONS || "locations",
  collectionRooms: import.meta.env.VITE_APPWRITE_COLLECTION_ROOMS || "rooms",
  collectionOrders: import.meta.env.VITE_APPWRITE_COLLECTION_ORDERS || "orders",
  collectionOrderItems:
    import.meta.env.VITE_APPWRITE_COLLECTION_ORDER_ITEMS || "order_items",
  collectionPayments:
    import.meta.env.VITE_APPWRITE_COLLECTION_PAYMENTS || "payments",
  collectionTickets:
    import.meta.env.VITE_APPWRITE_COLLECTION_TICKETS || "tickets",
  collectionRefunds:
    import.meta.env.VITE_APPWRITE_COLLECTION_REFUNDS || "refunds",
  collectionPublications:
    import.meta.env.VITE_APPWRITE_COLLECTION_PUBLICATIONS || "publications",
  collectionSections:
    import.meta.env.VITE_APPWRITE_COLLECTION_SECTIONS || "sections",
  collectionTags: import.meta.env.VITE_APPWRITE_COLLECTION_TAGS || "tags",
  collectionExperienceTags:
    import.meta.env.VITE_APPWRITE_COLLECTION_EXPERIENCE_TAGS ||
    "experience_tags",
  collectionUserProfiles:
    import.meta.env.VITE_APPWRITE_COLLECTION_USER_PROFILES || "user_profiles",
  collectionSettings:
    import.meta.env.VITE_APPWRITE_COLLECTION_SETTINGS || "settings",
  collectionBookingRequests:
    import.meta.env.VITE_APPWRITE_COLLECTION_BOOKING_REQUESTS ||
    "booking_requests",
  collectionAdminActivityLogs:
    import.meta.env.VITE_APPWRITE_COLLECTION_ADMIN_ACTIVITY_LOGS ||
    "admin_activity_logs",
  collectionNotificationTemplates:
    import.meta.env.VITE_APPWRITE_COLLECTION_NOTIFICATION_TEMPLATES ||
    "notification_templates",
  collectionContactMessages:
    import.meta.env.VITE_APPWRITE_COLLECTION_CONTACT_MESSAGES ||
    "contact_messages",

  // ─── Buckets ───
  bucketExperienceMedia:
    import.meta.env.VITE_APPWRITE_BUCKET_EXPERIENCE_MEDIA || "experience_media",
  bucketPublicationMedia:
    import.meta.env.VITE_APPWRITE_BUCKET_PUBLICATION_MEDIA ||
    "publication_media",
  bucketAddonImages:
    import.meta.env.VITE_APPWRITE_BUCKET_ADDON_IMAGES || "addon_images",
  bucketPackageImages:
    import.meta.env.VITE_APPWRITE_BUCKET_PACKAGE_IMAGES || "package_images",
  bucketUserAvatars:
    import.meta.env.VITE_APPWRITE_BUCKET_USER_AVATARS || "user_avatars",
  bucketDocuments:
    import.meta.env.VITE_APPWRITE_BUCKET_DOCUMENTS || "documents",
  bucketPublicResources:
    import.meta.env.VITE_APPWRITE_BUCKET_PUBLIC_RESOURCES || "public-resources",

  // ─── Functions ───
  functionCreateCheckout:
    import.meta.env.VITE_APPWRITE_FUNCTION_CREATE_CHECKOUT || "create-checkout",
  functionStripeWebhook:
    import.meta.env.VITE_APPWRITE_FUNCTION_STRIPE_WEBHOOK || "stripe-webhook",
  functionGenerateTicket:
    import.meta.env.VITE_APPWRITE_FUNCTION_GENERATE_TICKET || "generate-ticket",
  functionValidateTicket:
    import.meta.env.VITE_APPWRITE_FUNCTION_VALIDATE_TICKET || "validate-ticket",
  functionConsumePass:
    import.meta.env.VITE_APPWRITE_FUNCTION_CONSUME_PASS || "consume-pass",
  functionAssignLabel:
    import.meta.env.VITE_APPWRITE_FUNCTION_ASSIGN_LABEL || "assign-user-label",
  functionSendConfirmation:
    import.meta.env.VITE_APPWRITE_FUNCTION_SEND_CONFIRMATION ||
    "send-confirmation",
  functionSendReminder:
    import.meta.env.VITE_APPWRITE_FUNCTION_SEND_REMINDER || "send-reminder",
};

export default env;
