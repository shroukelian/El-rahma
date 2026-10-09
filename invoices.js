
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const ADMIN_PASSWORD = "Rahma@2026";

    const STORAGE_KEY = "alrahma_invoices_v1";
    const SEQUENCE_KEY = "alrahma_invoice_sequence_v1";
    const SESSION_KEY = "alrahma_admin_demo_session";

    const $ = (id) => document.getElementById(id);

    const loginPanel = $("loginPanel");
    const appPanel = $("appPanel");
    const editorPanel = $("editorPanel");
    const previewPanel = $("previewPanel");
    const invoiceForm = $("invoiceForm");
    const invoiceList = $("invoiceList");
    const invoicePreview = $("invoicePreview");

    let invoices = loadInvoices();

    function loadInvoices() {
        try {
            const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            return Array.isArray(value) ? value : [];
        } catch (error) {
            console.error("تعذر قراءة الفواتير:", error);
            return [];
        }
    }

    function saveInvoices() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
            return true;
        } catch (error) {
            alert("تعذر حفظ الفاتورة. قد تكون مساحة التخزين ممتلئة.");
            console.error(error);
            return false;
        }
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function digitsOnly(value) {
        return String(value ?? "").replace(/\D/g, "");
    }

    function nextInvoiceNumber() {
        let sequence = Number(localStorage.getItem(SEQUENCE_KEY) || "0");

        // منع إعادة استخدام رقم موجود حتى لو حُذفت فاتورة.
        const existingNumbers = invoices
            .map((invoice) => Number(String(invoice.number).replace(/\D/g, "")))
            .filter(Number.isFinite);

        sequence = Math.max(sequence, 0, ...existingNumbers) + 1;

        localStorage.setItem(SEQUENCE_KEY, String(sequence));

        const date = new Date();
        const year = date.getFullYear();

        return `RH-${year}-${String(sequence).padStart(5, "0")}`;
    }

    function today() {
        const date = new Date();
        const localDate = new Date(
            date.getTime() - date.getTimezoneOffset() * 60000
        );
        return localDate.toISOString().slice(0, 10);
    }

    function showApp() {
        loginPanel.classList.add("hidden");
        appPanel.classList.remove("hidden");
        $("logoutBtn").classList.remove("hidden");
        renderInvoiceList();
    }

    function showLogin() {
        loginPanel.classList.remove("hidden");
        appPanel.classList.add("hidden");
        $("logoutBtn").classList.add("hidden");
    }

    $("loginForm").addEventListener("submit", (event) => {
        event.preventDefault();

        if ($("adminPassword").value === ADMIN_PASSWORD) {
            sessionStorage.setItem(SESSION_KEY, "demo");
            $("loginError").textContent = "";
            $("adminPassword").value = "";
            showApp();
        } else {
            $("loginError").textContent = "كلمة المرور غير صحيحة.";
        }
    });

    $("logoutBtn").addEventListener("click", () => {
        sessionStorage.removeItem(SESSION_KEY);
        editorPanel.classList.add("hidden");
        previewPanel.classList.add("hidden");
        showLogin();
    });

    function formData() {
        return {
            id: $("invoiceId").value || crypto.randomUUID(),
            number: $("invoiceNumber").value.trim(),
            date: $("invoiceDate").value,
            parcelCount: $("parcelCount").value,
            neighborhood: $("neighborhood").value.trim(),
            senderName: $("senderName").value.trim(),
            senderPhone: $("senderPhone").value.trim(),
            recipientName: $("recipientName").value.trim(),
            recipientPhone: $("recipientPhone").value.trim(),
            recipientAddress: $("recipientAddress").value.trim(),
            shipmentDetails: $("shipmentDetails").value.trim(),
            shippingCost: $("shippingCost").value,
            customerWhatsApp: $("customerWhatsApp").value.trim()
        };
    }

    function setForm(invoice) {
        $("invoiceId").value = invoice?.id || "";
        $("invoiceNumber").value = invoice?.number || nextInvoiceNumber();
        $("invoiceDate").value = invoice?.date || today();
        $("parcelCount").value = invoice?.parcelCount || "1";
        $("neighborhood").value = invoice?.neighborhood || "";
        $("senderName").value = invoice?.senderName || "";
        $("senderPhone").value = invoice?.senderPhone || "";
        $("recipientName").value = invoice?.recipientName || "";
        $("recipientPhone").value = invoice?.recipientPhone || "";
        $("recipientAddress").value = invoice?.recipientAddress || "";
        $("shipmentDetails").value = invoice?.shipmentDetails || "";
        $("shippingCost").value = invoice?.shippingCost ?? "";
        $("customerWhatsApp").value = invoice?.customerWhatsApp || "";
        $("formMessage").textContent = "";
    }

    function openNewInvoice() {
        invoiceForm.reset();
        setForm(null);
        $("editorTitle").textContent = "إنشاء فاتورة جديدة";
        editorPanel.classList.remove("hidden");
        previewPanel.classList.add("hidden");
        editorPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    $("newInvoiceBtn").addEventListener("click", openNewInvoice);
    $("cancelBtn").addEventListener("click", () => {
        editorPanel.classList.add("hidden");
        previewPanel.classList.add("hidden");
    });

    invoiceForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const invoice = formData();

        if (!invoice.number || !invoice.date ||
            !invoice.senderName || !invoice.senderPhone ||
            !invoice.recipientName || !invoice.recipientPhone ||
            !invoice.recipientAddress || !invoice.neighborhood) {
            $("formMessage").textContent = "من فضلك أكمل الحقول المطلوبة.";
            return;
        }

        if (!Number.isInteger(Number(invoice.parcelCount)) ||
            Number(invoice.parcelCount) < 1) {
            $("formMessage").textContent = "عدد الطرود يجب أن يكون 1 أو أكثر.";
            return;
        }

        if (invoice.shippingCost !== "" &&
            (!Number.isFinite(Number(invoice.shippingCost)) ||
                Number(invoice.shippingCost) < 0)) {
            $("formMessage").textContent = "يرجى إدخال تكلفة شحن صحيحة.";
            return;
        }

        const index = invoices.findIndex((item) => item.id === invoice.id);
        const oldInvoice = index >= 0 ? invoices[index] : null;

        invoice.createdAt = oldInvoice?.createdAt || new Date().toISOString();
        invoice.updatedAt = new Date().toISOString();

        if (index >= 0) {
            invoices[index] = invoice;
        } else {
            invoices.unshift(invoice);
        }

        if (!saveInvoices()) {
            if (index >= 0) {
                invoices[index] = oldInvoice;
            } else {
                invoices = invoices.filter((item) => item.id !== invoice.id);
            }
            return;
        }

        $("formMessage").textContent = "تم حفظ الفاتورة بنجاح.";
        renderInvoiceList();
        renderPreview(invoice);
    });

    function renderInvoiceList() {
        const query = $("searchInvoice").value.trim().toLowerCase();

        const filtered = invoices.filter((invoice) => {
            const searchable = [
                invoice.number,
                invoice.senderName,
                invoice.senderPhone,
                invoice.recipientName,
                invoice.recipientPhone
            ].join(" ").toLowerCase();

            return searchable.includes(query);
        });

        if (!filtered.length) {
            invoiceList.innerHTML = "<p>لا توجد فواتير مطابقة للبحث.</p>";
            return;
        }

        invoiceList.innerHTML = filtered.map((invoice) => `
      <div class="invoice-row">
        <div>
          <h3>${escapeHTML(invoice.number)}</h3>
          <p>${escapeHTML(invoice.senderName)} — ${escapeHTML(invoice.date)}</p>
          <p>المستلم: ${escapeHTML(invoice.recipientName)}</p>
        </div>
        <div class="row-actions">
          <button class="btn" data-action="view"
                  data-id="${escapeHTML(invoice.id)}">عرض</button>
          <button class="btn secondary" data-action="edit"
                  data-id="${escapeHTML(invoice.id)}">تعديل</button>
          <button class="btn secondary" data-action="whatsapp"
                  data-id="${escapeHTML(invoice.id)}">واتساب</button>
          <button class="btn secondary" data-action="delete"
                  data-id="${escapeHTML(invoice.id)}">حذف</button>
        </div>
      </div>
    `).join("");
    }

    $("searchInvoice").addEventListener("input", renderInvoiceList);

    invoiceList.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const invoice = invoices.find((item) => item.id === button.dataset.id);
        if (!invoice) return;

        switch (button.dataset.action) {
            case "view":
                renderPreview(invoice);
                break;

            case "edit":
                setForm(invoice);
                $("editorTitle").textContent =
                    `تعديل الفاتورة ${invoice.number}`;
                editorPanel.classList.remove("hidden");
                previewPanel.classList.add("hidden");
                editorPanel.scrollIntoView({ behavior: "smooth" });
                break;

            case "whatsapp":
                shareWhatsApp(invoice);
                break;

            case "delete":
                if (confirm(`هل تريد حذف الفاتورة ${invoice.number}؟`)) {
                    const previous = invoices;
                    invoices = invoices.filter((item) => item.id !== invoice.id);

                    if (saveInvoices()) {
                        renderInvoiceList();
                        previewPanel.classList.add("hidden");
                    } else {
                        invoices = previous;
                    }
                }
                break;
        }
    });

    function money(value) {
        if (value === "" || value === null || value === undefined) {
            return "غير محدد";
        }

        const amount = Number(value);
        return Number.isFinite(amount)
            ? `${amount.toLocaleString("ar-EG")} جنيه`
            : "غير محدد";
    }

    function renderPreview(invoice) {
        invoicePreview.innerHTML = `
      <header class="invoice-brand">
        <div>
          <h2>شركة الرحمة للشحن الدولي</h2>
          <p>إدارة أبو رحيم</p>
          <p>شحن من الرياض إلى جميع محافظات مصر</p>
        </div>
        <div class="invoice-mark">
          الرحمة<br>للشحن الدولي
        </div>
      </header>

      <div class="invoice-title">فاتورة شحن</div>

      <div class="invoice-meta">
        <div><strong>رقم الفاتورة:</strong><br>
          ${escapeHTML(invoice.number)}</div>
        <div><strong>التاريخ:</strong><br>
          ${escapeHTML(invoice.date)}</div>
        <div><strong>عدد الطرود:</strong><br>
          ${escapeHTML(invoice.parcelCount)}</div>
      </div>

      <section class="invoice-section">
        <h3>بيانات صاحب الشحنة</h3>
        <div class="invoice-line"><strong>الاسم:</strong>
          ${escapeHTML(invoice.senderName)}</div>
        <div class="invoice-line"><strong>رقم الهاتف:</strong>
          ${escapeHTML(invoice.senderPhone)}</div>
        <div class="invoice-line"><strong>الحي / المنطقة:</strong>
          ${escapeHTML(invoice.neighborhood)}</div>
      </section>

      <section class="invoice-section">
        <h3>بيانات المستلم</h3>
        <div class="invoice-line"><strong>اسم المستلم:</strong>
          ${escapeHTML(invoice.recipientName)}</div>
        <div class="invoice-line"><strong>رقم الهاتف:</strong>
          ${escapeHTML(invoice.recipientPhone)}</div>
        <div class="invoice-line"><strong>العنوان:</strong>
          ${escapeHTML(invoice.recipientAddress)}</div>
      </section>

      <section class="invoice-section">
        <h3>تفاصيل الشحنة / ملاحظات</h3>
        <div class="invoice-line">${escapeHTML(
            invoice.shipmentDetails || "لا توجد ملاحظات"
        )}</div>
        <div class="invoice-line"><strong>تكلفة الشحن:</strong>
          ${escapeHTML(money(invoice.shippingCost))}</div>
      </section>

      <footer class="invoice-footer">
        <strong>شركة الرحمة للشحن الدولي</strong><br>
        من الرياض إلى جميع محافظات مصر<br>
        واتساب: 0544353329 — 0595576428
      </footer>
    `;

        previewPanel.classList.remove("hidden");
        previewPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    $("previewBtn").addEventListener("click", () => {
        if (!invoiceForm.reportValidity()) return;

        // المعاينة لا تحفظ التعديلات غير المحفوظة.
        renderPreview(formData());
    });

    $("printBtn").addEventListener("click", () => {
        window.print();
    });

    function whatsappMessage(invoice) {
        return [
            "السلام عليكم،",
            "هذه فاتورة استلام الشحنة من شركة الرحمة للشحن الدولي.",
            "",
            `رقم الفاتورة: ${invoice.number}`,
            `التاريخ: ${invoice.date}`,
            `اسم صاحب الشحنة: ${invoice.senderName}`,
            `رقم صاحب الشحنة: ${invoice.senderPhone}`,
            `الحي / المنطقة: ${invoice.neighborhood}`,
            `عدد الطرود: ${invoice.parcelCount}`,
            `اسم المستلم: ${invoice.recipientName}`,
            `رقم المستلم: ${invoice.recipientPhone}`,
            `عنوان المستلم: ${invoice.recipientAddress}`,
            `تفاصيل الشحنة: ${invoice.shipmentDetails || "لا توجد ملاحظات"}`,
            `تكلفة الشحن: ${money(invoice.shippingCost)}`,
            "",
            "شركة الرحمة للشحن الدولي — إدارة أبو رحيم"
        ].join("\n");
    }

    function shareWhatsApp(invoice) {
        const phone = digitsOnly(invoice.customerWhatsApp);

        if (!phone) {
            alert("أضف رقم واتساب العميل في بيانات الفاتورة أولاً.");
            return;
        }

        if (phone.length < 8 || phone.length > 15) {
            alert("رقم واتساب غير صحيح. اكتب مفتاح الدولة والرقم.");
            return;
        }

        const url = "https://wa.me/" + phone +
            "?text=" + encodeURIComponent(whatsappMessage(invoice));

        window.open(url, "_blank", "noopener,noreferrer");
    }

    $("whatsappBtn").addEventListener("click", () => {
        const invoice = formData();

        if (!invoice.number || !invoice.senderName ||
            !invoice.recipientName || !invoice.recipientAddress) {
            alert("أكمل بيانات الفاتورة أولاً.");
            return;
        }

        shareWhatsApp(invoice);
    });

    if (sessionStorage.getItem(SESSION_KEY) === "demo") {
        showApp();
    } else {
        showLogin();
    }
});