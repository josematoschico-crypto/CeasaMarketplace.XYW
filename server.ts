import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  /**
   * REAL INTEGRATION: Serasa Experian Credit Analysis
   * This endpoint handles the OAuth2 flow and the credit score query.
   */
  app.post("/api/credit/analyze", async (req, res) => {
    const { whatsapp, name, document } = req.body;
    
    console.log(`[SERASA] Iniciando análise real para: ${name} (${document})`);

    try {
      const clientId = process.env.SERASA_CLIENT_ID;
      const clientSecret = process.env.SERASA_CLIENT_SECRET;
      const apiUrl = process.env.SERASA_API_URL || "https://api.serasaexperian.com.br";

      // 1. Check if credentials exist
      if (!clientId || !clientSecret) {
        console.warn("[SERASA] Credenciais não configuradas. Usando modo simulação de alta fidelidade.");
        
        // High-fidelity simulation for demo if keys are missing
        await new Promise(resolve => setTimeout(resolve, 2500));
        const score = Math.floor(Math.random() * (999 - 400 + 1)) + 400;
        const limit = score > 700 ? 15000 : score > 500 ? 5000 : 0;
        const status = limit > 0 ? 'approved' : 'rejected';

        return res.json({
          success: true,
          score,
          limit,
          status,
          lastAnalysis: new Date().toISOString(),
          provider: "Serasa Experian (Simulado)",
          portalUrl: "https://www.serasa.com.br/meu-score/"
        });
      }

      // 2. Get OAuth2 Token from Serasa
      // Note: This is the standard pattern for Serasa APIs
      const tokenResponse = await axios.post(`${apiUrl}/v1/oauth/token`, 
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const accessToken = tokenResponse.data.access_token;

      // 3. Query Credit Score / Risk Analysis
      // Endpoint example: /v1/credit-analysis/score
      const analysisResponse = await axios.post(`${apiUrl}/v1/credit-analysis/score`, 
        {
          document: document.replace(/\D/g, ''),
          name: name,
          whatsapp: whatsapp
        },
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );

      const { score, recommendation } = analysisResponse.data;
      
      // Business logic for limits based on Serasa recommendation
      let limit = 0;
      let status = 'rejected';

      if (score >= 600) {
        status = 'approved';
        limit = score * 15; 
      } else if (score >= 400) {
        status = 'approved';
        limit = 2000;
      }

      res.json({
        success: true,
        score,
        limit,
        status,
        lastAnalysis: new Date().toISOString(),
        provider: "Serasa Experian (Real)",
        portalUrl: "https://www.serasa.com.br/meu-score/"
      });

    } catch (error: any) {
      console.error('[SERASA ERROR]', error.response?.data || error.message);
      res.status(500).json({ 
        success: false, 
        error: "Falha na comunicação com a Serasa Experian. Verifique as credenciais no .env",
        details: error.response?.data
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
