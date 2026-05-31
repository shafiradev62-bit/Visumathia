import { Router, type Request, type Response, type NextFunction } from 'express';

const router = Router();
const ROUTER_URL = process.env['NINEROUTER_URL'] || 'http://localhost:20128';

router.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await fetch(`${ROUTER_URL}/dashboard`, {
      headers: {
        'Accept': req.headers['accept'] || 'text/html',
      },
    });

    if (!response.ok) {
      res.status(response.status).send(`9Router Dashboard Error: ${response.statusText}`);
      return;
    }

    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('text/html')) {
      const html = await response.text();
      res.type('html').send(html);
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      res.status(503).json({
        error: '9Router server is not available',
        url: ROUTER_URL,
        message: 'Please ensure 9Router is running on localhost:20128'
      });
      return;
    }
    next(error);
  }
});

router.get('/router-status', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${ROUTER_URL}/status`, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      res.json({
        connected: true,
        url: ROUTER_URL,
        status: data,
      });
    } else {
      res.json({
        connected: false,
        url: ROUTER_URL,
        error: `HTTP ${response.status}`,
      });
    }
  } catch (error) {
    res.json({
      connected: false,
      url: ROUTER_URL,
      error: error instanceof Error ? error.message : 'Connection failed',
    });
  }
});

router.get('/router-metrics', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${ROUTER_URL}/metrics`, {
      method: 'GET',
    });

    if (response.ok) {
      const metrics = await response.json();
      res.json(metrics);
    } else {
      res.status(response.status).json({
        error: 'Failed to fetch metrics from 9Router',
        status: response.status,
      });
    }
  } catch (error) {
    res.status(503).json({
      error: '9Router metrics unavailable',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.use('/router/*', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const path = req.params[0] || '';
    const targetUrl = `${ROUTER_URL}/${path}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`;
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        'host': undefined,
        'x-forwarded-for': req.ip,
        'x-real-ip': req.ip,
      },
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined,
    });

    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    const text = await response.text();
    res.send(text);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      res.status(503).json({
        error: '9Router server is not available',
        message: 'Please ensure 9Router is running on localhost:20128'
      });
      return;
    }
    next(error);
  }
});

export default router;
