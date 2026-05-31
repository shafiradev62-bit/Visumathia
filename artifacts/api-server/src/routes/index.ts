import { Router, type IRouter } from "express";
import healthRouter from "./health";
import progressRouter from "./progress";
import scenesRouter from "./scenes";
import rewardsRouter from "./rewards";
import statsRouter from "./stats";
import aiQuotaRouter from "./aiQuota";
import ninerouterRouter from "./ninerouter";
import quotaAlertsRouter from "./quotaAlerts";

const router: IRouter = Router();

router.use(healthRouter);
router.use(progressRouter);
router.use(scenesRouter);
router.use(rewardsRouter);
router.use(statsRouter);
router.use("/ai", aiQuotaRouter);
router.use("/9router", ninerouterRouter);
router.use("/alerts", quotaAlertsRouter);

export default router;
