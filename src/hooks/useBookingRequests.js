import { useState, useEffect, useCallback } from "react";
import { databases } from "@/lib/appwrite";
import { Query, ID } from "appwrite";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL = env.collectionBookingRequests || "booking_requests";
const COL_EXPERIENCES = env.collectionExperiences;
const COL_ACTIVITY = env.collectionAdminActivityLogs || "admin_activity_logs";

// ─── Status helpers ─────────────────────────────────────────────────────────

export const REQUEST_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-800" },
  { value: "reviewing", label: "Reviewing", color: "bg-blue-100 text-blue-800" },
  { value: "approved", label: "Approved", color: "bg-emerald-100 text-emerald-800" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
  { value: "converted", label: "Converted", color: "bg-purple-100 text-purple-800" },
];

export const VALID_TRANSITIONS = {
  pending: ["reviewing", "rejected"],
  reviewing: ["approved", "rejected"],
  approved: ["converted"],
  rejected: [],
  converted: [],
};

export function getStatusBadgeClass(status) {
  return REQUEST_STATUSES.find((s) => s.value === status)?.color || "bg-gray-100 text-gray-800";
}

export function getStatusLabel(status) {
  return REQUEST_STATUSES.find((s) => s.value === status)?.label || status;
}

// ─── List hook ──────────────────────────────────────────────────────────────

export function useBookingRequests({ status = "", search = "", limit = 25, offset = 0 } = {}) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queries = [Query.orderDesc("$createdAt"), Query.limit(limit), Query.offset(offset)];
      if (status) queries.push(Query.equal("status", status));
      if (search) queries.push(Query.search("contactName", search));

      const result = await databases.listDocuments(DB, COL, queries);

      // Enrich with experience name in parallel
      const experienceIds = [...new Set(result.documents.map((d) => d.experienceId).filter(Boolean))];
      const experienceMap = {};
      if (experienceIds.length > 0) {
        const expResult = await databases.listDocuments(DB, COL_EXPERIENCES, [
          Query.equal("$id", experienceIds),
          Query.limit(100),
          Query.select(["$id", "publicName", "slug"]),
        ]);
        for (const exp of expResult.documents) {
          experienceMap[exp.$id] = exp;
        }
      }

      const enriched = result.documents.map((doc) => ({
        ...doc,
        _experience: experienceMap[doc.experienceId] || null,
      }));

      setData(enriched);
      setTotal(result.total);
    } catch (err) {
      setError(err.message || "Failed to load booking requests");
    } finally {
      setLoading(false);
    }
  }, [status, search, limit, offset]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, total, loading, error, refetch: fetch };
}

// ─── Count of new requests ──────────────────────────────────────────────────

export function useNewRequestCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    databases
      .listDocuments(DB, COL, [Query.equal("status", "pending"), Query.limit(1)])
      .then((result) => {
        if (!cancelled) setCount(result.total);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return count;
}

// ─── Single request detail ──────────────────────────────────────────────────

export function useBookingRequestDetail(id) {
  const [request, setRequest] = useState(null);
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const doc = await databases.getDocument(DB, COL, id);
      setRequest(doc);

      if (doc.experienceId) {
        try {
          const exp = await databases.getDocument(DB, COL_EXPERIENCES, doc.experienceId);
          setExperience(exp);
        } catch {
          // Experience may have been deleted
        }
      }
    } catch {
      setError("not_found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { request, experience, loading, error, refetch: fetch };
}

// ─── Create (public form) ───────────────────────────────────────────────────

export async function createBookingRequest(payload) {
  const data = {
    experienceId: payload.experienceId,
    contactName: payload.contactName.trim(),
    contactEmail: payload.contactEmail.trim().toLowerCase(),
    contactPhone: payload.contactPhone ? payload.contactPhone.trim() : null,
    participants: Number(payload.participants) || 1,
    message: payload.message ? payload.message.trim() : null,
    status: "pending",
  };
  if (payload.requestedDate) data.requestedDate = payload.requestedDate;
  if (payload.userId) data.userId = payload.userId;
  if (payload.editionId) data.editionId = payload.editionId;

  return databases.createDocument(DB, COL, ID.unique(), data);
}

// ─── Update status (admin) ──────────────────────────────────────────────────

export async function updateBookingRequestStatus(id, newStatus, { adminNotes, quotedAmount, adminUserId } = {}) {
  const current = await databases.getDocument(DB, COL, id);
  const allowed = VALID_TRANSITIONS[current.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Cannot transition from ${current.status} to ${newStatus}`);
  }

  const updateData = { status: newStatus };
  if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
  if (quotedAmount !== undefined) updateData.quotedAmount = quotedAmount;
  if (["approved", "rejected"].includes(newStatus)) updateData.respondedAt = new Date().toISOString();

  const updated = await databases.updateDocument(DB, COL, id, updateData);

  // Log activity
  if (adminUserId) {
    try {
      await databases.createDocument(DB, COL_ACTIVITY, ID.unique(), {
        userId: adminUserId,
        action: `booking-request-${newStatus}`,
        entityType: "booking_request",
        entityId: id,
        details: JSON.stringify({ previousStatus: current.status, newStatus, quotedAmount }),
      });
    } catch {
      // Non-fatal
    }
  }

  return updated;
}

// ─── Update admin notes / quoted amount ──────────────────────────────────────

export async function updateBookingRequestFields(id, fields) {
  const allowed = {};
  if (fields.adminNotes !== undefined) allowed.adminNotes = fields.adminNotes;
  if (fields.quotedAmount !== undefined) allowed.quotedAmount = fields.quotedAmount;
  if (fields.convertedOrderId !== undefined) allowed.convertedOrderId = fields.convertedOrderId;
  return databases.updateDocument(DB, COL, id, allowed);
}
