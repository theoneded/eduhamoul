// بيانات المستخدم الافتراضية (يمكن تغييرها من لوحة التحكم)
let users = JSON.parse(localStorage.getItem('eduhamoul_users')) || [
    { username: 'admin', password: 'eduhamoul123' }
];

// التحقق من حالة تسجيل الدخول
function checkAuth() {
    const isLoggedIn = localStorage.getItem('eduhamoul_loggedIn');
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'dashboard.html' && !isLoggedIn) {
        window.location.href = 'login.html';
    }
    
    if ((currentPage === 'login.html' || currentPage === 'index.html') && isLoggedIn) {
        window.location.href = 'dashboard.html';
    }
}

// معالجة تسجيل الدخول
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            
            // البحث عن المستخدم
            const user = users.find(u => u.username === username && u.password === password);
            
            if (user) {
                // تسجيل الدخول ناجح
                localStorage.setItem('eduhamoul_loggedIn', 'true');
                localStorage.setItem('eduhamoul_username', username);
                
                // توجيه إلى لوحة التحكم
                window.location.href = 'dashboard.html';
            } else {
                alert('اسم المستخدم أو كلمة المرور غير صحيحة!');
            }
        });
    }
});