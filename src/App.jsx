import { Routes, Route, useLocation } from "react-router-dom";
import { Suspense, useEffect } from "react";
import lazyWithRetry from "@/lib/lazyWithRetry";

import PublicLayout from "@/layouts/PublicLayout";
import AuthLayout from "@/layouts/AuthLayout";

import {
  RequireAuth,
  RequireLabel,
  RedirectIfAuth,
  ProtectedRoute,
} from "@/routes/guards";
import { ROLES } from "@/constants/roles";

import { ExperienceDetailSkeleton } from "@/components/common/Skeleton";

// ─── Public pages (home loaded eagerly, rest lazy) ───
import HomePage from "@/pages/public/HomePage";

const AboutPage = lazyWithRetry(() => import("@/pages/public/AboutPage"));
const ContactPage = lazyWithRetry(() => import("@/pages/public/ContactPage"));
const PrivacyPage = lazyWithRetry(() => import("@/pages/public/PrivacyPage"));
const TermsPage = lazyWithRetry(() => import("@/pages/public/TermsPage"));
const ExperiencesListPage = lazyWithRetry(
  () => import("@/pages/public/ExperiencesListPage"),
);
const ExperienceDetailPage = lazyWithRetry(
  () => import("@/pages/public/ExperienceDetailPage"),
);
const PackageDetailPage = lazyWithRetry(
  () => import("@/pages/public/PackageDetailPage"),
);
const PublicationPage = lazyWithRetry(() => import("@/pages/public/PublicationPage"));
const CheckoutPage = lazyWithRetry(() => import("@/pages/public/CheckoutPage"));
const CheckoutSuccessPage = lazyWithRetry(
  () => import("@/pages/public/CheckoutSuccessPage"),
);
const CheckoutCancelPage = lazyWithRetry(
  () => import("@/pages/public/CheckoutCancelPage"),
);

// ─── Auth pages ───
const LoginPage = lazyWithRetry(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazyWithRetry(() => import("@/pages/auth/RegisterPage"));
const VerifyEmailPendingPage = lazyWithRetry(
  () => import("@/pages/auth/VerifyEmailPendingPage"),
);
const VerifyEmailPage = lazyWithRetry(() => import("@/pages/auth/VerifyEmailPage"));
const ForgotPasswordPage = lazyWithRetry(
  () => import("@/pages/auth/ForgotPasswordPage"),
);
const ResetPasswordPage = lazyWithRetry(() => import("@/pages/auth/ResetPasswordPage"));

// ─── Admin pages (chunked together) ───
const AdminLayout = lazyWithRetry(() => import("@/layouts/AdminLayout"));
const AdminDashboardPage = lazyWithRetry(
  () => import("@/pages/admin/AdminDashboardPage"),
);
const ExperienceListPage = lazyWithRetry(
  () => import("@/pages/admin/ExperienceListPage"),
);
const ExperienceCreatePage = lazyWithRetry(
  () => import("@/pages/admin/ExperienceCreatePage"),
);
const ExperienceEditPage = lazyWithRetry(
  () => import("@/pages/admin/ExperienceEditPage"),
);
const EditionListPage = lazyWithRetry(() => import("@/pages/admin/EditionListPage"));
const EditionCreatePage = lazyWithRetry(() => import("@/pages/admin/EditionCreatePage"));
const EditionEditPage = lazyWithRetry(() => import("@/pages/admin/EditionEditPage"));
const PricingTierListPage = lazyWithRetry(
  () => import("@/pages/admin/PricingTierListPage"),
);
const AddonListPage = lazyWithRetry(() => import("@/pages/admin/AddonListPage"));
const AddonCreatePage = lazyWithRetry(() => import("@/pages/admin/AddonCreatePage"));
const AddonEditPage = lazyWithRetry(() => import("@/pages/admin/AddonEditPage"));
const AddonAssignmentListPage = lazyWithRetry(
  () => import("@/pages/admin/AddonAssignmentListPage"),
);
const SlotListPage = lazyWithRetry(() => import("@/pages/admin/SlotListPage"));
const SlotCreatePage = lazyWithRetry(() => import("@/pages/admin/SlotCreatePage"));
const SlotEditPage = lazyWithRetry(() => import("@/pages/admin/SlotEditPage"));
const SlotQuickCreatePage = lazyWithRetry(
  () => import("@/pages/admin/SlotQuickCreatePage"),
);
const AgendaGlobalPage = lazyWithRetry(() => import("@/pages/admin/AgendaGlobalPage"));
const ResourcesPage = lazyWithRetry(
  () => import("@/pages/admin/resources/ResourcesPage"),
);
const ResourceCreatePage = lazyWithRetry(
  () => import("@/pages/admin/resources/ResourceCreatePage"),
);
const ResourceEditPage = lazyWithRetry(
  () => import("@/pages/admin/resources/ResourceEditPage"),
);
const LocationCreatePage = lazyWithRetry(
  () => import("@/pages/admin/resources/LocationCreatePage"),
);
const LocationEditPage = lazyWithRetry(
  () => import("@/pages/admin/resources/LocationEditPage"),
);
const RoomCreatePage = lazyWithRetry(
  () => import("@/pages/admin/resources/RoomCreatePage"),
);
const RoomEditPage = lazyWithRetry(() => import("@/pages/admin/resources/RoomEditPage"));
const OrderListPage = lazyWithRetry(() => import("@/pages/admin/OrderListPage"));
const OrderDetailPage = lazyWithRetry(() => import("@/pages/admin/OrderDetailPage"));
const AdminTicketListPage = lazyWithRetry(() => import("@/pages/admin/TicketListPage"));
const AdminTicketDetailPage = lazyWithRetry(
  () => import("@/pages/admin/TicketDetailPage"),
);
const MediaManagerPage = lazyWithRetry(() => import("@/pages/admin/MediaManagerPage"));
const ClientListPage = lazyWithRetry(() => import("@/pages/admin/ClientListPage"));
const ClientDetailPage = lazyWithRetry(() => import("@/pages/admin/ClientDetailPage"));
const SettingsPage = lazyWithRetry(() => import("@/pages/admin/SettingsPage"));
const AdminAccountPage = lazyWithRetry(() => import("@/pages/admin/AdminAccountPage"));
const CheckInPage = lazyWithRetry(() => import("@/pages/admin/CheckInPage"));
const PassListPage = lazyWithRetry(() => import("@/pages/admin/PassListPage"));
const PassCreatePage = lazyWithRetry(() => import("@/pages/admin/PassCreatePage"));
const PassEditPage = lazyWithRetry(() => import("@/pages/admin/PassEditPage"));
const UserPassListPage = lazyWithRetry(() => import("@/pages/admin/UserPassListPage"));
const UserPassDetailPage = lazyWithRetry(
  () => import("@/pages/admin/UserPassDetailPage"),
);
const PackageListPage = lazyWithRetry(() => import("@/pages/admin/PackageListPage"));
const PackageCreatePage = lazyWithRetry(() => import("@/pages/admin/PackageCreatePage"));
const PackageEditPage = lazyWithRetry(() => import("@/pages/admin/PackageEditPage"));
const PublicationListPage = lazyWithRetry(
  () => import("@/pages/admin/PublicationListPage"),
);
const PublicationCreatePage = lazyWithRetry(
  () => import("@/pages/admin/PublicationCreatePage"),
);
const PublicationEditPage = lazyWithRetry(
  () => import("@/pages/admin/PublicationEditPage"),
);
const PublicationSectionsPage = lazyWithRetry(
  () => import("@/pages/admin/PublicationSectionsPage"),
);
const AssistedSalePage = lazyWithRetry(
  () => import("@/pages/admin/sales/AssistedSalePage"),
);
const BookingRequestListPage = lazyWithRetry(
  () => import("@/pages/admin/BookingRequestListPage"),
);
const BookingRequestDetailPage = lazyWithRetry(
  () => import("@/pages/admin/BookingRequestDetailPage"),
);

// ─── Portal pages (chunked together) ───
const PortalLayout = lazyWithRetry(() => import("@/layouts/PortalLayout"));
const PortalDashboardPage = lazyWithRetry(
  () => import("@/pages/portal/PortalDashboardPage"),
);
const TicketListPage = lazyWithRetry(() => import("@/pages/portal/TicketListPage"));
const TicketDetailPage = lazyWithRetry(() => import("@/pages/portal/TicketDetailPage"));
const PortalOrdersPage = lazyWithRetry(() => import("@/pages/portal/PortalOrdersPage"));
const PortalOrderDetailPage = lazyWithRetry(
  () => import("@/pages/portal/PortalOrderDetailPage"),
);
const PortalPassesPage = lazyWithRetry(() => import("@/pages/portal/PortalPassesPage"));
const PassDetailPage = lazyWithRetry(() => import("@/pages/portal/PassDetailPage"));
const UsePassPage = lazyWithRetry(() => import("@/pages/portal/UsePassPage"));
const PortalProfilePage = lazyWithRetry(
  () => import("@/pages/portal/PortalProfilePage"),
);

// ─── Error pages ───
const NotFoundPage = lazyWithRetry(() => import("@/pages/NotFoundPage"));
const ForbiddenPage = lazyWithRetry(() => import("@/pages/ForbiddenPage"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-warm-gray border-t-charcoal" />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/experiences" element={<ExperiencesListPage />} />
            <Route
              path="/experiences/:slug"
              element={<ExperienceDetailPage />}
            />
            <Route path="/packages/:slug" element={<PackageDetailPage />} />
            <Route path="/p/:slug" element={<PublicationPage />} />
            <Route path="/forbidden" element={<ForbiddenPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Auth routes — redirect if already authenticated */}
          <Route element={<RedirectIfAuth />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>
          </Route>

          {/* Email verification — accessible without auth */}
          <Route element={<AuthLayout />}>
            <Route
              path="/verify-email-pending"
              element={<VerifyEmailPendingPage />}
            />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Checkout — requires auth, any label */}
          <Route element={<RequireAuth />}>
            <Route element={<PublicLayout />}>
              <Route path="/checkout" element={<CheckoutPage />} />
            </Route>
          </Route>

          {/* Checkout result — public (user may have lost session) */}
          <Route element={<PublicLayout />}>
            <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
            <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />
          </Route>

          {/* Admin routes — require auth + admin/root/operator label */}
          <Route
            element={
              <ProtectedRoute
                labels={[ROLES.ADMIN, ROLES.ROOT, ROLES.OPERATOR]}
              />
            }
          >
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="experiences" element={<ExperienceListPage />} />
              <Route
                path="experiences/new"
                element={<ExperienceCreatePage />}
              />
              <Route
                path="experiences/:id/edit"
                element={<ExperienceEditPage />}
              />
              <Route
                path="experiences/:id/editions"
                element={<EditionListPage />}
              />
              <Route
                path="experiences/:id/editions/new"
                element={<EditionCreatePage />}
              />
              <Route
                path="experiences/:id/editions/:editionId/edit"
                element={<EditionEditPage />}
              />
              <Route
                path="experiences/:id/pricing"
                element={<PricingTierListPage />}
              />
              <Route
                path="experiences/:id/addons"
                element={<AddonAssignmentListPage />}
              />
              <Route path="experiences/:id/slots" element={<SlotListPage />} />
              <Route
                path="experiences/:id/slots/create"
                element={<SlotCreatePage />}
              />
              <Route
                path="experiences/:id/slots/quick-create"
                element={<SlotQuickCreatePage />}
              />
              <Route
                path="experiences/:id/slots/:slotId/edit"
                element={<SlotEditPage />}
              />
              <Route path="addons" element={<AddonListPage />} />
              <Route path="addons/new" element={<AddonCreatePage />} />
              <Route path="addons/:addonId/edit" element={<AddonEditPage />} />
              <Route path="packages" element={<PackageListPage />} />
              <Route path="packages/new" element={<PackageCreatePage />} />
              <Route
                path="packages/:packageId/edit"
                element={<PackageEditPage />}
              />
              <Route path="passes" element={<PassListPage />} />
              <Route path="passes/new" element={<PassCreatePage />} />
              <Route path="passes/:passId/edit" element={<PassEditPage />} />
              <Route path="user-passes" element={<UserPassListPage />} />
              <Route
                path="user-passes/:userPassId"
                element={<UserPassDetailPage />}
              />
              <Route path="slots" element={<AgendaGlobalPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="resources/new" element={<ResourceCreatePage />} />
              <Route path="resources/:id/edit" element={<ResourceEditPage />} />
              <Route path="locations/new" element={<LocationCreatePage />} />
              <Route path="locations/:id/edit" element={<LocationEditPage />} />
              <Route path="rooms/new" element={<RoomCreatePage />} />
              <Route path="rooms/:id/edit" element={<RoomEditPage />} />
              {/* Assisted sale — admin/root only */}
              <Route
                element={<RequireLabel labels={[ROLES.ADMIN, ROLES.ROOT]} />}
              >
                <Route path="sales/new" element={<AssistedSalePage />} />
              </Route>
              <Route
                path="booking-requests"
                element={<BookingRequestListPage />}
              />
              <Route
                path="booking-requests/:id"
                element={<BookingRequestDetailPage />}
              />
              <Route path="orders" element={<OrderListPage />} />
              <Route path="orders/:orderId" element={<OrderDetailPage />} />
              <Route path="tickets" element={<AdminTicketListPage />} />
              <Route
                path="tickets/:ticketId"
                element={<AdminTicketDetailPage />}
              />
              <Route path="check-in" element={<CheckInPage />} />
              <Route path="clients" element={<ClientListPage />} />
              <Route path="clients/:userId" element={<ClientDetailPage />} />
              <Route path="publications" element={<PublicationListPage />} />
              <Route
                path="publications/new"
                element={<PublicationCreatePage />}
              />
              <Route
                path="publications/:id/edit"
                element={<PublicationEditPage />}
              />
              <Route
                path="publications/:id/sections"
                element={<PublicationSectionsPage />}
              />
              <Route path="media" element={<MediaManagerPage />} />
              <Route path="account" element={<AdminAccountPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>

          {/* Portal routes — require auth + client/admin/root label */}
          <Route
            element={
              <ProtectedRoute
                labels={[ROLES.CLIENT, ROLES.ADMIN, ROLES.ROOT]}
              />
            }
          >
            <Route path="/portal" element={<PortalLayout />}>
              <Route index element={<PortalDashboardPage />} />
              <Route path="tickets" element={<TicketListPage />} />
              <Route path="tickets/:ticketId" element={<TicketDetailPage />} />
              <Route path="orders" element={<PortalOrdersPage />} />
              <Route
                path="orders/:orderId"
                element={<PortalOrderDetailPage />}
              />
              <Route path="passes" element={<PortalPassesPage />} />
              <Route path="passes/:userPassId" element={<PassDetailPage />} />
              <Route path="passes/:userPassId/use" element={<UsePassPage />} />
              <Route path="profile" element={<PortalProfilePage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
