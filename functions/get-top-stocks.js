// functions/get-top-stocks.js
import { parse } from 'node-html-parser';
import iconv from 'iconv-lite';

// Helper function to parse a single row of the stock table
function parseStockRow(row) {
    const rankElement = row.querySelector('.no');
    if (!rankElement) return null; // Skip headers or invalid rows
    
    const rank = rankElement.text.trim();
    if (!rank || isNaN(parseInt(rank))) return null;

    const nameElement = row.querySelector('a.tltle');
    const name = nameElement ? nameElement.text.trim() : 'N/A';

    const price = row.querySelector('.number:nth-child(3)')?.text.trim() || 'N/A';
    const changeElement = row.querySelector('.number:nth-child(4)');
    
    let change = '0';
    if (changeElement) {
        change = changeElement.text.trim();
    }
    
    const changeRateElement = row.querySelector('.number:nth-child(5)');
    let changeRate = '0.00%';
    if (changeRateElement) {
        changeRate = changeRateElement.text.trim();
    }
    
    const volume = row.querySelector('.number:nth-child(6)')?.text.trim() || 'N/A';

    return {
        rank: parseInt(rank),
        name,
        price,
        change,
        changeRate,
        volume,
    };
}


// Function to scrape top stocks for a given market (KOSPI or KOSDAQ)
async function scrapeMarket(marketType) {
    const url = `https://finance.naver.com/sise/sise_quant.naver?sosok=${marketType === 'kospi' ? '0' : '1'}`;
    
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
    });

    if (!response.ok) {
        throw new Error(`${marketType} 데이터를 불러오는 데 실패했습니다: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const html = iconv.decode(Buffer.from(buffer), 'euc-kr');
    const root = parse(html);

    const stockList = [];
    const rows = root.querySelectorAll('table.type_2 tr[onmouseover]');

    for (const row of rows) {
        if (stockList.length >= 5) break; // We only need top 5
        
        const stockData = parseStockRow(row);
        if (stockData) {
            stockList.push(stockData);
        }
    }
    return stockList;
}

// Main Cloudflare Function handler
export async function onRequest(context) {
    try {
        const [kospi, kosdaq] = await Promise.all([
            scrapeMarket('kospi'),
            scrapeMarket('kosdaq')
        ]);

        return new Response(JSON.stringify({ kospi, kosdaq }), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=3600', // 1-hour cache
            },
        });
    } catch (error) {
        console.error('거래량 상위 종목 스크래핑 오류:', error);
        return new Response(JSON.stringify({ error: '서버에서 종목 데이터를 가져오는 중 오류가 발생했습니다.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
