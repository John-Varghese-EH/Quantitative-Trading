import { NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2'
import { GoogleGenAI } from '@google/genai'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
    }

    const [quoteRaw, searchResRaw] = await Promise.all([
      yahooFinance.quote(symbol),
      yahooFinance.search(symbol, { newsCount: 5 })
    ])

    const searchRes = searchResRaw as any
    const quote = quoteRaw as any
    const newsTitles = (searchRes.news || []).map((n: any) => n.title).join('\n- ')
    
    // 2. Initialize Gemini API
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.' 
      }, { status: 500 })
    }
    
    const ai = new GoogleGenAI({ apiKey })

    // 3. Construct the prompt
    const prompt = `
You are an expert quantitative analyst and financial AI.
Analyze the following latest data and news for ${symbol} (${quote.longName || quote.shortName}).
Current Price: $${quote.regularMarketPrice} (Change: ${quote.regularMarketChangePercent}%)
Volume: ${quote.regularMarketVolume}
52 Week Range: $${quote.fiftyTwoWeekLow} - $${quote.fiftyTwoWeekHigh}

Latest News Headlines:
- ${newsTitles}

Based on this data, provide a structured market sentiment analysis. 
You must respond with ONLY a valid, parseable JSON object adhering to this exact schema, with no markdown formatting or backticks around it:
{
  "sentimentScore": number, // 0 to 100 (0 = extremely bearish, 100 = extremely bullish)
  "sentimentLabel": "Bullish" | "Bearish" | "Neutral",
  "keyTakeaways": ["string", "string", "string"], // 3 concise bullet points
  "reasoning": "string" // 2-3 sentences explaining the core driver of this sentiment
}
`

    // 4. Call Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })

    const rawText = response.text || ''
    
    // Clean up potential markdown formatting from the response
    const jsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
    const result = JSON.parse(jsonStr)

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      name: quote.longName || quote.shortName,
      price: quote.regularMarketPrice,
      changePercent: quote.regularMarketChangePercent,
      sentiment: result
    })

  } catch (error: any) {
    console.error('Sentiment API Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate sentiment analysis', details: error.message },
      { status: 500 }
    )
  }
}
