// functions/get-market-data.js

// Helper function to fetch data from a Finnhub endpoint
async function fetchFinnhubData(endpoint, apiKey) {
    const url = `https://finnhub.io/api/v1${endpoint}&token=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Finnhub API 요청 실패: ${response.statusText}`);
    }
    return response.json();
}

export async function onRequest(context) {
    // --- 사용자 설정 필요 ---
    // Finnhub API 키를 Cloudflare 환경 변수로 저장해야 합니다.
    // Cloudflare Pages 대시보드 > 설정 > 환경 변수에서
    // 'FINNHUB_API_KEY'라는 이름으로 키를 추가하세요.
    const API_KEY = context.env.FINNHUB_API_KEY;

    if (!API_KEY) {
        return new Response(JSON.stringify({ error: "FINNHUB_API_KEY가 설정되지 않았습니다." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // Promise.all을 사용해 여러 API를 동시에 요청
        const [kospiData, kosdaqData, forexData] = await Promise.all([
            fetchFinnhubData('/quote?symbol=^KS11', API_KEY),
            fetchFinnhubData('/quote?symbol=^KQ11', API_KEY),
            fetchFinnhubData('/forex/rates?base=USD', API_KEY)
        ]);

        // API 응답에서 필요한 데이터만 추출 및 가공
        const data = {
            kospi: {
                index: kospiData.c?.toFixed(2) || 'N/A', // c: current price
                change: kospiData.d?.toFixed(2) || 'N/A', // d: change
                changeRate: kospiData.dp?.toFixed(2) || 'N/A' // dp: percent change
            },
            kosdaq: {
                index: kosdaqData.c?.toFixed(2) || 'N/A',
                change: kosdaqData.d?.toFixed(2) || 'N/A',
                changeRate: kosdaqData.dp?.toFixed(2) || 'N/A'
            },
            exchangeRate: {
                value: forexData.quote?.KRW?.toFixed(2) || 'N/A'
            }
        };

        return new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=3600', // 1시간 캐시
            },
        });

    } catch (error) {
        console.error('시장 지표 API 요청 오류:', error);
        return new Response(JSON.stringify({ error: 'API에서 데이터를 가져오는 중 오류가 발생했습니다.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
