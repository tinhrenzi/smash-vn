
        function confirmSubmit(button, message) {
            Swal.fire({
                title: 'Xác nhận hành động',
                text: message,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#198754',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Đồng ý',
                cancelButtonText: 'Hủy'
            }).then((result) => {
                if (result.isConfirmed) {
                    button.form.submit();
                }
            });
            return false;
        }

        window.showLargeImage = function (imgPath) {
            Swal.fire({
                imageUrl: imgPath,
                showConfirmButton: false,
                showCloseButton: true,
                background: 'rgba(255,255,255,0.95)',
                backdrop: 'rgba(0,0,0,0.65)',
                width: 'auto',
                imageAlt: 'Ảnh sản phẩm'
            });
        };

        function filterOrders() {
            const query = document.getElementById('orderSearchInput').value.toLowerCase().trim();
            const activePane = document.querySelector('.tab-pane.active');
            if (!activePane) return;
            const rows = activePane.querySelectorAll('table tbody tr');
            let visibleCount = 0;
            let hasRealRows = false;

            rows.forEach(row => {
                if (row.cells.length === 1 && row.cells[0].colSpan > 1) {
                    return;
                }
                hasRealRows = true;
                const text = row.textContent.toLowerCase();
                if (text.includes(query)) {
                    row.style.display = '';
                    visibleCount++;
                } else {
                    row.style.display = 'none';
                }
            });

            const countBadge = document.getElementById('orderCountBadge');
            if (countBadge) {
                countBadge.textContent = hasRealRows ? (visibleCount + ' hóa đơn') : '0 hóa đơn';
            }
        }

        document.addEventListener("DOMContentLoaded", function () {
            const tabElList = document.querySelectorAll('button[data-bs-toggle="tab"]');
            tabElList.forEach(tabEl => {
                tabEl.addEventListener('shown.bs.tab', function (event) {
                    filterOrders();
                });
            });

            const urlParams = new URLSearchParams(window.location.search);
            const searchVal = urlParams.get('search');
            if (searchVal) {
                const input = document.getElementById('orderSearchInput');
                if (input) input.value = searchVal;
            }
            filterOrders();
        });

        window.openOrderDetailModal = function (orderId) {
            const modalEl = document.getElementById('orderDetailModal');
            if (!modalEl) {
                console.error("Element #orderDetailModal not found in DOM");
                return;
            }
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();

            const titleEl = document.getElementById('modal-order-id');
            if (titleEl) titleEl.innerHTML = '<span class="text-muted small">Đang tải...</span>';
            
            const headerBadgeEl = document.getElementById('modal-header-status-badge');
            if (headerBadgeEl) headerBadgeEl.innerHTML = '';

            const body = document.getElementById('modal-body-content');
            const footer = document.getElementById('modal-footer-actions');

            body.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-primary me-2" role="status" style="width: 2.5rem; height: 2.5rem;">
                        <span class="visually-hidden">Đang tải...</span>
                    </div>
                    <div class="text-muted mt-2 fw-medium">Đang tải thông tin chi tiết đơn hàng...</div>
                </div>
            `;
            footer.innerHTML = '<button type="button" class="admin-btn admin-btn-secondary" data-bs-dismiss="modal"><i class="fas fa-times me-1"></i> Đóng</button>';

            const csrfMeta = document.querySelector('meta[name="_csrf"]');
            const csrfToken = csrfMeta ? csrfMeta.getAttribute('content') : '';

            fetch('/admin/don-hang/detail-json?id=' + orderId, {
                credentials: 'same-origin'
            })
                .then(response => {
                    if (response.status === 401) throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                    if (response.status === 403) throw new Error('Bạn không có quyền xem chi tiết đơn hàng này.');
                    if (response.status === 404) throw new Error('Không tìm thấy đơn hàng #' + orderId);
                    if (!response.ok) {
                        return response.json().then(errData => {
                            throw new Error(errData.error || ('Lỗi máy chủ: ' + response.status));
                        }).catch(() => {
                            throw new Error('Lỗi máy chủ: ' + response.status);
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.error) {
                        body.innerHTML = `
                            <div class="order-detail-card text-center py-5 my-3" style="border-color: var(--admin-danger);">
                                <div class="text-danger mb-3" style="font-size: 2.5rem;"><i class="fas fa-exclamation-triangle"></i></div>
                                <h5 class="fw-bold text-danger mb-2">Không thể tải chi tiết đơn hàng</h5>
                                <p class="text-muted mb-4">${data.error}</p>
                                <button type="button" class="admin-btn admin-btn-primary" onclick="openOrderDetailModal(${orderId})">
                                    <i class="fas fa-redo me-1"></i> Thử lại
                                </button>
                            </div>
                        `;
                        return;
                    }

                    const codeStr = data.maDonHang ? data.maDonHang : ('#' + orderId);
                    if (titleEl) {
                        titleEl.innerHTML = `
                            <span class="order-detail-code-badge">
                                ${codeStr}
                                <button type="button" class="btn-copy-code" onclick="copyToClipboard('${codeStr}', this)" title="Sao chép mã đơn hàng">
                                    <i class="far fa-copy"></i>
                                </button>
                            </span>
                        `;
                    }

                    // Helper for badges
                    function getStatusBadge(label, rawCode) {
                        if (!label) return '<span class="badge-soft badge-soft-secondary">N/A</span>';
                        const code = (rawCode || label || '').toLowerCase();
                        let badgeClass = 'badge-soft-info';
                        if (code.includes('da_giao') || code.includes('hoan_thanh') || code.includes('success') || code.includes('thành công') || code.includes('da_thanh_toan')) {
                            badgeClass = 'badge-soft-success';
                        } else if (code.includes('cho') || code.includes('pending') || code.includes('chuan_bi') || code.includes('san_sang')) {
                            badgeClass = 'badge-soft-warning';
                        } else if (code.includes('huy') || code.includes('failed') || code.includes('cancel') || code.includes('tu_choi')) {
                            badgeClass = 'badge-soft-danger';
                        }
                        return `<span class="badge-soft ${badgeClass}">${label}</span>`;
                    }

                    if (headerBadgeEl) {
                        headerBadgeEl.innerHTML = getStatusBadge(data.trangThai, data.trangThaiRaw);
                    }

                    // Items HTML & Subtotal
                    let itemsHtml = '';
                    let subtotal = 0;
                    (data.items || []).forEach(item => {
                        subtotal += item.giaBan * item.soLuong;
                        function resolveImgPath(raw) {
                            if (!raw || raw.trim() === '') return '/images/product9.jpg';
                            const clean = raw.trim();
                            if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
                            if (clean.startsWith('/uploads/')) return clean;
                            if (clean.startsWith('uploads/')) return '/' + clean;
                            return `/uploads/product/${clean}`;
                        }
                        const imgPath = resolveImgPath(item.hinhAnh);
                        const hasDiscount = item.giaNiemYet && parseFloat(item.giaNiemYet) > parseFloat(item.giaBan);
                        const unitPriceHtml = hasDiscount
                            ? `<span class="text-decoration-line-through text-muted small me-1">${new Intl.NumberFormat('vi-VN').format(item.giaNiemYet)} đ</span><br><span class="text-danger fw-bold">${new Intl.NumberFormat('vi-VN').format(item.giaBan)} đ</span>`
                            : `<span class="fw-bold">${new Intl.NumberFormat('vi-VN').format(item.giaBan)} đ</span>`;

                        const lineDiscountInfo = (item.tenDotGiamGia && item.phanTramGiam > 0)
                            ? `<br><span class="badge-soft badge-soft-danger mt-1">${item.tenDotGiamGia} (-${item.phanTramGiam}%)</span>`
                            : '';

                        itemsHtml += `
                        <tr>
                            <td class="text-center">
                                <img src="${imgPath}" alt="Ảnh sản phẩm" class="detail-product-thumb" onerror="this.src='/images/product9.jpg'" onclick="showLargeImage('${imgPath}')" title="Click để xem ảnh lớn">
                            </td>
                            <td>
                                <div class="fw-bold text-dark mb-1">${item.tenSanPham || 'N/A'}</div>
                                <div class="text-muted small">${item.thuocTinh || 'N/A'}</div>
                                ${lineDiscountInfo}
                            </td>
                            <td class="text-center fw-bold">${item.soLuong}</td>
                            <td class="text-end">${unitPriceHtml}</td>
                            <td class="text-end text-dark fw-bold">${new Intl.NumberFormat('vi-VN').format(item.giaBan * item.soLuong)} đ</td>
                        </tr>
                    `;
                    });

                    const isPosOrder = (data.maDonHang && (data.maDonHang.startsWith('HDSVN') || data.maDonHang.startsWith('HD-'))) ||
                        (data.diaChi === 'Bán tại quầy');

                    // Payment status badge class resolve
                    let paymentBadgeClass = 'badge-soft-secondary';
                    if (data.paymentStatusBadgeClass) {
                        if (data.paymentStatusBadgeClass.includes('success')) paymentBadgeClass = 'badge-soft-success';
                        else if (data.paymentStatusBadgeClass.includes('warning')) paymentBadgeClass = 'badge-soft-warning';
                        else if (data.paymentStatusBadgeClass.includes('danger')) paymentBadgeClass = 'badge-soft-danger';
                        else if (data.paymentStatusBadgeClass.includes('info')) paymentBadgeClass = 'badge-soft-info';
                    }

                    // Build Main Details Content
                    let detailsContentHtml = `
                    <!-- Quick Summary Grid -->
                    <div class="order-summary-grid">
                        <div class="order-summary-card">
                            <span class="order-summary-label">Ngày tạo đơn</span>
                            <div class="order-summary-value"><i class="far fa-calendar-alt text-muted me-1"></i>${data.ngayTao || 'N/A'}</div>
                        </div>
                        <div class="order-summary-card">
                            <span class="order-summary-label">Tổng thanh toán</span>
                            <div class="order-summary-value text-primary" style="color: var(--admin-primary) !important;">
                                ${new Intl.NumberFormat('vi-VN').format(data.tongTien || 0)} đ
                            </div>
                        </div>
                        <div class="order-summary-card">
                            <span class="order-summary-label">Phương thức TT</span>
                            <div class="order-summary-value">
                                <span>${data.paymentMethod || 'N/A'}</span>
                            </div>
                        </div>
                        <div class="order-summary-card">
                            <span class="order-summary-label">Trạng thái đơn</span>
                            <div class="order-summary-value">
                                ${getStatusBadge(data.trangThai, data.trangThaiRaw)}
                            </div>
                        </div>
                    </div>

                    <!-- 2 Columns Info Grid -->
                    <div class="row g-3 mb-3">
                        <!-- Column 1: Customer & Shipping -->
                        <div class="col-md-6">
                            <div class="order-detail-card h-100 mb-0">
                                <div class="order-detail-card-header">
                                    <h6 class="order-detail-card-title"><i class="fas fa-truck-fast me-1"></i> Khách hàng &amp; Vận chuyển</h6>
                                </div>
                                <div class="order-detail-fields">
                                    <div class="order-detail-field">
                                        <span class="order-detail-label">Họ tên khách hàng</span>
                                        <span class="order-detail-value fw-bold">${data.khachHang || 'Khách lẻ'}</span>
                                    </div>
                                    <div class="order-detail-field">
                                        <span class="order-detail-label">Số điện thoại</span>
                                        <span class="order-detail-value">${data.sdt || 'N/A'}</span>
                                    </div>
                                    <div class="order-detail-field">
                                        <span class="order-detail-label">Địa chỉ nhận hàng</span>
                                        <span class="order-detail-value">${data.diaChi || 'N/A'}</span>
                                    </div>
                                    <div class="order-detail-field">
                                        <span class="order-detail-label">Hình thức giao hàng</span>
                                        <span class="order-detail-value">${data.donViVanChuyen === 'Mua tại quầy' ? 'Tại quầy' : (data.donViVanChuyen || 'N/A')}</span>
                                    </div>

                                    ${data.ghnOrderCode ? `
                                    <div class="order-detail-field">
                                        <span class="order-detail-label">Mã vận đơn GHN</span>
                                        <span class="order-detail-value">
                                            <span class="order-detail-code-inline me-1">${data.ghnOrderCode}</span>
                                            <button type="button" class="btn-copy-code me-1" onclick="copyToClipboard('${data.ghnOrderCode}', this)" title="Sao chép mã GHN"><i class="far fa-copy"></i></button>
                                            ${data.ghnStatusLabel ? `<span class="badge-soft badge-soft-info me-1">${data.ghnStatusLabel}</span>` : ''}
                                            <button type="button" class="admin-btn admin-btn-sm admin-btn-outline-primary py-0 px-2" style="font-size: 0.75rem;" onclick="syncGhnStatus(${data.id})" title="Đồng bộ ngay từ GHN">
                                                <i class="fas fa-sync-alt me-1"></i>Đồng bộ
                                            </button>
                                        </span>
                                    </div>
                                    ` : (data.donViVanChuyen && (data.donViVanChuyen.toUpperCase().includes('GHN') || data.donViVanChuyen.toUpperCase().includes('GIAO HÀNG NHANH')) ? `
                                    <div class="mt-2 p-2 border border-warning rounded bg-warning-subtle" id="ghn-push-box-${data.id}">
                                        <div class="d-flex align-items-center justify-content-between">
                                            <span class="text-warning-emphasis fw-bold small"><i class="fas fa-exclamation-triangle me-1"></i>Chưa gửi đơn lên GHN Sandbox</span>
                                            <button type="button" class="admin-btn admin-btn-sm admin-btn-warning text-dark fw-bold py-1 px-2" style="font-size: 0.75rem;" onclick="pushOrderToGhn(${data.id})">
                                                <i class="fas fa-shipping-fast me-1"></i>Gửi đơn sang GHN
                                            </button>
                                        </div>
                                        <div id="ghn-push-error-${data.id}" class="text-danger mt-2 small" style="display:none; white-space: pre-line; border-top: 1px dashed rgba(220,53,69,0.2); padding-top: 5px; font-size: 11px;"></div>
                                    </div>
                                    ` : '')}

                                    ${data.ghnReturnOrderCode ? `
                                    <div class="order-detail-field">
                                        <span class="order-detail-label">Mã GHN Thu Hồi</span>
                                        <span class="order-detail-value">
                                            <span class="order-detail-code-inline me-1">${data.ghnReturnOrderCode}</span>
                                            <button type="button" class="btn-copy-code me-1" onclick="copyToClipboard('${data.ghnReturnOrderCode}', this)" title="Sao chép mã thu hồi"><i class="far fa-copy"></i></button>
                                            <button type="button" class="admin-btn admin-btn-sm admin-btn-outline-primary py-0 px-2" style="font-size: 0.75rem;" onclick="syncGhnStatus(${data.id})" title="Đồng bộ GHN thu hồi">
                                                <i class="fas fa-sync-alt me-1"></i>Đồng bộ
                                            </button>
                                        </span>
                                    </div>
                                    ` : ''}

                                    ${data.trangThaiRaw && data.trangThaiRaw.toLowerCase() === 'da_huy' ? `
                                    <div class="p-2 border border-danger-subtle rounded bg-danger-subtle text-danger mt-2 small">
                                        <strong><i class="fas fa-info-circle me-1"></i>Lý do hủy đơn:</strong> ${extractCancelReason(data.ghiChu)}
                                    </div>
                                    ` : ''}

                                    ${data.trangThaiHoanHang ? `
                                    <div class="pt-2 border-top mt-2">
                                        <div class="order-detail-field">
                                            <span class="order-detail-label">Trạng thái trả hàng</span>
                                            <span class="order-detail-value"><span class="badge-soft badge-soft-warning">${data.trangThaiHoanHangLabel || 'N/A'}</span></span>
                                        </div>
                                        ${data.ngayXacNhanHoanHang ? `
                                        <div class="order-detail-field mt-1">
                                            <span class="order-detail-label">Ngày hoàn kho</span>
                                            <span class="order-detail-value">${data.ngayXacNhanHoanHang}</span>
                                        </div>` : ''}
                                        ${data.nhanVienXacNhan ? `
                                        <div class="order-detail-field mt-1">
                                            <span class="order-detail-label">NV hoàn kho</span>
                                            <span class="order-detail-value">${data.nhanVienXacNhan}</span>
                                        </div>` : ''}
                                    </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>

                        <!-- Column 2: Payment -->
                        <div class="col-md-6">
                            <div class="order-detail-card h-100 mb-0">
                                <div class="order-detail-card-header">
                                    <h6 class="order-detail-card-title"><i class="far fa-credit-card me-1"></i> Thông tin thanh toán</h6>
                                </div>
                                <div class="order-detail-fields">
                                    <div class="order-detail-field">
                                        <span class="order-detail-label">Phương thức TT</span>
                                        <span class="order-detail-value fw-bold">${data.paymentMethod || 'N/A'}</span>
                                    </div>
                                    <div class="order-detail-field">
                                        <span class="order-detail-label">Trạng thái TT</span>
                                        <span class="order-detail-value">
                                            <span class="badge-soft ${paymentBadgeClass}">
                                                ${data.paymentStatusLabel || data.paymentStatus || 'Không xác định'}
                                            </span>
                                        </span>
                                    </div>

                                    ${data.maGiaoDich ? `
                                    <div class="order-detail-field">
                                        <span class="order-detail-label">Mã giao dịch</span>
                                        <span class="order-detail-value">
                                            <span class="order-detail-code-inline me-1">${data.maGiaoDich}</span>
                                            <button type="button" class="btn-copy-code" onclick="copyToClipboard('${data.maGiaoDich}', this)" title="Sao chép mã giao dịch"><i class="far fa-copy"></i></button>
                                        </span>
                                    </div>
                                    ` : ''}

                                    ${data.transactionId ? `
                                    <div class="order-detail-field">
                                        <span class="order-detail-label">Transaction ID</span>
                                        <span class="order-detail-value">
                                            <span class="order-detail-code-inline me-1">${data.transactionId}</span>
                                            <button type="button" class="btn-copy-code" onclick="copyToClipboard('${data.transactionId}', this)" title="Sao chép transaction ID"><i class="far fa-copy"></i></button>
                                        </span>
                                    </div>
                                    ` : ''}

                                    ${data.thoiGianThanhToan ? `
                                    <div class="order-detail-field">
                                        <span class="order-detail-label">Thời gian TT</span>
                                        <span class="order-detail-value">${data.thoiGianThanhToan}</span>
                                    </div>
                                    ` : ''}

                                    ${data.gatewayResponse ? `
                                    <div class="order-detail-field">
                                        <span class="order-detail-label">Ghi chú thanh toán</span>
                                        <span class="order-detail-value text-muted font-monospace small">${data.gatewayResponse}</span>
                                    </div>
                                    ` : ''}

                                    ${data.refundStatus ? `
                                    <div class="pt-2 border-top mt-2">
                                        <div class="order-detail-field">
                                            <span class="order-detail-label">Trạng thái hoàn tiền</span>
                                            <span class="order-detail-value"><span class="badge-soft badge-soft-info">${data.refundStatusLabel || 'N/A'}</span></span>
                                        </div>
                                        ${data.refundTime ? `
                                        <div class="order-detail-field mt-1">
                                            <span class="order-detail-label">Ngày hoàn tiền</span>
                                            <span class="order-detail-value">${data.refundTime}</span>
                                        </div>` : ''}
                                        ${data.refundConfirmedBy ? `
                                        <div class="order-detail-field mt-1">
                                            <span class="order-detail-label">NV xác nhận hoàn</span>
                                            <span class="order-detail-value">${data.refundConfirmedBy}</span>
                                        </div>` : ''}
                                    </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Related SePay Transactions Table -->
                    ${data.transactions && data.transactions.length > 0 ? `
                    <div class="order-detail-card mb-3">
                        <div class="order-detail-card-header">
                            <h6 class="order-detail-card-title"><i class="fas fa-university me-1"></i> Giao dịch SePay liên quan</h6>
                        </div>
                        <div class="table-responsive">
                            <table class="order-detail-table">
                                <thead>
                                    <tr>
                                        <th>Mã Giao Dịch</th>
                                        <th class="text-end">Số tiền</th>
                                        <th>Cổng</th>
                                        <th>Trạng thái</th>
                                        <th>Thời gian nhận</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.transactions.map(tx => `
                                        <tr>
                                            <td>
                                                <span class="order-detail-code-inline me-1">${tx.transactionId}</span>
                                                <button type="button" class="btn-copy-code" onclick="copyToClipboard('${tx.transactionId}', this)" title="Sao chép"><i class="far fa-copy"></i></button>
                                            </td>
                                            <td class="text-end fw-bold text-success">${new Intl.NumberFormat('vi-VN').format(tx.amount)} đ</td>
                                            <td><span class="badge-soft badge-soft-secondary">${tx.gateway}</span></td>
                                            <td>
                                                <span class="badge-soft ${tx.status === 'success' ? 'badge-soft-success' : 'badge-soft-warning'}">${tx.status}</span>
                                            </td>
                                            <td class="text-muted small">${tx.createdAt}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    ` : ''}

                    <!-- Product List & Total Summary Section -->
                    <div class="order-detail-card mb-0">
                        <div class="order-detail-card-header">
                            <h6 class="order-detail-card-title"><i class="fas fa-box-open me-1"></i> Danh sách sản phẩm</h6>
                        </div>
                        <div class="table-responsive mb-3">
                            <table class="order-detail-table">
                                <thead>
                                    <tr>
                                        <th class="text-center" style="width: 80px;">Ảnh</th>
                                        <th>Sản phẩm</th>
                                        <th class="text-center" style="width: 70px;">SL</th>
                                        <th class="text-end" style="width: 140px;">Đơn giá</th>
                                        <th class="text-end" style="width: 150px;">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml || '<tr><td colspan="5" class="text-center text-muted py-4">Không có sản phẩm trong đơn hàng</td></tr>'}
                                </tbody>
                            </table>
                        </div>

                        <!-- Order Total Summary Box -->
                        <div class="order-total-summary">
                            <div class="order-total-row">
                                <span>Tạm tính (sau giảm SP):</span>
                                <span class="order-total-val">${new Intl.NumberFormat('vi-VN').format(subtotal)} đ</span>
                            </div>
                            ${data.soTienGiamVoucher > 0 ? `
                            <div class="order-total-row text-success">
                                <span>Giảm giá Voucher (${data.maVoucherApDung || 'Voucher'}):</span>
                                <span class="order-total-val text-success">-${new Intl.NumberFormat('vi-VN').format(data.soTienGiamVoucher)} đ</span>
                            </div>
                            ` : ''}
                            <div class="order-total-row">
                                <span>Phí vận chuyển:</span>
                                <span class="order-total-val">${new Intl.NumberFormat('vi-VN').format(data.phiVanChuyen)} đ</span>
                            </div>
                            <div class="order-total-grand">
                                <span>TỔNG THANH TOÁN:</span>
                                <span>${new Intl.NumberFormat('vi-VN').format(data.tongTien)} đ</span>
                            </div>
                        </div>
                    </div>
                `;

                    if (isPosOrder) {
                        let posItemsHtml = '';
                        (data.items || []).forEach(item => {
                            posItemsHtml += `
                            <tr>
                                <td style="padding: 4px 0; vertical-align: top;">
                                    <span>${item.tenSanPham || 'N/A'}</span><br>
                                    <span class="item-details" style="font-size: 10px; color: #555;">${item.thuocTinh || 'N/A'}</span>
                                </td>
                                <td style="padding: 4px 0; text-align: center; vertical-align: top;">${item.soLuong}</td>
                                <td style="padding: 4px 0; text-align: right; vertical-align: top;">${new Intl.NumberFormat('vi-VN').format(item.giaBan * item.soLuong)} đ</td>
                            </tr>
                        `;
                        });

                        let receiptHtml = `
                        <div class="p-3 border rounded shadow-sm bg-white" style="font-family: Arial, sans-serif; font-size: 11px; max-width: 100%; color: #000; border-color: #ddd !important;">
                            <div class="text-center mb-3">
                                <h5 style="font-weight: 800; font-size: 14px; margin-bottom: 2px;">SMASH VN SHOP</h5>
                                <div style="font-size: 10px;">10 Kim Mã, Ba Đình, Hà Nội</div>
                                <div style="font-size: 10px;">Hotline: 0987.654.321</div>
                                <div style="font-weight: bold; font-size: 12px; margin-top: 10px; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 4px 0; letter-spacing: 1px;">HÓA ĐƠN BÁN HÀNG</div>
                            </div>
                            <div class="mb-2" style="line-height: 1.4;">
                                <div><strong>Mã HĐ:</strong> ${data.maDonHang}</div>
                                <div><strong>Thời gian tạo:</strong> ${data.ngayTao}</div>
                                <div><strong>Khách hàng:</strong> ${data.khachHang || 'Khách lẻ'}</div>
                                <div><strong>Số ĐT khách:</strong> ${data.sdt || 'N/A'}</div>
                                <div style="border-top: 1px dashed #000; margin: 5px 0;"></div>
                                <div><strong>Thanh toán:</strong> ${data.paymentMethod}</div>
                                <div><strong>Trạng thái:</strong> <span style="font-weight: bold; color: ${data.paymentStatusBadgeClass && data.paymentStatusBadgeClass.includes('success') ? '#198754' : (data.paymentStatusBadgeClass && data.paymentStatusBadgeClass.includes('warning') ? '#ff9800' : '#dc3545')}">${data.paymentStatusLabel || data.paymentStatus || 'Không xác định'}</span></div>
                                ${data.maGiaoDich ? `<div><strong>Mã giao dịch:</strong> ${data.maGiaoDich}</div>` : ''}
                                <div><strong>NV xác nhận:</strong> ${data.nguoiXacNhan || 'Nhân viên hệ thống'}</div>
                                ${data.thoiGianXacNhan ? `<div><strong>Thời gian XN:</strong> ${data.thoiGianXacNhan}</div>` : ''}
                            </div>
                            <div style="border-top: 1px dashed #000; margin: 5px 0;"></div>
                            <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 5px;">
                                <thead>
                                    <tr style="border-bottom: 1px dashed #000;">
                                        <th style="text-align: left; padding: 4px 0;">Sản phẩm</th>
                                        <th style="text-align: center; padding: 4px 0; width: 30px;">SL</th>
                                        <th style="text-align: right; padding: 4px 0; width: 75px;">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${posItemsHtml}
                                </tbody>
                            </table>
                            <div style="border-top: 1px dashed #000; margin: 5px 0;"></div>
                            <table style="width: 100%; font-size: 11px;">
                                <tr>
                                    <td style="padding: 2px 0;">Cộng tiền hàng:</td>
                                    <td style="text-align: right; padding: 2px 0;">${new Intl.NumberFormat('vi-VN').format(subtotal)} đ</td>
                                </tr>
                                ${data.soTienGiamVoucher > 0 ? `
                                <tr>
                                    <td style="padding: 2px 0; color: #198754; font-weight: bold;">Voucher giảm:</td>
                                    <td style="text-align: right; padding: 2px 0; color: #198754; font-weight: bold;">-${new Intl.NumberFormat('vi-VN').format(data.soTienGiamVoucher)} đ</td>
                                </tr>
                                ` : ''}
                                <tr style="font-weight: bold; border-top: 1px dashed #000;">
                                    <td style="padding: 4px 0; font-size: 12px;">TỔNG THANH TOÁN:</td>
                                    <td style="text-align: right; padding: 4px 0; font-size: 12px; color: #dc3545;">${new Intl.NumberFormat('vi-VN').format(data.tongTien)} đ</td>
                                </tr>
                            </table>
                            <div style="border-top: 1px dashed #000; margin: 8px 0 5px 0;"></div>
                            <div class="text-center" style="font-size: 9px; line-height: 1.3;">
                                <div>CẢM ƠN QUÝ KHÁCH HÀNG!</div>
                                <div>HẸN GẶP LẠI QUÝ KHÁCH!</div>
                                <div style="margin-top: 3px; font-style: italic; color: #777;">Powered by SmashVN</div>
                            </div>
                            <div class="text-center mt-3">
                                <button type="button" class="admin-btn admin-btn-secondary py-1 px-3 fw-bold" style="font-size: 11px;" onclick="window.open('/admin/pos/print/${data.id}', '_blank')">
                                    <i class="fas fa-print me-1"></i> Mở Trang In K80
                                </button>
                            </div>
                        </div>
                    `;

                        body.innerHTML = `
                        <div class="row g-3">
                            <div class="col-lg-7">
                                ${detailsContentHtml}
                            </div>
                            <div class="col-lg-5">
                                <div class="order-detail-card h-100">
                                    <div class="order-detail-card-header">
                                        <h6 class="order-detail-card-title"><i class="fas fa-receipt me-1"></i> Hóa đơn in nhiệt (K80)</h6>
                                    </div>
                                    ${receiptHtml}
                                </div>
                            </div>
                        </div>
                    `;
                    } else {
                        body.innerHTML = `
                        <div class="row g-3">
                            <div class="col-12">
                                ${detailsContentHtml}
                            </div>
                        </div>
                    `;
                    }

                    // Build Footer Actions
                    let actionsLeftHtml = '';
                    let actionsRightHtml = `<button type="button" class="admin-btn admin-btn-secondary" data-bs-dismiss="modal"><i class="fas fa-times me-1"></i> Đóng</button>`;

                    if (data.trangThaiRaw && data.trangThaiRaw.toLowerCase() !== 'da_ban_giao_ghn' && data.trangThaiRaw.toLowerCase() !== 'dang_giao' && data.trangThaiRaw.toLowerCase() !== 'da_giao' && data.trangThaiRaw.toLowerCase() !== 'hoan_thanh' && data.trangThaiRaw.toLowerCase() !== 'da_huy') {
                        let nextStatusLabel = '';
                        switch (data.trangThaiRaw.toLowerCase()) {
                            case 'cho_thanh_toan': nextStatusLabel = 'Chờ xác nhận'; break;
                            case 'cho_xac_nhan': nextStatusLabel = 'Đã xác nhận'; break;
                            case 'da_xac_nhan': nextStatusLabel = 'Đang chuẩn bị hàng'; break;
                            case 'dang_chuan_bi_hang': nextStatusLabel = 'Sẵn sàng giao'; break;
                            case 'san_sang_giao': nextStatusLabel = 'Đã tạo vận đơn GHN'; break;
                            case 'da_tao_van_don_ghn': nextStatusLabel = 'Đã bàn giao GHN'; break;
                            case 'da_ban_giao_ghn': nextStatusLabel = ''; break;
                            case 'dang_lay_hang': nextStatusLabel = 'Đang giao'; break;
                            case 'dang_giao': nextStatusLabel = ''; break;
                            case 'stock_conflict': nextStatusLabel = 'Chờ xác nhận'; break;
                        }

                        if (nextStatusLabel) {
                            actionsRightHtml += `
                            <form action="/admin/don-hang/next-status" method="post" class="d-inline-block m-0">
                                <input type="hidden" name="_csrf" value="${csrfToken}" />
                                <input type="hidden" name="idHoaDon" value="${data.id}" />
                                <button type="submit" class="admin-btn admin-btn-primary" onclick="return confirmSubmit(this, 'Xác nhận chuyển đơn hàng sang trạng thái: ${nextStatusLabel}?')">
                                    <i class="fas fa-arrow-right me-1"></i> Tiếp theo (${nextStatusLabel})
                                </button>
                            </form>
                        `;
                        }

                        if (data.trangThaiRaw.toLowerCase() === 'dang_giao') {
                            actionsRightHtml += `
                            <form action="/admin/don-hang/update-status" method="post" class="d-inline-block m-0">
                                <input type="hidden" name="_csrf" value="${csrfToken}" />
                                <input type="hidden" name="idHoaDon" value="${data.id}" />
                                <input type="hidden" name="expectedStatus" value="${data.trangThaiRaw}" />
                                <input type="hidden" name="trangThai" value="da_giao" />
                                <button type="submit" class="admin-btn admin-btn-primary" onclick="return confirmSubmit(this, 'Xác nhận HOÀN THÀNH đơn hàng này?')">
                                    <i class="fas fa-check-circle me-1"></i> Hoàn thành đơn hàng
                                </button>
                            </form>
                        `;
                        }

                        actionsRightHtml += `
                        <button type="button" class="admin-btn admin-btn-danger" 
                                data-id="${data.id}" 
                                data-code="${data.maDonHang || ('#' + data.id)}" 
                                data-status="${data.trangThaiRaw}"
                                onclick="closeDetailsAndCancel(this)">
                            <i class="fas fa-times me-1"></i> Hủy đơn
                        </button>
                    `;
                    }

                    if (data.trangThaiRaw && data.trangThaiRaw.toLowerCase() === 'da_huy' && data.paymentStatus === 'CHO_HOAN_TIEN') {
                        actionsRightHtml += `
                        <form action="/admin/don-hang/approve-refund-ui" method="post" class="d-inline-block m-0">
                            <input type="hidden" name="_csrf" value="${csrfToken}" />
                            <input type="hidden" name="idHoaDon" value="${data.id}" />
                            <button type="submit" class="admin-btn admin-btn-primary" onclick="return confirmSubmit(this, 'Xác nhận hoàn tiền thành công cho đơn hàng này?')">
                                <i class="fas fa-hand-holding-usd me-1"></i> Hoàn tiền
                            </button>
                        </form>
                        <form action="/admin/don-hang/reject-refund-ui" method="post" class="d-inline-block m-0">
                            <input type="hidden" name="_csrf" value="${csrfToken}" />
                            <input type="hidden" name="idHoaDon" value="${data.id}" />
                            <button type="submit" class="admin-btn admin-btn-secondary" onclick="return confirmSubmit(this, 'Xác nhận từ chối hoàn tiền?')">
                                <i class="fas fa-ban me-1"></i> Từ chối
                            </button>
                        </form>
                    `;
                    }

                    if (data.trangThaiHoanHang === 'PENDING_APPROVAL' || data.trangThaiHoanHang === 'PENDING_RETURN') {
                        actionsRightHtml += `
                        <form action="/admin/don-hang/approve-return" method="post" class="d-inline-block m-0">
                            <input type="hidden" name="_csrf" value="${csrfToken}" />
                            <input type="hidden" name="idHoaDon" value="${data.id}" />
                            <button type="submit" class="admin-btn admin-btn-primary" onclick="return confirmSubmit(this, 'Xác nhận duyệt yêu cầu trả hàng và tự động tạo đơn thu hồi GHN?')">
                                <i class="fas fa-check-circle me-1"></i> Duyệt trả hàng &amp; Tạo mã GHN
                            </button>
                        </form>
                        <form action="/admin/don-hang/reject-return" method="post" class="d-inline-block m-0">
                            <input type="hidden" name="_csrf" value="${csrfToken}" />
                            <input type="hidden" name="idHoaDon" value="${data.id}" />
                            <button type="submit" class="admin-btn admin-btn-danger" onclick="return confirmSubmit(this, 'Xác nhận từ chối yêu cầu trả hàng?')">
                                <i class="fas fa-times-circle me-1"></i> Từ chối trả hàng
                            </button>
                        </form>
                    `;
                    } else if (data.trangThaiHoanHang === 'WAITING_FOR_PICKUP') {
                        actionsLeftHtml += `
                        <span class="text-primary small fw-bold">
                            <i class="fas fa-shipping-fast me-1"></i> GHN Thu Hồi: ${data.ghnReturnOrderCode || 'Đang cập nhật...'}
                        </span>
                        `;
                        actionsRightHtml += `
                        <form action="/admin/don-hang/cancel-return-pickup" method="post" class="d-inline-block m-0">
                            <input type="hidden" name="_csrf" value="${csrfToken}" />
                            <input type="hidden" name="idHoaDon" value="${data.id}" />
                            <button type="submit" class="admin-btn admin-btn-secondary" onclick="return confirmSubmit(this, 'Xác nhận hủy vận đơn thu hồi?')">
                                <i class="fas fa-ban me-1"></i> Hủy vận đơn thu hồi
                            </button>
                        </form>
                    `;
                    } else if (data.trangThaiHoanHang === 'PICKED_UP' || data.trangThaiHoanHang === 'RETURNING') {
                        actionsLeftHtml += `
                        <span class="text-info small fw-bold">
                            <i class="fas fa-lock me-1"></i> Đã giao GHN thu hồi (${data.ghnReturnOrderCode || 'N/A'}) - Tự động đồng bộ
                        </span>
                        `;
                    } else if (data.trangThaiHoanHang === 'DELIVERED_TO_SHOP') {
                        actionsRightHtml += `
                        <form action="/admin/don-hang/confirm-restock" method="post" class="d-inline-block m-0">
                            <input type="hidden" name="_csrf" value="${csrfToken}" />
                            <input type="hidden" name="idHoaDon" value="${data.id}" />
                            <button type="submit" class="admin-btn admin-btn-primary" onclick="return confirmSubmit(this, 'Xác nhận kiểm kiện &amp; nhập kho cộng lại số lượng tồn?')">
                                <i class="fas fa-boxes me-1"></i> Kiểm kiện &amp; Nhập kho
                            </button>
                        </form>
                    `;
                    } else if (data.trangThaiHoanHang === 'RETURNED') {
                        actionsRightHtml += `
                        <button type="button" class="admin-btn admin-btn-primary" onclick="moModalConfirmRefund(${data.id}, '${data.maDonHang || ('#' + data.id)}', ${data.tongTien || 0})">
                            <i class="fas fa-hand-holding-usd me-1"></i> Xác nhận hoàn tiền
                        </button>
                    `;
                    } else if (data.trangThaiHoanHang === 'REFUNDED') {
                        actionsLeftHtml += `
                        <span class="badge-soft badge-soft-success">
                            <i class="fas fa-check-double me-1"></i> Đã hoàn tất Trả hàng &amp; Hoàn tiền
                        </span>
                    `;
                    }

                    footer.innerHTML = `
                        <div class="order-detail-footer-info">
                            ${actionsLeftHtml}
                        </div>
                        <div class="order-detail-footer-actions">
                            ${actionsRightHtml}
                        </div>
                    `;
                })
                .catch(err => {
                    console.error('Order Detail Error:', err);
                    body.innerHTML = `
                        <div class="order-detail-card text-center py-5 my-3" style="border-color: var(--admin-danger);">
                            <div class="text-danger mb-3" style="font-size: 2.5rem;"><i class="fas fa-exclamation-triangle"></i></div>
                            <h5 class="fw-bold text-danger mb-2">Không thể tải chi tiết đơn hàng</h5>
                            <p class="text-muted mb-4" style="max-width: 480px; margin: 0 auto;">${err.message || 'Lỗi không xác định khi kết nối với máy chủ'}</p>
                            <button type="button" class="admin-btn admin-btn-primary" onclick="openOrderDetailModal(${orderId})">
                                <i class="fas fa-redo me-1"></i> Thử lại
                            </button>
                        </div>
                });
        };

        function showPayloadModal(btn) {
            const rawJson = btn.getAttribute('data-payload');
            try {
                const parsed = JSON.parse(rawJson);
                document.getElementById('payloadContent').textContent = JSON.stringify(parsed, null, 4);
            } catch (e) {
                document.getElementById('payloadContent').textContent = rawJson;
            }
            var myModal = new bootstrap.Modal(document.getElementById('payloadModal'));
            myModal.show();
        }

        window.toggleAdminCancelReasonTextarea = function () {
            const select = document.getElementById('adminCancelReasonSelect');
            const wrapper = document.getElementById('adminCustomReasonWrapper');
            const textarea = document.getElementById('adminCustomCancelReason');
            const finalInput = document.getElementById('adminCancelReasonFinal');
            const errDiv = document.getElementById('adminCancelReasonError');
            if (errDiv) errDiv.style.display = 'none';
            if (select && wrapper && finalInput) {
                if (select.value === 'Khác') {
                    wrapper.style.display = 'block';
                    finalInput.value = textarea ? textarea.value.trim() : '';
                } else {
                    wrapper.style.display = 'none';
                    if (textarea) textarea.value = '';
                    finalInput.value = select.value;
                }
            }
        };

        window.extractCancelReason = function (ghiChu) {
            if (!ghiChu) return "Không cung cấp lý do";
            const prefix = "Lý do hủy:";
            const idx = ghiChu.lastIndexOf(prefix);
            if (idx !== -1) {
                const extracted = ghiChu.substring(idx + prefix.length).trim();
                return extracted || "Không cung cấp lý do";
            }
            return ghiChu.trim() || "Không cung cấp lý do";
        };

        window.openAdminCancelModal = function (btn) {
            const id = btn.getAttribute('data-id');
            const code = btn.getAttribute('data-code');
            const expectedStatus = btn.getAttribute('data-status');

            document.getElementById('adminCancelId').value = id;
            document.getElementById('adminCancelOrderCode').textContent = code;
            document.getElementById('adminCancelExpectedStatus').value = expectedStatus;

            const csrfMeta = document.querySelector('meta[name="_csrf"]');
            const csrfToken = csrfMeta ? csrfMeta.getAttribute('content') : '';
            document.getElementById('adminCancelCsrf').value = csrfToken;

            const select = document.getElementById('adminCancelReasonSelect');
            if (select) select.value = 'Khách hàng yêu cầu hủy';
            const finalInput = document.getElementById('adminCancelReasonFinal');
            if (finalInput) finalInput.value = 'Khách hàng yêu cầu hủy';
            const textarea = document.getElementById('adminCustomCancelReason');
            if (textarea) textarea.value = '';
            const wrapper = document.getElementById('adminCustomReasonWrapper');
            if (wrapper) wrapper.style.display = 'none';
            const errDiv = document.getElementById('adminCancelReasonError');
            if (errDiv) errDiv.style.display = 'none';

            const modal = new bootstrap.Modal(document.getElementById('adminCancelOrderModal'));
            modal.show();
        };

        window.closeDetailsAndCancel = function (btn) {
            const detailModalEl = document.getElementById('orderDetailModal');
            const detailModal = bootstrap.Modal.getInstance(detailModalEl);
            if (detailModal) {
                detailModal.hide();
            }
            openAdminCancelModal(btn);
        };

        document.getElementById('adminCancelOrderForm').addEventListener('submit', function (e) {
            const select = document.getElementById('adminCancelReasonSelect');
            const textarea = document.getElementById('adminCustomCancelReason');
            const finalInput = document.getElementById('adminCancelReasonFinal');
            const errDiv = document.getElementById('adminCancelReasonError');
            if (errDiv) errDiv.style.display = 'none';

            let finalReason = select ? select.value : 'Khách hàng yêu cầu hủy';
            if (finalReason === 'Khác') {
                finalReason = textarea ? textarea.value.trim() : '';
                if (!finalReason) {
                    e.preventDefault();
                    if (errDiv) errDiv.style.display = 'block';
                    return;
                }
            }
            finalInput.value = finalReason;
        });

        window.pushOrderToGhn = function (orderId) {
            const errorDiv = document.getElementById('ghn-push-error-' + orderId);
            const pushBox = document.getElementById('ghn-push-box-' + orderId);

            if (errorDiv) {
                errorDiv.style.display = 'none';
                errorDiv.innerText = '';
            }

            const buttons = pushBox ? pushBox.querySelectorAll('button') : [];
            buttons.forEach(btn => btn.disabled = true);

            const csrfMeta = document.querySelector('meta[name="_csrf"]');
            const csrfToken = csrfMeta ? csrfMeta.getAttribute('content') : '';
            const csrfHeader = document.querySelector('meta[name="_csrf_header"]');
            const csrfHeaderName = csrfHeader ? csrfHeader.getAttribute('content') : 'X-CSRF-TOKEN';

            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };
            if (csrfToken) {
                headers[csrfHeaderName] = csrfToken;
            }

            fetch('/api/ghn/admin/push/' + orderId, {
                method: 'POST',
                headers: headers,
                credentials: 'same-origin'
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'ok') {
                        Swal.fire({
                            title: 'Thành công',
                            text: 'Đã tạo đơn vận chuyển trên GHN Sandbox thành công!',
                            icon: 'success',
                            confirmButtonText: 'Đóng'
                        }).then(() => {
                            if (window.openOrderDetailModal) window.openOrderDetailModal(orderId);
                        });
                    } else if (data.status === 'already_exists') {
                        Swal.fire({
                            title: 'Đã tồn tại',
                            text: data.message,
                            icon: 'info',
                            confirmButtonText: 'Đóng'
                        }).then(() => {
                            if (window.openOrderDetailModal) window.openOrderDetailModal(orderId);
                        });
                    } else {
                        throw new Error(data.message || 'Lỗi không xác định từ GHN Sandbox');
                    }
                })
                .catch(err => {
                    console.error(err);
                    if (errorDiv) {
                        errorDiv.style.display = 'block';
                        errorDiv.innerHTML = '<strong>Lỗi đẩy đơn GHN Sandbox:</strong><br>' + err.message;
                    }
                    buttons.forEach(btn => btn.disabled = false);
                });
        };

        window.syncGhnStatus = function (orderId) {
            const csrfMeta = document.querySelector('meta[name="_csrf"]');
            const csrfToken = csrfMeta ? csrfMeta.getAttribute('content') : '';
            const csrfHeader = document.querySelector('meta[name="_csrf_header"]');
            const csrfHeaderName = csrfHeader ? csrfHeader.getAttribute('content') : 'X-CSRF-TOKEN';

            const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            if (csrfToken) headers[csrfHeaderName] = csrfToken;

            fetch('/api/ghn/admin/sync/' + orderId, {
                method: 'POST',
                headers: headers,
                credentials: 'same-origin'
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'ok') {
                        Swal.fire({
                            title: 'Đồng bộ thành công',
                            text: (data.message || '') + '\nTrạng thái GHN hiện tại: ' + (data.ghnStatusLabel || data.ghnStatus || ''),
                            icon: 'success',
                            confirmButtonText: 'Đóng'
                        }).then(() => {
                            if (window.openOrderDetailModal) window.openOrderDetailModal(orderId);
                        });
                    } else {
                        Swal.fire({
                            title: 'Không thể đồng bộ',
                            text: data.message,
                            icon: 'error',
                            confirmButtonText: 'Đóng'
                        });
                    }
                })
                .catch(err => {
                    console.error(err);
                    Swal.fire({
                        title: 'Lỗi',
                        text: err.message,
                        icon: 'error',
                        confirmButtonText: 'Đóng'
                    });
                });
        };

        window.moModalConfirmRefund = function (idHoaDon, maDonHang, tongTien) {
            document.getElementById('refundIdHoaDon').value = idHoaDon;
            document.getElementById('refundMaDonHang').innerText = maDonHang || ('#' + idHoaDon);
            document.getElementById('refundSoTienHoan').value = tongTien || 0;

            var modalEl = document.getElementById('modalConfirmRefund');
            var myModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            myModal.show();
        };

        window.copyToClipboard = function (text, el) {
            if (!text) return;
            navigator.clipboard.writeText(text).then(function () {
                const icon = el ? (el.querySelector ? (el.querySelector('i') || el) : el) : null;
                let oldClass = '';
                if (icon) {
                    oldClass = icon.className;
                    icon.className = 'fas fa-check text-success';
                }

                if (typeof Swal !== 'undefined') {
                    const Toast = Swal.mixin({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 1500,
                        timerProgressBar: false
                    });
                    Toast.fire({
                        icon: 'success',
                        title: 'Đã sao chép: ' + text
                    });
                }

                if (icon && oldClass) {
                    setTimeout(function () {
                        icon.className = oldClass;
                    }, 1500);
                }
            }).catch(function (err) {
                console.error('Lỗi khi sao chép:', err);
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    if (typeof Swal !== 'undefined') {
                        const Toast = Swal.mixin({
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 1500,
                            timerProgressBar: false
                        });
                        Toast.fire({
                            icon: 'success',
                            title: 'Đã sao chép: ' + text
                        });
                    }
                } catch (e) {
                    console.error('Fallback copy failed', e);
                }
                document.body.removeChild(textArea);
            });
        };
