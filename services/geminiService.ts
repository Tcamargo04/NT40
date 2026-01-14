
import { GoogleGenAI } from "@google/genai";
import { Customer } from "../types";

export const generateBusinessInsights = async (customers: Customer[]) => {
  // Always use direct process.env.API_KEY for initialization as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const customerSummary = customers.map(c => ({
    name: c.name,
    services: c.services.map(s => s.type),
    equipmentCount: c.equipments.length,
    status: c.services[0]?.status || 'N/A'
  }));

  const prompt = `
    Analise os seguintes dados de uma empresa de monitoramento de alarmes:
    ${JSON.stringify(customerSummary)}
    
    Por favor, forneça um breve relatório (máximo 200 palavras) em Português sobre:
    1. Desempenho geral da carteira.
    2. Sugestão de ação imediata (vendas ou manutenção).
    3. Tendência observada.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao gerar insights automáticos.";
  }
};
