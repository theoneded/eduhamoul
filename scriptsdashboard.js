// بيانات الروابط
let links = JSON.parse(localStorage.getItem('eduhamoul_links')) || [
    {
        id: 1,
        title: "سكريبت تسجيل الحضور",
        url: "https://script.google.com/example1",
        description: "سكريبت لتسجيل حضور الموظفين",
        category: "حضور وانصراف",
        dateAdded: "2023-10-01"
    },
    {
        id: 2,
        title: "سكريبت إنشاء التقارير",
        url: "https://script.google.com/example2",
        description: "سكريبت لإنشاء تقارير شهرية",
        category: "تقارير",
        dateAdded: "2023-10-05"
    },
    {
        id: 3,
        title: "سكريبت متابعة المهام",
        url: "https://script.google.com/example3",
        description: "سكريبت لمتابعة تنفيذ المهام",
        category: "متابعة",
        dateAdded: "2023-10-10"
    }
];

// بيانات المستخدمين
let users = JSON.parse(localStorage.getItem('eduhamoul_users')) || [
    { username: 'admin', password: 'eduhamoul123' }
];

// تهيئة لوحة التحكم
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadUserInfo();
    loadLinks();
    setupNavigation();
    setupEventListeners();
    updateLinksCount();
});

// تحميل معلومات المستخدم
function loadUserInfo() {
    const username = localStorage.getItem('eduhamoul_username') || 'المسؤول';
    const currentUserElement = document.getElementById('currentUser');
    if (currentUserElement) {
        currentUserElement.textContent = username;
    }
}

// تحميل الروابط وعرضها
function loadLinks() {
    const linksContainer = document.getElementById('linksContainer');
    if (!linksContainer) return;
    
    if (links.length === 0) {
        linksContainer.innerHTML = '<div class="no-links">لا توجد روابط مضافة بعد. أضف رابطك الأول من قسم "إضافة رابط جديد".</div>';
        return;
    }
    
    let linksHTML = '';
    
    links.forEach(link => {
        linksHTML += `
        <div class="link-card">
            <div class="link-header">
                <h3>${link.title}</h3>
                <div class="link-actions">
                    <button class="edit-link" data-id="${link.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-link" data-id="${link.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <p class="link-description">${link.description}</p>
            <a href="${link.url}" target="_blank" class="link-url">${truncateUrl(link.url, 40)}</a>
            <div class="link-category">${link.category}</div>
        </div>
        `;
    });
    
    linksContainer.innerHTML = linksHTML;
    
    // إضافة مستمعي الأحداث للأزرار
    document.querySelectorAll('.edit-link').forEach(button => {
        button.addEventListener('click', function() {
            const linkId = parseInt(this.getAttribute('data-id'));
            editLink(linkId);
        });
    });
    
    document.querySelectorAll('.delete-link').forEach(button => {
        button.addEventListener('click', function() {
            const linkId = parseInt(this.getAttribute('data-id'));
            deleteLink(linkId);
        });
    });
}

// تقصير الروابط الطويلة للعرض
function truncateUrl(url, maxLength) {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
}

// إعداد التنقل بين الأقسام
function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar a');
    const sections = document.querySelectorAll('.dashboard-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // إزالة النشاط من جميع الروابط
            navLinks.forEach(l => l.classList.remove('active'));
            
            // إضافة النشاط للرابط الحالي
            this.classList.add('active');
            
            // إخفاء جميع الأقسام
            sections.forEach(section => section.classList.remove('active'));
            
            // عرض القسم المحدد
            const sectionId = this.getAttribute('data-section') + '-section';
            const activeSection = document.getElementById(sectionId);
            if (activeSection) {
                activeSection.classList.add('active');
            }
        });
    });
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // تسجيل الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('eduhamoul_loggedIn');
            localStorage.removeItem('eduhamoul_username');
            window.location.href = 'login.html';
        });
    }
    
    // تحديث الروابط
    const refreshBtn = document.getElementById('refreshLinks');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadLinks();
        });
    }
    
    // البحث في الروابط
    const searchInput = document.getElementById('searchLinks');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            filterLinks(searchTerm);
        });
    }
    
    // إضافة رابط جديد
    const addLinkForm = document.getElementById('addLinkForm');
    if (addLinkForm) {
        addLinkForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('linkTitle').value.trim();
            const url = document.getElementById('linkUrl').value.trim();
            const description = document.getElementById('linkDescription').value.trim();
            const category = document.getElementById('linkCategory').value;
            
            if (!title || !url) {
                alert('الرجاء إدخال عنوان الرابط ورابط Google Script');
                return;
            }
            
            // إنشاء رابط جديد
            const newLink = {
                id: links.length > 0 ? Math.max(...links.map(l => l.id)) + 1 : 1,
                title: title,
                url: url,
                description: description,
                category: category,
                dateAdded: new Date().toISOString().split('T')[0]
            };
            
            // إضافة الرابط إلى القائمة
            links.push(newLink);
            localStorage.setItem('eduhamoul_links', JSON.stringify(links));
            
            // إعادة تحميل الروابط
            loadLinks();
            updateLinksCount();
            
            // إعادة تعيين النموذج
            addLinkForm.reset();
            
            // الانتقال إلى قسم عرض الروابط
            document.querySelector('[data-section="links"]').click();
            
            alert('تم إضافة الرابط بنجاح!');
        });
    }
    
    // تغيير كلمة المرور
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            const currentUser = localStorage.getItem('eduhamoul_username') || 'admin';
            const userIndex = users.findIndex(u => u.username === currentUser);
            
            if (userIndex === -1 || users[userIndex].password !== currentPassword) {
                alert('كلمة المرور الحالية غير صحيحة!');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('كلمة المرور الجديدة غير متطابقة!');
                return;
            }
            
            if (newPassword.length < 6) {
                alert('كلمة المرور الجديدة يجب أن تكون على الأقل 6 أحرف!');
                return;
            }
            
            // تحديث كلمة المرور
            users[userIndex].password = newPassword;
            localStorage.setItem('eduhamoul_users', JSON.stringify(users));
            
            // إعادة تعيين النموذج
            changePasswordForm.reset();
            
            alert('تم تغيير كلمة المرور بنجاح!');
        });
    }
}

// تصفية الروابط حسب البحث
function filterLinks(searchTerm) {
    const filteredLinks = searchTerm 
        ? links.filter(link => 
            link.title.toLowerCase().includes(searchTerm) ||
            link.description.toLowerCase().includes(searchTerm) ||
            link.category.toLowerCase().includes(searchTerm) ||
            link.url.toLowerCase().includes(searchTerm)
          )
        : links;
    
    const linksContainer = document.getElementById('linksContainer');
    if (!linksContainer) return;
    
    if (filteredLinks.length === 0) {
        linksContainer.innerHTML = '<div class="no-links">لا توجد نتائج تطابق بحثك.</div>';
        return;
    }
    
    let linksHTML = '';
    
    filteredLinks.forEach(link => {
        linksHTML += `
        <div class="link-card">
            <div class="link-header">
                <h3>${link.title}</h3>
                <div class="link-actions">
                    <button class="edit-link" data-id="${link.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-link" data-id="${link.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <p class="link-description">${link.description}</p>
            <a href="${link.url}" target="_blank" class="link-url">${truncateUrl(link.url, 40)}</a>
            <div class="link-category">${link.category}</div>
        </div>
        `;
    });
    
    linksContainer.innerHTML = linksHTML;
}

// تحرير رابط
function editLink(id) {
    const link = links.find(l => l.id === id);
    if (!link) return;
    
    // ملء النموذج ببيانات الرابط
    document.getElementById('linkTitle').value = link.title;
    document.getElementById('linkUrl').value = link.url;
    document.getElementById('linkDescription').value = link.description;
    document.getElementById('linkCategory').value = link.category;
    
    // تغيير النموذج لوضع التحرير
    const form = document.getElementById('addLinkForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // حفظ حالة التحرير
    form.setAttribute('data-editing', id);
    submitBtn.innerHTML = '<i class="fas fa-save"></i> تحديث الرابط';
    
    // الانتقال إلى قسم إضافة رابط
    document.querySelector('[data-section="add-link"]').click();
    
    // تغيير سلوك النموذج للتحديث
    form.onsubmit = function(e) {
        e.preventDefault();
        
        const title = document.getElementById('linkTitle').value.trim();
        const url = document.getElementById('linkUrl').value.trim();
        const description = document.getElementById('linkDescription').value.trim();
        const category = document.getElementById('linkCategory').value;
        
        if (!title || !url) {
            alert('الرجاء إدخال عنوان الرابط ورابط Google Script');
            return;
        }
        
        // تحديث الرابط
        const linkIndex = links.findIndex(l => l.id === id);
        if (linkIndex !== -1) {
            links[linkIndex] = {
                ...links[linkIndex],
                title,
                url,
                description,
                category
            };
            
            localStorage.setItem('eduhamoul_links', JSON.stringify(links));
            loadLinks();
            updateLinksCount();
            
            // إعادة تعيين النموذج
            form.reset();
            form.removeAttribute('data-editing');
            submitBtn.innerHTML = '<i class="fas fa-save"></i> حفظ الرابط';
            
            // العودة إلى قسم الروابط
            document.querySelector('[data-section="links"]').click();
            
            alert('تم تحديث الرابط بنجاح!');
        }
    };
}

// حذف رابط
function deleteLink(id) {
    if (confirm('هل أنت متأكد من حذف هذا الرابط؟')) {
        links = links.filter(link => link.id !== id);
        localStorage.setItem('eduhamoul_links', JSON.stringify(links));
        loadLinks();
        updateLinksCount();
        alert('تم حذف الرابط بنجاح!');
    }
}

// تحديث عدد الروابط في الإعدادات
function updateLinksCount() {
    const linksCountElement = document.getElementById('linksCount');
    if (linksCountElement) {
        linksCountElement.textContent = links.length;
    }
}

// التحقق من المصادقة
function checkAuth() {
    const isLoggedIn = localStorage.getItem('eduhamoul_loggedIn');
    if (!isLoggedIn) {
        window.location.href = 'login.html';
    }
}