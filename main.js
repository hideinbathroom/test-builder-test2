
let countdown = 3600; // 1시간 = 3600초
let countdownInterval;

// 시장 지표 UI 업데이트
function displayMarketIndicators(data) {
    if (!data || data.error || !data.kospi || !data.kosdaq || !data.exchangeRate) {
        console.error('Failed to parse market data:', data.error || 'Invalid format');
        document.getElementById('kospiIndex').textContent = 'N/A';
        document.getElementById('kosdaqIndex').textContent = 'N/A';
        document.getElementById('exchangeRate').textContent = 'N/A';
        return;
    }

    const { kospi, kosdaq, exchangeRate } = data;

    // KOSPI 지수 업데이트
    const kospiIndexEl = document.getElementById('kospiIndex');
    kospiIndexEl.textContent = kospi.index;
    kospiIndexEl.className = `stat-value ${parseFloat(kospi.change) >= 0 ? 'stat-up' : 'stat-down'}`;

    // KOSDAQ 지수 업데이트
    const kosdaqIndexEl = document.getElementById('kosdaqIndex');
    kosdaqIndexEl.textContent = kosdaq.index;
    kosdaqIndexEl.className = `stat-value ${parseFloat(kosdaq.change) >= 0 ? 'stat-up' : 'stat-down'}`;
    
    // 환율 업데이트
    document.getElementById('exchangeRate').textContent = exchangeRate.value;
    
    // 총 거래량은 Finnhub 무료 API에서 제공하지 않으므로 'N/A' 처리
    document.getElementById('totalVolume').textContent = 'N/A';
}

// 뉴스 UI 업데이트
function displayNews(articles) {
    const newsContent = document.getElementById('newsContent');
    if (!articles || articles.error) {
        newsContent.innerHTML = `<div class="news-item"><div class="news-title">뉴스 정보를 불러오는 데 실패했습니다.</div></div>`;
        console.error('Failed to parse news data:', articles.error || 'Invalid format');
        return;
    }
    
    if (articles.length === 0) {
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

// 프리미엄 기능 안내 메시지 표시
function displayPremiumFeatureMessage() {
    const premiumMessage = '<div class="loading" style="padding: 20px 0;">이 기능은 프리미엄 API 플랜에서 사용할 수 있습니다.</div>';
    document.getElementById('kospiContent').innerHTML = premiumMessage;
    document.getElementById('kosdaqContent').innerHTML = premiumMessage;
    document.getElementById('hotKeywords').innerHTML = premiumMessage;
}


// 전체 데이터 업데이트 함수
async function updateData() {
    try {
        const [marketData, newsArticles] = await Promise.all([
            fetch('/get-market-data').then(res => res.json()),
            fetch('/get-news').then(res => res.json())
        ]);
        
        // UI 업데이트
        displayMarketIndicators(marketData);
        displayNews(newsArticles);

        const now = new Date();
        document.getElementById('lastUpdate').textContent = `마지막 업데이트: ${now.toLocaleTimeString('ko-KR')}`;

        resetCountdown();
    } catch (error) {
        console.error('데이터 업데이트 실패:', error);
        document.getElementById('kospiIndex').textContent = 'Error';
        document.getElementById('kosdaqIndex').textContent = 'Error';
    }
}

// 카운트다운 리셋 함수
function resetCountdown() {
    countdown = 3600;
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
            countdown = 3600; 
        }
        updateCountdownDisplay();
    }, 1000);
}

// 초기화 함수
function initialize() {
    displayPremiumFeatureMessage(); // 초기 로드 시 프리미엄 메시지 표시
    updateData(); // 페이지 로드 시 즉시 데이터 표시
    setInterval(updateData, 3600000); // 1시간마다 자동 갱신
    startCountdown(); // 카운트다운 시작
}

// DOM이 준비되면 초기화 함수 실행
document.addEventListener('DOMContentLoaded', initialize);
