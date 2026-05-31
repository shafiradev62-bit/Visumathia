import { Suspense, lazy } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { SplashPage } from "@/pages/SplashPage";
// Import PaintedDefs directly — avoids pulling the entire painted barrel into the initial chunk
import { PaintedDefs } from "@/components/painted/PaintedTextures";

// Lazy-load LandscapeLock (uses framer-motion animation, not needed for first paint)
const LandscapeLock = lazy(() =>
  import("@/components/LandscapeLock").then((m) => ({ default: m.LandscapeLock })),
);

// Code-split ALL heavy pages so the splash screen paints fast
const StoryPage = lazy(() => import("@/pages/StoryPage").then((m) => ({ default: m.StoryPage })));
const HomePage = lazy(() => import("@/pages/HomePage").then((m) => ({ default: m.HomePage })));
const CharacterSelectPage = lazy(() =>
  import("@/pages/CharacterSelectPage").then((m) => ({ default: m.CharacterSelectPage })),
);
const ConnectARPage = lazy(() => import("@/pages/ConnectARPage").then((m) => ({ default: m.ConnectARPage })));
const RewardsPage = lazy(() => import("@/pages/RewardsPage").then((m) => ({ default: m.RewardsPage })));
const SettingsPage = lazy(() => import("@/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })));
const ScenePage = lazy(() => import("@/pages/ScenePage").then(m => ({ default: m.ScenePage })));
const ParentDashboard = lazy(() => import("@/pages/ParentDashboard").then(m => ({ default: m.ParentDashboard })));
const ObjectPlacer = lazy(() => import("@/pages/ObjectPlacer").then(m => ({ default: m.ObjectPlacer })));
const VimoEditor = lazy(() => import("@/pages/VimoEditor").then(m => ({ default: m.VimoEditor })));
const NotFound = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: false,
      networkMode: 'offlineFirst',
    },
  },
});

function FallbackBlank() {
  return <div style={{ position: 'fixed', inset: 0, background: '#9bd2ed' }} />;
}

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<FallbackBlank />}>
        <Switch>
          <Route path="/" component={SplashPage} />
          <Route path="/story" component={StoryPage} />
          <Route path="/connect" component={ConnectARPage} />
          <Route path="/home" component={HomePage} />
          <Route path="/character" component={CharacterSelectPage} />
          <Route path="/scene/:id" component={ScenePage} />
          <Route path="/rewards" component={RewardsPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/parent" component={ParentDashboard} />
          <Route path="/placer" component={ObjectPlacer} />
          <Route path="/vimo-editor" component={VimoEditor} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <PaintedDefs />
        <LandscapeLock />
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
