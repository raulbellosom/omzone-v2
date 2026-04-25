import { Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";

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

const AboutPage = lazy(() => import("@/pages/public/AboutPage"));
const ContactPage = lazy(() => import("@/pages/public/ContactPage"));
const PrivacyPage = lazy(() => import("@/pages/public/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/public/TermsPage"));
const RefundPolicyPage = lazy(() => import("@/pages/public/RefundPolicyPage"));
const ExperiencesListPage = lazy(
  () => import("@/pages/public/ExperiencesListPage"),
);
const ExperienceDetailPage = lazy(
  () => import("@/pages/public/ExperienceDetailPage"),
);
const PackageDetailPage = lazy(
  () => import("@/pages/public/PackageDetailPage"),
);
const PublicationPage = lazy(() => import("@/pages/public/PublicationPage"));
const PassesListPage = lazy(() => import("@/pages/public/PassesListPage"));
const PublicPassDetailPage = lazy(
  () => import("@/pages/public/PassDetailPage"),
);
const PublicationsListPage = lazy(
  () => import("@/pages/public/PublicationsListPage"),
);
const CheckoutPage = lazy(() => import("@/pages/public/CheckoutPage"));
const CheckoutSuccessPage = lazy(
  () => import("@/pages/public/CheckoutSuccessPage"),
);
const CheckoutCancelPage = lazy(
  () => import("@/pages/public/CheckoutCancelPage"),
);

// ─── Auth pages ───
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const VerifyEmailPendingPage = lazy(
  () => import("@/pages/auth/VerifyEmailPendingPage"),
);
const VerifyEmailPage = lazy(() => import("@/pages/auth/VerifyEmailPage"));
const ForgotPasswordPage = lazy(
  () => import("@/pages/auth/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));

// ─── Admin pages (chunked together) ───
const AdminLayout = lazy(() => import("@/layouts/AdminLayout"));
const AdminDashboardPage = lazy(
  () => import("@/pages/admin/AdminDashboardPage"),
);
const ExperienceListPage = lazy(
  () => import("@/pages/admin/ExperienceListPage"),
);
const ExperienceCreatePage = lazy(
  () => import("@/pages/admin/ExperienceCreatePage"),
);
const ExperienceEditPage = lazy(
  () => import("@/pages/admin/ExperienceEditPage"),
);
const EditionListPage = lazy(() => import("@/pages/admin/EditionListPage"));
const EditionCreatePage = lazy(() => import("@/pages/admin/EditionCreatePage"));
const EditionEditPage = lazy(() => import("@/pages/admin/EditionEditPage"));
const PricingTierListPage = lazy(
  () => import("@/pages/admin/PricingTierListPage"),
);
const AddonListPage = lazy(() => import("@/pages/admin/AddonListPage"));
const AddonCreatePage = lazy(() => import("@/pages/admin/AddonCreatePage"));
const AddonEditPage = lazy(() => import("@/pages/admin/AddonEditPage"));
const AddonAssignmentListPage = lazy(
  () => import("@/pages/admin/AddonAssignmentListPage"),
);
const SlotListPage = lazy(() => import("@/pages/admin/SlotListPage"));
const SlotCreatePage = lazy(() => import("@/pages/admin/SlotCreatePage"));
const SlotEditPage = lazy(() => import("@/pages/admin/SlotEditPage"));
const SlotQuickCreatePage = lazy(
  () => import("@/pages/admin/SlotQuickCreatePage"),
);
const AgendaGlobalPage = lazy(() => import("@/pages/admin/AgendaGlobalPage"));
const ResourcesPage = lazy(
  () => import("@/pages/admin/resources/ResourcesPage"),
);
const ResourceCreatePage = lazy(
  () => import("@/pages/admin/resources/ResourceCreatePage"),
);
const ResourceEditPage = lazy(
  () => import("@/pages/admin/resources/ResourceEditPage"),
);
const LocationCreatePage = lazy(
  () => import("@/pages/admin/resources/LocationCreatePage"),
);
const LocationEditPage = lazy(
  () => import("@/pages/admin/resources/LocationEditPage"),
);
const RoomCreatePage = lazy(
  () => import("@/pages/admin/resources/RoomCreatePage"),
);
const RoomEditPage = lazy(() => import("@/pages/admin/resources/RoomEditPage"));
const OrderListPage = lazy(() => import("@/pages/admin/OrderListPage"));
const OrderDetailPage = lazy(() => import("@/pages/admin/OrderDetailPage"));
const AdminTicketListPage = lazy(() => import("@/pages/admin/TicketListPage"));
const AdminTicketDetailPage = lazy(
  () => import("@/pages/admin/TicketDetailPage"),
);
const MediaManagerPage = lazy(() => import("@/pages/admin/MediaManagerPage"));
const ClientListPage = lazy(() => import("@/pages/admin/ClientListPage"));
const ClientDetailPage = lazy(() => import("@/pages/admin/ClientDetailPage"));
const SettingsPage = lazy(() => import("@/pages/admin/SettingsPage"));
const AdminAccountPage = lazy(() => import("@/pages/admin/AdminAccountPage"));
const CheckInPage = lazy(() => import("@/pages/admin/CheckInPage"));
const PassListPage = lazy(() => import("@/pages/admin/PassListPage"));
const PassCreatePage = lazy(() => import("@/pages/admin/PassCreatePage"));
const PassEditPage = lazy(() => import("@/pages/admin/PassEditPage"));
const UserPassListPage = lazy(() => import("@/pages/admin/UserPassListPage"));
const UserPassDetailPage = lazy(
  () => import("@/pages/admin/UserPassDetailPage"),
);
const PackageListPage = lazy(() => import("@/pages/admin/PackageListPage"));
const PackageCreatePage = lazy(() => import("@/pages/admin/PackageCreatePage"));
const PackageEditPage = lazy(() => import("@/pages/admin/PackageEditPage"));
const PublicationListPage = lazy(
  () => import("@/pages/admin/PublicationListPage"),
);
const PublicationCreatePage = lazy(
  () => import("@/pages/admin/PublicationCreatePage"),
);
const PublicationEditPage = lazy(
  () => import("@/pages/admin/PublicationEditPage"),
);
const PublicationSectionsPage = lazy(
  () => import("@/pages/admin/PublicationSectionsPage"),
);
const AssistedSalePage = lazy(
  () => import("@/pages/admin/sales/AssistedSalePage"),
);
const BookingRequestListPage = lazy(
  () => import("@/pages/admin/BookingRequestListPage"),
);
const BookingRequestDetailPage = lazy(
  () => import("@/pages/admin/BookingRequestDetailPage"),
);

// ─── Portal pages (chunked together) ───
const PortalLayout = lazy(() => import("@/layouts/PortalLayout"));
const PortalExplorePage = lazy(
  () => import("@/pages/portal/PortalExplorePage"),
);
const PortalDashboardPage = lazy(
  () => import("@/pages/portal/PortalDashboardPage"),
);
const TicketListPage = lazy(() => import("@/pages/portal/TicketListPage"));
const TicketDetailPage = lazy(() => import("@/pages/portal/TicketDetailPage"));
const PortalOrdersPage = lazy(() => import("@/pages/portal/PortalOrdersPage"));
const PortalOrderDetailPage = lazy(
  () => import("@/pages/portal/PortalOrderDetailPage"),
);
const PortalPassesPage = lazy(() => import("@/pages/portal/PortalPassesPage"));
const PassDetailPage = lazy(() => import("@/pages/portal/PassDetailPage"));
const UsePassPage = lazy(() => import("@/pages/portal/UsePassPage"));
const PortalProfilePage = lazy(
  () => import("@/pages/portal/PortalProfilePage"),
);

// ─── Error pages ───
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const ForbiddenPage = lazy(() => import("@/pages/ForbiddenPage"));

// ─── Help/Docs pages (standalone, no layout) ───
const HelpDocsPage = lazy(() => import("@/pages/help/HelpDocsPage"));

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
            <Route path="/refund-policy" element={<RefundPolicyPage />} />
            <Route path="/experiences" element={<ExperiencesListPage />} />
            <Route
              path="/experiences/:slug"
              element={<ExperienceDetailPage />}
            />
            <Route path="/packages/:slug" element={<PackageDetailPage />} />
            <Route path="/passes" element={<PassesListPage />} />
            <Route path="/passes/:slug" element={<PublicPassDetailPage />} />
            <Route path="/publications" element={<PublicationsListPage />} />
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
              {/* Assisted sale — admin/root/operator */}
              <Route
                element={
                  <RequireLabel
                    labels={[ROLES.ADMIN, ROLES.ROOT, ROLES.OPERATOR]}
                  />
                }
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

          {/* Help/Docs routes — require root authentication */}
          <Route
            element={
              <ProtectedRoute labels={[ROLES.ROOT]} />
            }
          >
            <Route path="/help/docs" element={<HelpDocsPage />} />
            <Route path="/help/docs/:lang" element={<HelpDocsPage />} />
            <Route path="/help/docs/:lang/:slug" element={<HelpDocsPage />} />
            <Route path="/help/docs/:slug" element={<HelpDocsPage />} />
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
              <Route index element={<PortalExplorePage />} />
              <Route path="dashboard" element={<PortalDashboardPage />} />
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
