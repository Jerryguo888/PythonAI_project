$(document).ready(function() {
    
    // 發送訊息函數
    function sendMessage() {
        const message = $('#message').val().trim();
        
        // 檢查是否為空訊息
        if (message === '') {
            return;
        }
        
        // 顯示使用者訊息
        addUserMessage(message);
        
        // 清空輸入框
        $('#message').val('');
        
        // 顯示打字指示器
        showTypingIndicator();
        
        // 發送到後端
        $.ajax({
            url: '/call_llm',
            type: 'POST',
            data: { message: message },
            success: function(response) {
                // 移除打字指示器
                removeTypingIndicator();
                
                // 顯示 AI 回應
                addBotMessage(response);
            },
            error: function(xhr, status, error) {
                // 移除打字指示器
                removeTypingIndicator();
                
                // 顯示錯誤訊息
                addBotMessage('抱歉，發生錯誤了 😢');
                console.error('Error:', error);
            }
        });
    }
    
    // 添加使用者訊息
    function addUserMessage(text) {
        const time = getCurrentTime();
        const messageHtml = `
            <div class="message user">
                <img class="avatar" src="/static/images/image.png" alt="User Avatar">
                <div class="message-bubble">
                    ${escapeHtml(text)}
                    <span class="message-time">${time}</span>
                </div>
            </div>
        `;
        $('#dialog-div').append(messageHtml);
            adjustChatHeight();
            scrollToBottom();
    }
    
    // 添加機器人訊息（支援HTML內容）
    function addBotMessage(html) {
        const time = getCurrentTime();
        const messageHtml = `
            <div class="message other">
                <img class="avatar" src="/static/images/catmeme.png" alt="AI Avatar">
                <div class="message-bubble">
                    ${html}
                    <span class="message-time">${time}</span>
                </div>
            </div>
        `;
        $('#dialog-div').append(messageHtml);
            adjustChatHeight();
            scrollToBottom();
    }
    
    // 顯示打字指示器
    function showTypingIndicator() {
        const typingHtml = `
            <div class="message other typing-message">
                <img class="avatar" src="/static/images/catmeme.png" alt="AI Avatar">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        $('#dialog-div').append(typingHtml);
            adjustChatHeight();
            scrollToBottom();
    }

        // 調整聊天室顯示區高度，讓它在輸入欄固定時仍可滾動
        function adjustChatHeight() {
            const header = document.querySelector('.chat-header');
            const input = document.querySelector('.input-area');
            const container = document.querySelector('.scrollable-container');
            if (!container) return;
            const headerH = header ? header.offsetHeight : 0;
            const inputH = input ? input.offsetHeight : 0;
            const extraGap = 16; // 額外間隙
            const newHeight = window.innerHeight - headerH - inputH - extraGap;
            if (newHeight > 100) {
                container.style.height = newHeight + 'px';
                container.style.overflowY = 'auto';
            }
        }
    
    // 移除打字指示器
    function removeTypingIndicator() {
        $('.typing-message').remove();
    }
    
    // 獲取當前時間
    function getCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    // 轉義HTML（僅用於使用者輸入）
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
    
    // 滾動到底部
    function scrollToBottom() {
        const container = $('#dialog-div');
        container.animate({
            scrollTop: container[0].scrollHeight
        }, 300);
    }
    
    // 點擊發送按鈕
    $('#submit').click(function() {
        sendMessage();
    });
    
    // 按 Enter 發送訊息
    $('#message').keypress(function(e) {
        if (e.which === 13) { // Enter key
            sendMessage();
        }
    });
    
    // 頁面載入時顯示歡迎訊息（可選）
    setTimeout(function() {
        addBotMessage('yo was up twin？');
    }, 500);
    
        // 初始調整與 resize 綁定
        adjustChatHeight();
        $(window).on('resize', function() {
            adjustChatHeight();
        });
    
});