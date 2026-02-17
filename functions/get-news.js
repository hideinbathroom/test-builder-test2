// functions/get-news.js

/**
 * Cloudflare Function to fetch top headlines from GNews API.
 * This function acts as a secure proxy to hide the API key from the client.
 */
export async function onRequest(context) {
    // --- 사용자 설정 필요 ---
    // GNews API 키를 Cloudflare 환경 변수로 저장해야 합니다.
    // Cloudflare Pages 대시보드 > 설정 > 환경 변수에서
    // 'GNEWS_API_KEY'라는 이름으로 키를 추가하세요.
    const API_KEY = context.env.GNEWS_API_KEY;

    // API 키가 설정되지 않았을 경우 에러 메시지를 반환합니다.
    if (!API_KEY) {
        return new Response(JSON.stringify({ error: "GNEWS_API_KEY가 설정되지 않았습니다. Cloudflare 환경 변수를 확인하세요." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // GNews API 엔드포인트 (한국, 언어: 한국어)
    const apiUrl = `https://gnews.io/api/v4/top-headlines?country=kr&lang=ko&token=${API_KEY}`;

    try {
        // GNews API에 데이터 요청
        const response = await fetch(apiUrl);

        if (!response.ok) {
            // API 요청이 실패한 경우, GNews에서 보낸 에러 메시지를 그대로 반환
            const errorData = await response.json();
            console.error('GNews API Error:', errorData);
            return new Response(JSON.stringify(errorData), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const data = await response.json();

        // 성공적으로 받은 뉴스 기사 데이터를 클라이언트에게 JSON 형태로 반환
        return new Response(JSON.stringify(data.articles), {
            headers: {
                'Content-Type': 'application/json',
                // 캐시 설정을 통해 1분(60초) 동안 결과를 캐시하여 불필요한 API 호출을 줄입니다.
                'Cache-Control': 'public, max-age=60',
            },
        });

    } catch (error) {
        console.error('Cloudflare Function Error:', error);
        return new Response(JSON.stringify({ error: "뉴스 데이터를 가져오는 중 서버에서 오류가 발생했습니다." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
