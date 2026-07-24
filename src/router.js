import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLoadingStore } from '@/stores/loading'
import { getFirstAllowedSidebarPath } from '@/config/sidebar'
import features from '@/config/features'

// DashBoard
const Ai = () => import('./pages/dashboard/ai.vue')
const Crm = () => import('./pages/dashboard/crm.vue')
const ECommerce = () => import('./pages/dashboard/eCommerce.vue')
const Cryptocurrency = () => import('./pages/dashboard/cryptocurrency.vue')
const Investment = () => import('./pages/dashboard/investment.vue')
const Lms = () => import('./pages/dashboard/lms.vue')
const NFTgaming = () => import('./pages/dashboard/NFTgaming.vue')
const Medical = () => import('./pages/dashboard/medical.vue')
const Analytics = () => import('./pages/dashboard/analytics.vue')
const PosInventory = () => import('./pages/dashboard/PosInventory.vue')
const FinanceBanking = () => import('./pages/dashboard/financeBanking.vue')
const BookingSystem = () => import('./pages/dashboard/bookingSystem.vue')
const HelpDesk = () => import('./pages/dashboard/helpDesk.vue')
const Podcast = () => import('./pages/dashboard/podcast.vue')
const ProjectManagement = () => import('./pages/dashboard/projectManagement.vue')

// Ui Component
const Typography = () => import('./pages/uiComponent/typography.vue')
const Colors = () => import('./pages/uiComponent/colors.vue')
const Button = () => import('./pages/uiComponent/button.vue')
const Dropdown = () => import('./pages/uiComponent/dropdown.vue')
const Alert = () => import('./pages/uiComponent/alert.vue')
const Badges = () => import('./pages/uiComponent/badges.vue')
const Card = () => import('./pages/uiComponent/card.vue')
const Carousel = () => import('./pages/uiComponent/carousel.vue')
const Avatar = () => import('./pages/uiComponent/avatar.vue')
const Progress = () => import('./pages/uiComponent/progress.vue')
const Tabs = () => import('./pages/uiComponent/tabs.vue')
const Pagination = () => import('./pages/uiComponent/pagination.vue')
const Tooltip = () => import('./pages/uiComponent/tooltip.vue')
const Videos = () => import('./pages/uiComponent/videos.vue')
const StarRating = () => import('./pages/uiComponent/star-rating.vue')
const Tags = () => import('./pages/uiComponent/tags.vue')
const List = () => import('./pages/uiComponent/list.vue')
const AppCalendar = () => import('./pages/uiComponent/calendar.vue')
const Radio = () => import('./pages/uiComponent/radio.vue')
const Switch = () => import('./pages/uiComponent/switch.vue')
const imageUpload = () => import('./pages/uiComponent/image-upload.vue')

// Form 
const Form = () => import('./pages/forms/form.vue')
const FormValidation = () => import('./pages/forms/form-validation.vue')
const FormWizard = () => import('./pages/forms/wizard.vue')
const FormLayout = () => import('./pages/forms/form-layout.vue')

// Table
const BasicTable = () => import('./pages/table/table-basic.vue')
const DataTable = () => import('./pages/table/table-data.vue')

// chart
const LineChart = () => import('./pages/Chart/line-chart.vue')
const ColumnChart = () => import('./pages/Chart/column-chart.vue')
const PieChart = () => import('./pages/Chart/pie-chart.vue')

// Widgets
const Widgets = () => import('./pages/widgets/widgets.vue')

// Users
const UserList = () => import('./pages/users/users-list.vue')
const ViewProfile = () => import('./pages/users/view-profile.vue')
const UserRolePermission = () => import('./pages/users/user-role-permission.vue')
const AddUser = () => import('./pages/users/add-user.vue')
const UsersGrid = () => import('./pages/users/users-grid.vue')

// Role and Permission
const AssignRole = () => import('./pages/roleAccess/assign-role.vue')
const RoleAccess = () => import('./pages/roleAccess/role-access.vue')

// authentication
const SignIn = () => import('./pages/authentication/sign-in.vue')
const SignUp = () => import('./pages/authentication/sign-up.vue')
const ForgotPassword = () => import('./pages/authentication/forgot-password.vue')


// Gallery
const Gallery = () => import('./pages/gallery/gallery.vue')
const GalleryGrid = () => import('./pages/gallery/gallery-grid.vue')
const GalleryMasonry = () => import('./pages/gallery/gallery-masonry.vue')
const GalleryHover = () => import('./pages/gallery/gallery-hover.vue')

// Pricing
const Pricing = () => import('./pages/pricing/pricing.vue')

// Blog
const Blog = () => import('./pages/blog/blog.vue')
const BlogDetails = () => import('./pages/blog/blog-details.vue')
const AddBlog = () => import('./pages/blog/add-blog.vue')

// Testimonial
const Testimonial = () => import('./pages/testimonial/testimonial.vue')

// FAQS
const FAQS = () => import('./pages/faq/faqs.vue')

// error
const Error = () => import('./pages/error/error.vue')
const BadRequest = () => import('./pages/error/bad-request.vue')
const ServiceUnavailable = () => import('./pages/error/service-unavailable.vue')
const InternalServer = () => import('./pages/error/internal-server.vue')
const Forbidden = () => import('./pages/error/forbidden.vue')

const TermsCondition = () => import('./pages/termsCondition/terms-condition.vue')

const ComingSoon = () => import('./pages/comingSoon/coming-soon.vue')
const AccessDenied = () => import('./pages/accessDenied/accessDenied.vue')
const Maintenance = () => import('./pages/maintenance/maintenance.vue')
const BlankPage = () => import('./pages/blankPage/blank-page.vue')



// email
const Email = () => import('./pages/email/Email.vue')
const StarredEmail = () => import('./pages/email/StarredEmail.vue')
const VeiwDetails = () => import('./pages/email/VeiwDetails.vue')

// Chat
const ChatMessage = () => import('./pages/chat/chat-message.vue')
const ChatProfile = () => import('./pages/chat/chat-profile.vue')
import Component from 'vue-flatpickr-component'

// Calendar
const CalendarMain = () => import('./pages/calendar-main.vue')

// Kanban
const Kanban = () => import('./pages/kanban.vue')

// Invoice
const InvoiceList = () => import('./pages/invoice/invoice-list.vue')
const InvoicePreview = () => import('./pages/invoice/invoice-preview.vue')
const InvoiceAdd = () => import('./pages/invoice/invoice-add.vue')
const InvoiceEdit = () => import('./pages/invoice/invoice-edit.vue')

// Ai Application
const TextGenerator = () => import('./pages/ai-application/text-generator/text.vue')
const TextChat = () => import('./pages/ai-application/text-generator/new-chat.vue')
const CodeGenerator = () => import('./pages/ai-application/code-generator/code.vue')
const CodeNewPage = () => import('./pages/ai-application/code-generator/new-page.vue')
const ImageGenerator = () => import('./pages/ai-application/image-generator.vue')
const VoiceGenerator = () => import('./pages/ai-application/voice-generator.vue')
const VideoGenerator = () => import('./pages/ai-application/video-generator.vue')

// Crypto Currencies
const Wallet = () => import('./pages/crypto-currency/wallet.vue')
const Marketplace = () => import('./pages/crypto-currency/marketplace.vue')
const MarketplaceDetails = () => import('./pages/crypto-currency/marketplace-details.vue')
const Portfolio = () => import('./pages/crypto-currency/portfolio.vue')

// Settings
const Company = () => import('./pages/settings/company.vue')
const Notification = () => import('./pages/settings/notification.vue')
const NotificationAlert = () => import('./pages/settings/notification-alert.vue')
const Theme = () => import('./pages/settings/theme.vue')
const Currencies = () => import('./pages/settings/currencies.vue')
const Language = () => import('./pages/settings/language.vue')
const PaymentGateway = () => import('./pages/settings/payment-gateway.vue')

// FEETA Admin Panel
const FeetaDashboard = () => import('./pages/feeta/Dashboard.vue')
const LatestNews = () => import('./pages/feeta/LatestNews.vue')
const AdminList = () => import('./pages/feeta/admins/AdminList.vue')
const AdminCreate = () => import('./pages/feeta/admins/AdminCreate.vue')
const AdminEdit = () => import('./pages/feeta/admins/AdminEdit.vue')
const AdminView = () => import('./pages/feeta/admins/AdminView.vue')
const AdminProfile = () => import('./pages/feeta/admins/AdminProfile.vue')
const NewsList = () => import('./pages/feeta/news/NewsList.vue')
const NewsCreate = () => import('./pages/feeta/news/NewsCreate.vue')
const NewsEdit = () => import('./pages/feeta/news/NewsEdit.vue')
const NewsView = () => import('./pages/feeta/news/NewsView.vue')
const RoleList = () => import('./pages/feeta/roles/RoleList.vue')
const RoleCreate = () => import('./pages/feeta/roles/RoleCreate.vue')
const RoleEdit = () => import('./pages/feeta/roles/RoleEdit.vue')
const RoleView = () => import('./pages/feeta/roles/RoleView.vue')
const PermissionList = () => import('./pages/feeta/permissions/PermissionList.vue')
const MasterPropertyOverview = () => import('./pages/feeta/master-properties/MasterPropertyOverview.vue')
const MasterPropertyCategoryList = () => import('./pages/feeta/master-properties/CategoryList.vue')
const MasterPropertyChildList = () => import('./pages/feeta/master-properties/ChildList.vue')
const MasterPropertyComponentList = () => import('./pages/feeta/master-properties/ComponentList.vue')
const MasterPropertyOptionList = () => import('./pages/feeta/master-properties/OptionList.vue')
const LocationManagement = () => import('./pages/feeta/locations/LocationManagement.vue')
const AgentList = () => import('./pages/feeta/agents/AgentList.vue')
const AgentView = () => import('./pages/feeta/agents/AgentView.vue')
const AgentForm = () => import('./pages/feeta/agents/AgentForm.vue')
const AgentProperties = () => import('./pages/feeta/agents/AgentProperties.vue')
const AgentPropertyView = () => import('./pages/feeta/agents/AgentPropertyView.vue')

const KycDashboard = () => import('./pages/feeta/kyc/KycDashboard.vue')
const KycList = () => import('./pages/feeta/kyc/KycList.vue')
const KycView = () => import('./pages/feeta/kyc/KycView.vue')
const PendingKyc = () => import('./pages/feeta/kyc/PendingKyc.vue')
const SubmittedKyc = () => import('./pages/feeta/kyc/SubmittedKyc.vue')
const VerifiedKyc = () => import('./pages/feeta/kyc/VerifiedKyc.vue')
const RejectedKyc = () => import('./pages/feeta/kyc/RejectedKyc.vue')
const FaqOverview = () => import('./pages/feeta/faqs/FaqOverview.vue')
const FaqSectionForm = () => import('./pages/feeta/faqs/FaqSectionForm.vue')
const FaqSectionView = () => import('./pages/feeta/faqs/FaqSectionView.vue')
const FaqItemForm = () => import('./pages/feeta/faqs/FaqItemForm.vue')
const FaqItemView = () => import('./pages/feeta/faqs/FaqItemView.vue')
const PolicyGroups = () => import('./pages/feeta/policies/PolicyGroups.vue')
const PolicySections = () => import('./pages/feeta/policies/PolicySections.vue')
const PolicySectionForm = () => import('./pages/feeta/policies/PolicySectionForm.vue')
const PolicySectionView = () => import('./pages/feeta/policies/PolicySectionView.vue')
const PaymentList = () => import('./pages/feeta/payments/PaymentList.vue')
const PaymentView = () => import('./pages/feeta/payments/PaymentView.vue')
const InvoiceView = () => import('./pages/feeta/payments/InvoiceView.vue')
const PaymentStatistics = () => import('./pages/feeta/payments/PaymentStatistics.vue')
const CreditDashboard = () => import('./pages/feeta/credits/CreditDashboard.vue')
const CreditWallet = () => import('./pages/feeta/credits/CreditWallet.vue')
const CreditTransactions = () => import('./pages/feeta/credits/CreditTransactions.vue')
const ManualTransfers = () => import('./pages/feeta/credits/ManualTransfers.vue')
const PropertyList = () => import('./pages/feeta/properties/PropertyList.vue')
const PropertyView = () => import('./pages/feeta/properties/PropertyView.vue')
const PropertyEdit = () => import('./pages/feeta/properties/PropertyEdit.vue')
const FeaturedProperties = () => import('./pages/feeta/properties/FeaturedProperties.vue')
const PendingProperties = () => import('./pages/feeta/properties/PendingProperties.vue')
const ArchivedProperties = () => import('./pages/feeta/properties/ArchivedProperties.vue')
const DeletedProperties = () => import('./pages/feeta/properties/DeletedProperties.vue')
const LeadList = () => import('./pages/feeta/leads/LeadList.vue')
const LeadView = () => import('./pages/feeta/leads/LeadView.vue')
const FeetaCircleApplications = () => import('./pages/feeta/circle/ApplicationList.vue')
const NotificationList = () => import('./pages/feeta/notifications/NotificationList.vue')

const routes = [

  // FEETA Admin Panel Routes
  { path: '/', component: Error, meta: { requiresAuth: true, permissionLanding: true, layout: false } },
  { path: '/dashboard', component: FeetaDashboard, meta: { requiresAuth: true } },
  { path: '/profile', component: AdminProfile, meta: { requiresAuth: true } },
  { path: '/latest-news', component: LatestNews, meta: { requiresAuth: true, permissions: ['news.view'] } },
  { path: '/admins', component: AdminList, meta: { requiresAuth: true, permissions: ['admin.view'] } },
  { path: '/admins/create', component: AdminCreate, meta: { requiresAuth: true, permissions: ['admin.create'] } },
  { path: '/admins/:id', component: AdminView, meta: { requiresAuth: true, permissions: ['admin.view'] } },
  { path: '/admins/:id/edit', component: AdminEdit, meta: { requiresAuth: true, permissions: ['admin.update'] } },
  { path: '/news', component: NewsList, meta: { requiresAuth: true, permissions: ['news.view'] } },
  { path: '/news/create', component: NewsCreate, meta: { requiresAuth: true, permissions: ['news.create'] } },
  { path: '/news/:id', component: NewsView, meta: { requiresAuth: true, permissions: ['news.view'] } },
  { path: '/news/:id/edit', component: NewsEdit, meta: { requiresAuth: true, permissions: ['news.update'] } },
  { path: '/faqs', component: FaqOverview, meta: { requiresAuth: true, permissions: ['faq.view'] } },
  { path: '/faqs/sections/create', component: FaqSectionForm, props: { mode: 'create' }, meta: { requiresAuth: true, permissions: ['faq.section.create'] } },
  { path: '/faqs/sections/:sectionId/questions/create', component: FaqItemForm, props: { mode: 'create' }, meta: { requiresAuth: true, permissions: ['faq.item.create'] } },
  { path: '/faqs/sections/:id/edit', component: FaqSectionForm, props: { mode: 'edit' }, meta: { requiresAuth: true, permissions: ['faq.section.update'] } },
  { path: '/faqs/sections/:id', component: FaqSectionView, meta: { requiresAuth: true, permissions: ['faq.view'] } },
  { path: '/faqs/questions/:id/edit', component: FaqItemForm, props: { mode: 'edit' }, meta: { requiresAuth: true, permissions: ['faq.item.update'] } },
  { path: '/faqs/questions/:id', component: FaqItemView, meta: { requiresAuth: true, permissions: ['faq.view'] } },
  { path: '/faqs/tree', redirect: '/faqs' },
  { path: '/faqs/sections', redirect: '/faqs' },
  { path: '/faqs/items', redirect: '/faqs' },
  { path: '/faqs/items/create', redirect: '/faqs' },
  { path: '/faqs/items/:id/edit', redirect: (to) => `/faqs/questions/${to.params.id}/edit` },
  { path: '/faqs/items/:id', redirect: (to) => `/faqs/questions/${to.params.id}` },
  { path: '/policies', component: PolicyGroups, meta: { requiresAuth: true, permissions: ['policy.view'] } },
  { path: '/policies/:policyType/create', component: PolicySectionForm, props: { mode: 'create' }, meta: { requiresAuth: true, permissions: ['policy.create'] } },
  { path: '/policies/sections/:id/edit', component: PolicySectionForm, props: { mode: 'edit' }, meta: { requiresAuth: true, permissions: ['policy.update'] } },
  { path: '/policies/sections/:id', component: PolicySectionView, meta: { requiresAuth: true, permissions: ['policy.view'] } },
  { path: '/policies/:policyType', component: PolicySections, meta: { requiresAuth: true, permissions: ['policy.view'] } },
  { path: '/roles', component: RoleList, meta: { requiresAuth: true, permissions: ['role.view'] } },
  { path: '/roles/create', component: RoleCreate, meta: { requiresAuth: true, permissions: ['role.create'] } },
  { path: '/roles/:id', component: RoleView, meta: { requiresAuth: true, permissions: ['role.view'] } },
  { path: '/roles/:id/edit', component: RoleEdit, meta: { requiresAuth: true, permissions: ['role.update'] } },
  { path: '/permissions', component: PermissionList, meta: { requiresAuth: true, permissions: ['permission.view'] } },
  { path: '/master-properties', component: MasterPropertyOverview, meta: { requiresAuth: true, permissions: ['master_property.view'] } },
  { path: '/master-properties/categories', component: MasterPropertyCategoryList, meta: { requiresAuth: true, permissions: ['master_property.view'] } },
  { path: '/master-properties/children', component: MasterPropertyChildList, meta: { requiresAuth: true, permissions: ['master_property.view'] } },
  { path: '/master-properties/components', component: MasterPropertyComponentList, meta: { requiresAuth: true, permissions: ['master_property.view'] } },
  { path: '/master-properties/options', component: MasterPropertyOptionList, meta: { requiresAuth: true, permissions: ['master_property.view'] } },
  { path: '/master/locations', component: LocationManagement, meta: { requiresAuth: true, permissions: ['state.view'] } },
  { path: '/master/locations/states/:stateId/cities', component: LocationManagement, meta: { requiresAuth: true, permissions: ['city.view'] } },
  { path: '/master/locations/states/:stateId/cities/:cityId/localities', component: LocationManagement, meta: { requiresAuth: true, permissions: ['locality.view'] } },
  { path: '/master/states', redirect: '/master/locations' },
  { path: '/master/cities', redirect: '/master/locations' },
  { path: '/master/localities', redirect: '/master/locations' },
  { path: '/kyc', component: KycDashboard, meta: { requiresAuth: true, permissions: ['kyc.view'] } },
  { path: '/kyc/all', component: KycList, props: { title: 'KYC Submissions' }, meta: { requiresAuth: true, permissions: ['kyc.view'] } },
  { path: '/kyc/pending', component: PendingKyc, meta: { requiresAuth: true, permissions: ['kyc.view'] } },
  { path: '/kyc/submitted', component: SubmittedKyc, meta: { requiresAuth: true, permissions: ['kyc.view'] } },
  { path: '/kyc/verified', component: VerifiedKyc, meta: { requiresAuth: true, permissions: ['kyc.view'] } },
  { path: '/kyc/rejected', component: RejectedKyc, meta: { requiresAuth: true, permissions: ['kyc.view'] } },
  { path: '/kyc/:id', component: KycView, meta: { requiresAuth: true, permissions: ['kyc.view'] } },
  { path: '/agents', component: AgentList, meta: { requiresAuth: true, permissions: ['agent.view'] } },
  { path: '/agents/:id', component: AgentView, meta: { requiresAuth: true, permissions: ['agent.view'] } },
  { path: '/agents/:id/edit', component: AgentForm, meta: { requiresAuth: true, permissions: ['agent.update'] } },
  { path: '/agents/:id/properties', component: AgentProperties, meta: { requiresAuth: true, permissions: ['agent.properties.view'] } },
  { path: '/agents/:id/properties/:propertyId', component: AgentPropertyView, meta: { requiresAuth: true, permissions: ['agent.properties.view'] } },
  { path: '/payments', component: PaymentList, meta: { requiresAuth: true, permissions: ['payment.view'] } },
  { path: '/payments/statistics', component: PaymentStatistics, meta: { requiresAuth: true, permissions: ['payment.view'] } },
  { path: '/payments/:id', component: PaymentView, meta: { requiresAuth: true, permissions: ['payment.detail'] } },
  { path: '/payments/:id/invoice', component: InvoiceView, meta: { requiresAuth: true, permissions: ['payment.invoice.view'] } },
  { path: '/credits', component: CreditDashboard, meta: { requiresAuth: true, permissions: ['credit.view'] } },
  { path: '/credits/wallets', component: CreditWallet, meta: { requiresAuth: true, permissions: ['credit.view'] } },
  { path: '/credits/:agentId/transactions', component: CreditTransactions, meta: { requiresAuth: true, permissions: ['credit.history'] } },
  { path: '/credits/manual-transfers', component: ManualTransfers, meta: { requiresAuth: true, permissions: ['credit.view'] } },
  { path: '/properties', component: PropertyList, meta: { requiresAuth: true, permissions: ['property.view'] } },
  ...(features.propertyFeatured ? [{ path: '/properties/featured', component: FeaturedProperties, meta: { requiresAuth: true, permissions: ['property.view'] } }] : []),
  { path: '/properties/pending', component: PendingProperties, meta: { requiresAuth: true, permissions: ['property.view'] } },
  { path: '/properties/archived', component: ArchivedProperties, meta: { requiresAuth: true, permissions: ['property.view'] } },
  { path: '/properties/deleted', component: DeletedProperties, meta: { requiresAuth: true, permissions: ['property.view'] } },
  { path: '/properties/:id', component: PropertyView, meta: { requiresAuth: true, permissions: ['property.view'] } },
  { path: '/properties/:id/edit', component: PropertyEdit, meta: { requiresAuth: true, permissions: ['property.update'] } },
  { path: '/leads', component: LeadList, meta: { requiresAuth: true, permissions: ['lead.view'] } },
  { path: '/leads/:leadId', component: LeadView, meta: { requiresAuth: true, permissions: ['lead.view'] } },
  { path: '/feeta-circle/applications', component: FeetaCircleApplications, meta: { requiresAuth: true, permissions: ['feeta_circle.application.view'] } },
  { path: '/notifications', component: NotificationList, meta: { requiresAuth: true, permissions: ['notification.view'] } },

  // DashBoard section Route
  { path: '/template-ai', component: Ai },
  { path: '/crm', component: Crm },
  { path: '/eCommerce', component: ECommerce },
  { path: '/cryptocurrency', component: Cryptocurrency },
  { path: '/investment', component: Investment },
  { path: '/lms', component: Lms },
  { path: '/nft-gaming', component: NFTgaming },
  { path: '/medical', component: Medical },
  { path: '/analytics', component: Analytics },
  { path: '/pos-inventory', component: PosInventory },
  { path: '/finance-banking', component: FinanceBanking },
  { path: '/booking-system', component: BookingSystem },
  { path: '/help-desk', component: HelpDesk },
  { path: '/podcast', component: Podcast },
  { path: '/project-management', component: ProjectManagement },

  // Email Section Route
  { path: '/email', component: Email },
  { path: '/starred-email', component: StarredEmail },
  { path: '/veiw-details', component: VeiwDetails },
  
  // Chat Section Route
  { path: '/chat-message', component: ChatMessage },
  { path: '/chat-profile', component: ChatProfile },



  // ui Component 
  { path: '/typography', component: Typography },
  { path: '/colors', component: Colors },
  { path: '/button', component: Button },
  { path: '/dropdown', component: Dropdown },
  { path: '/alert', component: Alert },
  { path: '/card', component: Card },
  { path: '/carousel', component: Carousel },
  { path: '/badges', component: Badges },
  { path: '/avatar', component: Avatar },
  { path: '/progress', component: Progress},
  { path: '/tabs', component: Tabs},
  { path: '/pagination', component: Pagination},
  { path: '/tooltip', component: Tooltip},
  { path: '/videos', component: Videos},
  { path: '/star-rating', component: StarRating},
  { path: '/tags', component: Tags},
  { path: '/list', component: List},
  { path: '/calendar', component: AppCalendar},
  { path: '/radio', component: Radio},
  { path: '/switch', component: Switch},
  { path: '/image-upload', component: imageUpload},

  // Form
  { path: '/form', component: Form },
  { path: '/form-validation', component : FormValidation },
  { path: '/wizard', component : FormWizard },
  { path: '/form-layout', component : FormLayout },


  // table
  { path: '/table-basic', component: BasicTable },
  { path: '/table-data', component: DataTable },

  // Chart
  { path: '/line-chart', component: LineChart },
  { path: '/column-chart', component: ColumnChart },
  { path: '/pie-chart', component: PieChart },

  // widgets
  { path: '/widgets', component: Widgets },

  // users
  { path: '/users', component: UserList, meta: { requiresAuth: true, permissions: ['user.view'] } },
  { path: '/users-list', redirect: '/users', meta: { requiresAuth: true, permissions: ['user.view'] } },
  { path: '/users/:id', component: ViewProfile, meta: { requiresAuth: true, permissions: ['user.profile'] } },
  { path: '/users-role-permission', component: UserRolePermission },
  { path: '/add-user', component: AddUser },
  { path: '/users-grid', component: UsersGrid },

  // Roles and permission
  { path: '/assign-role', component: AssignRole },
  { path: '/role-access', component: RoleAccess },


  // Authentication
  { path: '/sign-in', component: SignIn, meta: { layout: false, guest: true } },
  { path: '/sign-up', component: SignUp, meta: { layout: false } },
  {  path: '/forgot-password', component: ForgotPassword, meta: { layout: false } },

  // Gallery
  { path: '/gallery', component: Gallery },
  { path: '/gallery-grid', component: GalleryGrid },
  { path: '/gallery-masonry', component: GalleryMasonry },
  { path: '/gallery-hover', component: GalleryHover },

  // Pricing
  { path: '/pricing', component: Pricing },

  // Blog
  { path: '/blog', component: Blog },
  { path: '/blog-details', component: BlogDetails },
  { path: '/add-blog', component: AddBlog },

  // Testimonial
  { path: '/testimonials', component: Testimonial },
  // FAQS
  { path: '/faq', component: FAQS },


  // error
  { path: '/error', component: Error },
  { path: '/bad-request', component: BadRequest },
  { path: '/service-unavailable', component: ServiceUnavailable},
  { path: '/internal-server', component: InternalServer },
  { path: '/forbidden', component: Forbidden },

  // Terms and condition
  { path: '/terms-condition', component: TermsCondition },
  { path: '/coming-soon', component: ComingSoon, meta: { layout: false }  },
  { path: '/access-denied', component: AccessDenied, meta: { layout: false }  },
  { path: '/maintenance', component: Maintenance, meta: { layout: false }  },
  { path: '/blank-page', component: BlankPage },


  // Calender Route
  { path: '/calendar-main', component: CalendarMain },

  // Khanban Route
  { path: '/kanban', component: Kanban },

  // Invoice Route
  { path: '/invoice-list', component: InvoiceList },
  { path: '/invoice-preview', component: InvoicePreview },
  { path: '/invoice-add', component: InvoiceAdd },
  { path: '/invoice-edit', component: InvoiceEdit },

  // Ai Application
  { path: '/text-generator', component: TextGenerator },
  { path: '/text-new-chat', component: TextChat },
  { path: '/code-generator', component: CodeGenerator },
  { path: '/code-generator-new', component: CodeNewPage },
  { path: '/image-generator', component: ImageGenerator },
  { path: '/voice-generator', component: VoiceGenerator },
  { path: '/video-generator', component: VideoGenerator },

  // Crypto Currency
  { path: '/wallet', component: Wallet },
  { path: '/marketplace', component: Marketplace },
  { path: '/marketplace-details', component: MarketplaceDetails },
  { path: '/portfolio', component: Portfolio },

  // Settings
  { path: '/company', component: Company },
  { path: '/notification', component: Notification },
  { path: '/notification-alert', component: NotificationAlert },
  { path: '/theme', component: Theme },
  { path: '/currencies', component: Currencies },
  { path: '/language', component: Language },
  { path: '/payment-gateway', component: PaymentGateway },

  // Unknown URLs are resolved by the auth guard after the current session and
  // permissions have been loaded.
  { path: '/:pathMatch(.*)*', component: Error, meta: { requiresAuth: true, permissionLanding: true, layout: false } },

]

const router = createRouter({
  history: createWebHistory('/admin/'),
  routes,
})

function safeRedirect(queryRedirect, fallback = '/dashboard') {
  const redirect = Array.isArray(queryRedirect) ? queryRedirect[0] : queryRedirect
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : fallback
}

function canAccessPath(path, auth) {
  const matched = router.resolve(path).matched
  return matched.every((record) => {
    if (record.meta?.superOnly && !auth.isSuperAdmin()) return false
    const permissions = record.meta?.permissions || []
    return !permissions.length || auth.hasAnyPermission(permissions)
  })
}

let routeLoadingId = null

router.beforeEach(async (to, from) => {
  const auth = useAuthStore()
  const loading = useLoadingStore()

  if (to.fullPath !== from.fullPath) {
    if (routeLoadingId) loading.finishRoute(routeLoadingId)
    routeLoadingId = loading.startRoute('Opening page...')
  }

  if (to.meta.guest && auth.isAuthenticated) {
    try {
      await auth.ensureSession()
    } catch (error) {
      if (error?.status === 401) {
        return true
      }
      if (import.meta.env.DEV) {
        console.debug('[auth] Session refresh skipped on guest route; keeping stored token.', error)
      }
    }
    const target = safeRedirect(to.query.redirect, getFirstAllowedSidebarPath(auth))
    return canAccessPath(target, auth) ? target : getFirstAllowedSidebarPath(auth)
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: '/sign-in', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAuth && auth.isAuthenticated) {
    try {
      await auth.ensureSession()
    } catch (error) {
      if (error?.status === 401) {
        return { path: '/sign-in', query: { redirect: to.fullPath } }
      }
      if (import.meta.env.DEV) {
        console.debug('[auth] Session refresh skipped; keeping stored token.', error)
      }
    }
  }

  if (to.meta.permissionLanding) {
    return getFirstAllowedSidebarPath(auth)
  }

  const permissions = to.meta.permissions || []
  if (to.meta.superOnly && !auth.isSuperAdmin()) {
    return '/forbidden'
  }
  if (permissions.length && !auth.hasAnyPermission(permissions)) {
    return '/forbidden'
  }

  return true
})

router.afterEach(() => {
  const loading = useLoadingStore()
  const completedRouteId = routeLoadingId
  routeLoadingId = null
  window.setTimeout(() => loading.finishRoute(completedRouteId), 180)
})

router.onError(() => {
  const loading = useLoadingStore()
  routeLoadingId = null
  loading.reset()
})

export default router
