// functions/get-market-data.js
import { parse } from 'node-html-parser';
import iconv from 'iconv-lite';

export async function onRequest(context) {
    try {
        const url = 'https://finance.naver.com/';
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        if (!response.ok) {
            throw new Error(`네이버 증권 페이지를 불러오는 데 실패했습니다: ${response.status}`);
        }

        // EUC-KR로 인코딩된 HTML을 디코딩
        const buffer = await response.arrayBuffer();
        const html = iconv.decode(Buffer.from(buffer), 'euc-kr');
        const root = parse(html);

        // 더 안정적인 선택자로 변경
        const kospiIndex = root.querySelector('.kospi_area .num_value')?.text.trim() || 'N/A';
        const kospiQuot = root.querySelector('.kospi_area .num_quot')?.text.trim().split(' ') || ['N/A'];
        const kospiChange = kospiQuot[0] || 'N/A';
        const kospiChangeRate = kospiQuot[1] || 'N/A';
        
        const kosdaqIndex = root.querySelector('.kosdaq_area .num_value')?.text.trim() || 'N/A';
        const kosdaqQuot = root.querySelector('.kosdaq_area .num_quot')?.text.trim().split(' ') || ['N/A'];
        const kosdaqChange = kosdaqQuot[0] || 'N/A';
        const kosdaqChangeRate = kosdaqQuot[1] || 'N/A';

        // 환율 정보 추출 (USD)
        const exchangeRateElement = root.querySelector('#exchangeList > li.on > a > .head_info > .value');
        const exchangeRate = exchangeRateElement ? exchangeRateElement.text.trim() : 'N/A';

        // 인기 검색어 추출
        const hotKeywords = [];
        const keywordRows = root.querySelectorAll('.aside_popular table tbody tr');
        keywordRows.forEach(row => {
            const keywordElement = row.querySelector('th > a');
            if (keywordElement) {
                hotKeywords.push(keywordElement.text.trim());
            }
        });

        const data = {
            kospi: {
                index: kospiIndex,
                change: kospiChange,
                changeRate: kospiChangeRate,
            },
            kosdaq: {
                index: kosdaqIndex,
                change: kosdaqChange,
                changeRate: kosdaqChangeRate,
            },
            exchangeRate: {
                value: exchangeRate,
            },
            hotKeywords: hotKeywords.slice(0, 5),
        };

        return new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=3600',
            },
        });

    } catch (error) {
        console.error('시장 지표 데이터 스크래핑 오류:', error);
        return new Response(JSON.stringify({ error: '서버에서 데이터를 가져오는 중 오류가 발생했습니다.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
