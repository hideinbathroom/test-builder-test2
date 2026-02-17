
let countdown = 3600; // 1시간 = 3600초
let countdownInterval;

// 시장 지표 및 인기 검색어 UI 업데이트
function displayMarketIndicators(data) {
    if (!data || !data.kospi || !data.kosdaq || !data.exchangeRate) {
        console.error('잘못된 시장 지표 데이터 형식');
        return;
    }

    const { kospi, kosdaq, exchangeRate, hotKeywords } = data;

    const kospiIndexEl = document.getElementById('kospiIndex');
    kospiIndexEl.textContent = kospi.index;
    kospiIndexEl.className = `stat-value ${parseFloat(kospi.change) >= 0 ? 'stat-up' : 'stat-down'}`;

    const kosdaqIndexEl = document.getElementById('kosdaqIndex');
    kosdaqIndexEl.textContent = kosdaq.index;
    kosdaqIndexEl.className = `stat-value ${parseFloat(kosdaq.change) >= 0 ? 'stat-up' : 'stat-down'}`;

    document.getElementById('exchangeRate').textContent = exchangeRate.value;
    
    // 거래량은 현재 API에서 제공하지 않으므로 'N/A' 처리
    document.getElementById('totalVolume').textContent = 'N/A'; 

    // 인기 검색어 업데이트
    const hotKeywordsEl = document.getElementById('hotKeywords');
    if (hotKeywords && hotKeywords.length > 0) {
        let keywordsHtml = '';
        hotKeywords.forEach((keyword, index) => {
            keywordsHtml += `
                <div class="market-indicator">
                    <span class="indicator-name">${index + 1}. ${keyword}</span>
                </div>
            `;
        });
        hotKeywordsEl.innerHTML = keywordsHtml;
    }
}


// 뉴스 UI 업데이트
function displayNews(articles) {
     const newsContent = document.getElementById('newsContent');
    if (!articles || articles.length === 0) {
        newsContent.innerHTML = '<div class="news-item"><div class="news-title">새로운 뉴스가 없습니다.</div></div>';
        return;
    }
    
    let newsHtml = '';
    articles.slice(0, 5).forEach(article => {
        const publishedDate = new Date(article.publishedAt);
        const timeString = publishedDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        newsHtml += `
            <div class="news-item" onclick="window.open('${article.url}', '_blank')" style="cursor: pointer;">
                <div class="news-time">${timeString}</div>
                <div class="news-title">${article.title}</div>
            </div>
        `;
    });
    newsContent.innerHTML = newsHtml;
}


// 숫자 포맷팅 함수
function formatNumber(numStr) {
    if (typeof numStr !== 'string') return numStr;
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 거래량 포맷팅 함수 (스크래핑 데이터에 맞게 조정)
function formatVolume(volumeStr) {
    if (typeof volumeStr !== 'string') return volumeStr;
    const volume = parseInt(volumeStr.replace(/,/g, ''), 10);
    if (isNaN(volume)) return volumeStr;

    if (volume >= 1000000) {
        return (volume / 1000000).toFixed(1) + '백만';
    } else if (volume >= 1000) {
        return (volume / 1000).toFixed(0) + '천';
    }
    return volume.toString();
}

// 주식 테이블 생성 함수 (스크래핑 데이터에 맞게 조정)
function createTable(stocks) {
    if (!stocks || stocks.length === 0) {
         return '<div class="loading">종목 정보를 불러오는 데 실패했거나 데이터가 없습니다.</div>';
    }

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
        // 스크래핑 데이터는 등락 부호가 changeRate에 포함되어 있음
        const isUp = !stock.changeRate.includes('-');
        const priceClass = isUp ? 'price-up' : 'price-down';
        const changeSymbol = isUp ? '▲' : '▼';

        html += `
            <tr>
                <td class="rank">${stock.rank}</td>
                <td class="stock-name">${stock.name}</td>
                <td class="${priceClass}">${formatNumber(stock.price)}원</td>
                <td class="${priceClass}">
                    ${changeSymbol} ${formatNumber(stock.change)} (${stock.changeRate})
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
    // 로딩 스피너를 다시 표시
    document.getElementById('kospiContent').innerHTML = '<div class="loading"><div class="spinner"></div>데이터를 불러오는 중입니다...</div>';
    document.getElementById('kosdaqContent').innerHTML = '<div class="loading"><div class="spinner"></div>데이터를 불러오는 중입니다...</div>';

    try {
        const [marketData, topStocks, newsArticles] = await Promise.all([
            fetch('/get-market-data').then(res => res.json()),
            fetch('/get-top-stocks').then(res => res.json()),
            fetch('/get-news').then(res => res.json())
        ]);
        
        // 에러가 있는 응답을 확인
        if (marketData.error) throw new Error(`시장 데이터 오류: ${marketData.error}`);
        if (topStocks.error) throw new Error(`종목 데이터 오류: ${topStocks.error}`);
        if (newsArticles.error) throw new Error(`뉴스 데이터 오류: ${newsArticles.error}`);


        // UI 업데이트
        displayMarketIndicators(marketData);
        document.getElementById('kospiContent').innerHTML = createTable(topStocks.kospi);
        document.getElementById('kosdaqContent').innerHTML = createTable(topStocks.kosdaq);
        displayNews(newsArticles);

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
    countdown = 300;
    updateCountdownDisplay();
}

// 카운트다운 표시 업데이트 함수
function updateCountdownDisplay() {
    document.getElementById('countdown').textContent = `다음 업데이트까지: ${countdown}초`;
}

// 카운트다운 시작 함수
function startCountdown() {
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        countdown--;
        if (countdown < 0) {
            countdown = 300; 
        }
        updateCountdownDisplay();
    }, 1000);
}

// 초기화 함수
function initialize() {
    updateData(); // 페이지 로드 시 즉시 데이터 표시
    setInterval(updateData, 3600000); // 1시간마다 자동 갱신
    startCountdown(); // 카운트다운 시작
}

// DOM이 준비되면 초기화 함수 실행
document.addEventListener('DOMContentLoaded', initialize);
