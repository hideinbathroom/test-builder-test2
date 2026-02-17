// functions/get-market-data.js
import { parse } from 'node-html-parser';

// 네이버 증권에서 시장 지표를 스크래핑하는 함수
export async function onRequest(context) {
    try {
        // 네이버 증권 메인 페이지 URL
        const url = 'https://finance.naver.com/';
        
        // CORS 문제를 피하기 위해 Cloudflare의 fetch를 사용해 페이지 HTML을 가져옵니다.
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        if (!response.ok) {
            throw new Error(`네이버 증권 페이지를 불러오는 데 실패했습니다: ${response.statusText}`);
        }

        const html = await response.text();
        const root = parse(html);

        // 코스피 지수 정보 추출
        const kospiElement = root.querySelector('#content > div.article > div.section2 > div.section_stock_market > div.section_stock > div.kospi_area.group_quot.quot_opn > div.heading_area > a > span.num');
        const kospiIndex = kospiElement ? kospiElement.text.trim() : 'N/A';
        
        const kospiChangeElement = root.querySelector('#content > div.article > div.section2 > div.section_stock_market > div.section_stock > div.kospi_area.group_quot.quot_opn > div.heading_area > a > span.num2');
        const kospiChange = kospiChangeElement ? kospiChangeElement.text.trim() : 'N/A';

        const kospiChangeRateElement = root.querySelector('#content > div.article > div.section2 > div.section_stock_market > div.section_stock > div.kospi_area.group_quot.quot_opn > div.heading_area > a > span.num3');
        const kospiChangeRate = kospiChangeRateElement ? kospiChangeRateElement.text.trim() : 'N/A';


        // 코스닥 지수 정보 추출
        const kosdaqElement = root.querySelector('#content > div.article > div.section2 > div.section_stock_market > div.section_stock > div.kosdaq_area.group_quot > div.heading_area > a > span.num');
        const kosdaqIndex = kosdaqElement ? kosdaqElement.text.trim() : 'N/A';

        const kosdaqChangeElement = root.querySelector('#content > div.article > div.section2 > div.section_stock_market > div.section_stock > div.kosdaq_area.group_quot > div.heading_area > a > span.num2');
        const kosdaqChange = kosdaqChangeElement ? kosdaqChangeElement.text.trim() : 'N/A';

        const kosdaqChangeRateElement = root.querySelector('#content > div.article > div.section2 > div.section_stock_market > div.section_stock > div.kosdaq_area.group_quot > div.heading_area > a > span.num3');
        const kosdaqChangeRate = kosdaqChangeRateElement ? kosdaqChangeRateElement.text.trim() : 'N/A';


        // 환율 정보 추출 (원/달러)
        const exchangeRateElement = root.querySelector('#content > div.article > div.section2 > div.section_stock_market > div.market_include > div > table > tbody > tr:nth-child(1) > td:nth-child(1)');
        const exchangeRate = exchangeRateElement ? exchangeRateElement.text.trim() : 'N/A';

        // 인기 검색어 추출
        const hotKeywords = [];
        const keywordRows = root.querySelectorAll('#container > div.aside > div > div.group_aside > div.aside_area.aside_popular > table > tbody > tr');
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
            hotKeywords: hotKeywords.slice(0, 5), // 상위 5개만 사용
        };

        return new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json',
                // 5분(300초) 동안 결과를 캐시합니다.
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
