// --- Lắng nghe sự kiện cho Form Đăng Ký ---
const registerForm = document.getElementById('register-form');
if (registerForm) { // Chỉ chạy nếu form tồn tại trên trang hiện tại
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Ngăn form gửi theo cách truyền thống

        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const errorMessageDiv = document.getElementById('error-message');

        // Reset thông báo lỗi
        if(errorMessageDiv) errorMessageDiv.textContent = '';

        // Lấy giá trị từ form và loại bỏ khoảng trắng thừa (trừ password)
        const username = usernameInput?.value.trim();
        const email = emailInput?.value.trim();
        const password = passwordInput?.value; // Mật khẩu giữ nguyên khoảng trắng nếu có
        const confirmPassword = confirmPasswordInput?.value;

        // --- BẮT ĐẦU VALIDATION PHÍA CLIENT ---

        // 1. Kiểm tra trường trống
        if (!username || !email || !password || !confirmPassword) {
            if(errorMessageDiv) errorMessageDiv.textContent = 'Please fill in all the information.';
            return; // Dừng lại
        }

        // 2. Kiểm tra định dạng Email (ví dụ đơn giản)
        // Regex này kiểm tra cấu trúc cơ bản user@domain.ext
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            if(errorMessageDiv) errorMessageDiv.textContent = 'Invalid email format.';
            return; // Dừng lại
        }

        // 3. Kiểm tra độ dài mật khẩu (ví dụ: ít nhất 6 ký tự)
        if (password.length < 6) {
             if(errorMessageDiv) errorMessageDiv.textContent = 'Password must have at least 6 characters.';
             return; // Dừng lại
        }
        // (Tùy chọn) Thêm kiểm tra độ dài tối đa nếu cần
        // if (password.length > 100) {
        //     if(errorMessageDiv) errorMessageDiv.textContent = 'Mật khẩu quá dài (tối đa 100 ký tự).';
        //     return;
        // }

        // 4. Kiểm tra mật khẩu nhập lại
        if (password !== confirmPassword) {
            if(errorMessageDiv) errorMessageDiv.textContent = 'Password confirmation does not match!';
            return; // Dừng lại
        }

        // (Tùy chọn) Thêm các kiểm tra khác nếu cần: độ phức tạp mật khẩu, username hợp lệ,...

        // --- KẾT THÚC VALIDATION PHÍA CLIENT ---


        // Tạo đối tượng dữ liệu gửi đi (chỉ gửi những gì backend cần)
        // Thường không cần gửi confirmPassword lên backend
        const userData = {
            username: username,
            email: email,
            password: password,
            confirmPassword : confirmPassword
        };

        try {
            // Gọi API backend bằng fetch
            const response = await fetch('http://localhost:5000/api/auth/register', { // Đảm bảo URL đúng
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData), // Chuyển object thành chuỗi JSON
            });

            // Cố gắng parse JSON response, kể cả khi lỗi
            let data = null;
            try {
                 data = await response.json();
            } catch (parseError) {
                 console.error('JSON parse error during registration:', parseError);
                 // Hiển thị lỗi dựa trên status nếu không parse được JSON
                 if(errorMessageDiv) errorMessageDiv.textContent = `Server response error (Status: ${response.status}).`;
                 return; // Dừng xử lý
            }

            if (!response.ok) {
                // --- Xử lý lỗi ĐĂNG KÝ từ Backend ---
                let customErrorMessage = '';
                const errorCode = data?.errorCode;    // Lấy errorCode từ backend (nếu có)
                const serverMessage = data?.message; // Lấy message từ backend (nếu có)

                // **Định nghĩa thông báo lỗi đăng ký tùy chỉnh**
                switch (errorCode) {
                    case 'USERNAME_EXISTS':
                        customErrorMessage = 'This username already exists.';
                        break;
                    case 'EMAIL_EXISTS':
                        customErrorMessage = 'This email address is already registered.Please use another email.';
                        break;
                    // Thêm các mã lỗi đăng ký khác nếu backend có hỗ trợ
                    case 'SERVER_ERROR':
                        customErrorMessage = 'Server-side system error during registration.';
                        break;
                    default:
                        // Nếu không có errorCode cụ thể, dùng message từ server hoặc báo lỗi chung
                        customErrorMessage = serverMessage || `Registration failed (Error: ${errorCode || response.status}).`;
                }
                // --- Kết thúc định nghĩa ---

                if(errorMessageDiv) errorMessageDiv.textContent = customErrorMessage;

            } else {
                // Đăng ký thành công!
                alert('Registration successful! You will be redirected to the login page.'); // Thông báo cho người dùng
                window.location.href = 'login.html'; // Chuyển hướng sang trang đăng nhập
            }
        } catch (error) {
            // Lỗi mạng hoặc lỗi không kết nối được tới server
            console.error('Registration fetch error:', error);
            if(errorMessageDiv) errorMessageDiv.textContent = 'Cannot connect to the server. Please try again.';
        }
    });
}

// --- Lắng nghe sự kiện cho Form Đăng Nhập ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const errorMessageDiv = document.getElementById('error-message');

        // Reset thông báo lỗi cũ
        if (errorMessageDiv) errorMessageDiv.textContent = '';

        const email = emailInput?.value;
        const password = passwordInput?.value;

        // --- Kiểm tra dữ liệu nhập cơ bản ---
        if (!email || !password) {
             if (errorMessageDiv) errorMessageDiv.textContent = 'Please fill in the Email and Password fields.';
             return; // Dừng không gửi request
        }
        // --- Kết thúc kiểm tra cơ bản ---

        const loginData = { email: email, password: password };

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData),
            });

            // Cố gắng parse JSON response, kể cả khi lỗi
            let data = null;
            try {
                 data = await response.json();
            } catch (parseError) {
                 console.error('JSON parse error during login:', parseError);
                 if (errorMessageDiv) errorMessageDiv.textContent = `Server response error. (Status: ${response.status}).`;
                 return; // Dừng xử lý
            }


            if (!response.ok) {
                // --- Xử lý lỗi ĐĂNG NHẬP (Cách 1 - Workaround) ---
                let customErrorMessage = '';
                const errorCode = data?.errorCode;    // Lấy errorCode (nếu có)
                const serverMessage = data?.message; // Lấy message (luôn kiểm tra)

                // **Định nghĩa thông báo lỗi đăng nhập tùy chỉnh**
                // Ưu tiên kiểm tra message cụ thể "Invalid credentials."
                if (serverMessage === 'Invalid credentials.') {
                    customErrorMessage = 'Incorrect Email or Password.';
                } else {
                    // Nếu không phải message đó, thì mới dựa vào errorCode (nếu có)
                    switch (errorCode) {
                        case 'USER_NOT_FOUND': // Chỉ xử lý nếu backend có gửi mã này
                            customErrorMessage = 'This email address is not registered.';
                            break;
                        // Thêm các mã lỗi đăng nhập khác nếu backend có hỗ trợ
                        // case 'ACCOUNT_LOCKED':
                        //     customErrorMessage = 'Tài khoản của bạn đã bị khóa.';
                        //     break;
                        case 'SERVER_ERROR':
                            customErrorMessage = 'Server-side system error during login.';
                            break;
                        default:
                            // Nếu không khớp message và cũng không khớp errorCode nào
                            // thì dùng message từ server (nếu có) hoặc báo lỗi chung
                            customErrorMessage = serverMessage || `Login failed (Error: ${errorCode || response.status}).`;
                    }
                }
                // --- Kết thúc định nghĩa ---

                if (errorMessageDiv) errorMessageDiv.textContent = customErrorMessage;

            } else {
                // Đăng nhập thành công! (response.ok là true)
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                    if (data.user) {
                       localStorage.setItem('userInfo', JSON.stringify(data.user));
                    }
                    console.log('Token saved:', data.token);
                    window.location.href = 'home.html'; // Chuyển hướng đến trang chủ
                } else {
                    // Thành công nhưng không có token? Lỗi logic backend
                    console.error('Login error: Response OK but no token.');
                    if (errorMessageDiv) errorMessageDiv.textContent = 'Unexpected login error.';
                }
            }
        } catch (error) {
            // Lỗi mạng hoặc lỗi không kết nối được tới server
            console.error('Lỗi fetch đăng nhập:', error);
            if (errorMessageDiv) errorMessageDiv.textContent = 'Cannot connect to the server. Please check your network connection.';
        }
    });
}