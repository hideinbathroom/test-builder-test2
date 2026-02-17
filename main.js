
let countdown = 60; // 업데이트 주기를 60초로 변경
let countdownInterval;

// 시장 지표 업데이트 함수 (데모)
function updateMarketIndicators() {
    const kospiChange = (Math.random() * 20 - 10).toFixed(2);
    const kosdaqChange = (Math.random() * 10 - 5).toFixed(2);

    // 데모 데이터 (2026년 기준)
    document.getElementById('kospiIndex').textContent = (5017 + parseFloat(kospiChange)).toFixed(2);
    document.getElementById('kospiIndex').className = `stat-value ${kospiChange >= 0 ? 'stat-up' : 'stat-down'}`;

    document.getElementById('kosdaqIndex').textContent = (1014 + parseFloat(kosdaqChange)).toFixed(2);
    document.getElementById('kosdaqIndex').className = `stat-value ${kosdaqChange >= 0 ? 'stat-up' : 'stat-down'}`;

    document.getElementById('exchangeRate').textContent = (1446 + Math.random() * 30).toFixed(2);
    document.getElementById('totalVolume').textContent = (100 + Math.floor(Math.random() * 50)) + '억주';
}

// 뉴스 업데이트 함수 (API 연동)
async function updateNews() {
    try {
        const response = await fetch('/get-news');
        if (!response.ok) {
            throw new Error(`뉴스 데이터 요청 실패: ${response.statusText}`);
        }
        const articles = await response.json();
        const newsContent = document.getElementById('newsContent');
        
        if (articles.length === 0) {
            newsContent.innerHTML = '<div class="news-item"><div class="news-title">새로운 뉴스가 없습니다.</div></div>';
            return;
        }

        let newsHtml = '';
        articles.slice(0, 5).forEach(article => {
            // 'Z'를 추가하여 UTC 시간임을 명확히 함
            const publishedDate = new Date(article.publishedAt + 'Z'); 
            const timeString = publishedDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

            newsHtml += `
                <div class="news-item" onclick="window.open('${article.url}', '_blank')" style="cursor: pointer;">
                    <div class="news-time">${timeString}</div>
                    <div class="news-title">${article.title}</div>
                </div>
            `;
        });
        newsContent.innerHTML = newsHtml;
    } catch (error) {
        console.error('뉴스 업데이트 중 오류 발생:', error);
        document.getElementById('newsContent').innerHTML = '<div class="news-item"><div class="news-title">뉴스 정보를 불러오는 데 실패했습니다.</div></div>';
    }
}


// ============================================
// 실시간 주식 데이터 가져오기 (현재는 데모)
// ============================================
async function fetchStockData() {
    // 이 부분은 나중에 실제 주식 API로 대체될 수 있습니다.
    // 현재는 시뮬레이션 데이터 사용
    const kospiStocks = generateMockData('코스피');
    const kosdaqStocks = generateMockData('코스닥');

    return { kospi: kospiStocks, kosdaq: kosdaqStocks };
}

// 데모용 주식 데이터 생성 함수
function generateMockData(market) {
    const companies = market === '코스피'
        ? ['삼성전자', 'SK하이닉스', '한화갤러리아', '에스엠벡셀', '삼성전자우']
        : ['휴림로봇', '다날', '휴림에이텍', '에코프로', '쎄노텍'];

    const basePrices = market === '코스피'
        ? [152700, 550000, 1860, 2690, 114000]
        : [15690, 10180, 1177, 130000, 2000];

    return companies.map((name, index) => ({
        rank: index + 1,
        name: name,
        price: basePrices[index] + Math.floor(Math.random() * 1000) - 500,
        change: (Math.random() * 10 - 5).toFixed(2),
        changeRate: (Math.random() * 5 - 2.5).toFixed(2),
        volume: Math.floor(Math.random() * 50000000) + 10000000
    }));
}

// 숫자 포맷팅 함수
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 거래량 포맷팅 함수
function formatVolume(volume) {
    if (volume >= 1000000) {
        return (volume / 1000000).toFixed(1) + '백만';
    } else if (volume >= 1000) {
        return (volume / 1000).toFixed(0) + '천';
    }
    return volume.toString();
}

// 주식 테이블 생성 함수
function createTable(stocks) {
    let html = `
        <table>
            <thead>
                <tr>
                    <th>순위</th>
                    <th>종목명</th>
                    <th>현재가</th>
                    <th>등락률</th>
                    <th>거래량</th>
                </tr>
            </thead>
            <tbody>
    `;

    stocks.forEach(stock => {
        const priceClass = stock.change >= 0 ? 'price-up' : 'price-down';
        const changeSymbol = stock.change >= 0 ? '▲' : '▼';

        html += `
            <tr>
                <td class="rank">${stock.rank}</td>
                <td class="stock-name">${stock.name}</td>
                <td class="${priceClass}">${formatNumber(stock.price)}원</td>
                <td class="${priceClass}">
                    ${changeSymbol} ${Math.abs(stock.change)} (${Math.abs(stock.changeRate)}%)
                </td>
                <td class="volume">${formatVolume(stock.volume)}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;
    return html;
}

// 전체 데이터 업데이트 함수
async function updateData() {
    try {
        // 주식 데이터 업데이트 (현재는 데모)
        const stockData = await fetchStockData();
        document.getElementById('kospiContent').innerHTML = createTable(stockData.kospi);
        document.getElementById('kosdaqContent').innerHTML = createTable(stockData.kosdaq);

        // 사이드바 지표 업데이트 (데모)
        updateMarketIndicators();
        
        // 뉴스 데이터 업데이트 (API 호출)
        await updateNews();

        const now = new Date();
        document.getElementById('lastUpdate').textContent = `마지막 업데이트: ${now.toLocaleTimeString('ko-KR')}`;

        resetCountdown();
    } catch (error) {
        console.error('데이터 업데이트 실패:', error);
        document.getElementById('kospiContent').innerHTML = '<div class="loading">데이터를 불러오는데 실패했습니다.</div>';
        document.getElementById('kosdaqContent').innerHTML = '<div class="loading">데이터를 불러오는데 실패했습니다.</div>';
    }
}

// 카운트다운 리셋 함수
function resetCountdown() {
    countdown = 60;
    updateCountdownDisplay();
}

// 카운트다운 표시 업데이트 함수
function updateCountdownDisplay() {
    document.getElementById('countdown').textContent = `다음 업데이트까지: ${countdown}초`;
}

// 카운트다운 시작 함수
function startCountdown() {
    clearInterval(countdownInterval); // 기존 인터벌 클리어
    countdownInterval = setInterval(() => {
        countdown--;
        if (countdown < 0) {
            countdown = 60; // 즉시 리셋하지 않고 다음 업데이트 주기에 맞춤
        }
        updateCountdownDisplay();
    }, 1000);
}

// 초기화 함수
function initialize() {
    // 페이지 로드 시 즉시 데이터 표시
    updateData();

    // 60초마다 자동 갱신
    setInterval(updateData, 60000);

    // 카운트다운 시작
    startCountdown();
}

// DOM이 준비되면 초기화 함수 실행
document.addEventListener('DOMContentLoaded', initialize);
