var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/utils/parseUserWorkMonths.js
var parseUserWorkMonths_exports = {};
__export(parseUserWorkMonths_exports, {
  extractWorkersFromSheet: () => extractWorkersFromSheet,
  findWorkerForLogin: () => findWorkerForLogin,
  parseUserWorkMonths: () => parseUserWorkMonths
});
module.exports = __toCommonJS(parseUserWorkMonths_exports);

// src/utils/formatCellValue.js
function formatCellValue(value) {
  if (value === null || value === void 0) return "";
  if (typeof value === "string" && value.trim() === "") return "";
  return String(value).trim();
}
function parseNumericCell(value) {
  const text = formatCellValue(value);
  if (!text) return 0;
  const parts = text.split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return parts.reduce((total, part) => {
      const numeric2 = Number(part.replace(",", "."));
      return Number.isNaN(numeric2) ? total : total + numeric2;
    }, 0);
  }
  const numeric = Number(text.replace(",", "."));
  return Number.isNaN(numeric) ? 0 : numeric;
}
function isPlaceholderCell(value) {
  const num = parseNumericCell(value);
  return num === 0 || num === 0.1;
}
function sumNumericCells(values) {
  return values.reduce((total, value) => {
    if (isPlaceholderCell(value)) return total;
    return total + parseNumericCell(value);
  }, 0);
}
function formatAmountTotal(total) {
  if (!total) return "";
  return String(Math.round(total * 100) / 100);
}

// src/i18n/messages.js
var messages = {
  en: {
    registrationTitle: "Registration / Login",
    registrationSubtitle: "Fill out name and password.",
    namePlaceholder: "Name",
    passwordPlaceholder: "Password",
    showPassword: "Show",
    hidePassword: "Hide",
    loginButton: "Log In",
    logoutButton: "Log Out",
    wrongCredentials: "Wrong name or password.",
    loading: "Loading...",
    introWelcome: "Welcome",
    introTagline: "Live Excel data, right in your browser",
    userInfoTitle: "User Info",
    nameLabel: "Name",
    passwordLabel: "Password",
    fileSavedAt: "File saved: {fileSavedAt}",
    waitingForData: "Waiting for data from backend...",
    errorPrefix: "Error:",
    profileTitle: "Profile",
    profileClose: "Close",
    menuProfile: "Profile",
    menuRules: "Rules",
    menuAnnouncement: "Announcement",
    menuLanguage: "Language",
    menuLogOut: "Log Out",
    musicPlay: "Play",
    musicPause: "Pause",
    logoutConfirmTitle: "Log out",
    logoutConfirmText: "Are you sure you want to log out?",
    logoutConfirmYes: "Yes",
    logoutConfirmNo: "No",
    announcementTitle: "Announcement",
    announcementRecipientsHint: "Select other users",
    announcementSelectAll: "Select all",
    announcementTextLabel: "Announcement text",
    announcementTextPlaceholder: "Write your announcement...",
    announcementSubmit: "Add announcement",
    announcementDelete: "Delete announcement",
    announcementTextRequired: "Enter announcement text.",
    announcementRecipientsRequired: "Select at least one name.",
    announcementSaveFailed: "Failed to save announcement.",
    announcementDeleteFailed: "Failed to delete announcement.",
    rulesTitle: "Rules & guide",
    rulesIntro: "Welcome to HydroAir Sistems. This page explains what the site does and how to use it after you sign in.",
    rulesCanDoTitle: "What you can do",
    rulesCanDo2: "View your row in the table.",
    rulesCanDo4: "Open the menu with \u201CClick me\u201D for profile, language, rules, and logout.",
    rulesCanDo5: "Change interface language (English, Russian, Armenian).",
    rulesCanDo8: "When there is an announcement, you will see it at the top of the screen in a yellow banner.",
    rulesCanDo7: "Hide or show the table with \u201CHide tables\u201D / \u201CShow tables\u201D.",
    rulesSeeTitle: "What you will see",
    rulesSeeText: "After login: HydroAir Sistems title, your data table, sheet tabs, the \u201CClick me\u201D button, and footer. In Profile: interface language, name, and password. Server errors appear above the table in red. On mobile, menus open from the bottom of the screen.",
    rulesThanksText: "Thank you for using HydroAir Sistems. We appreciate your time and hope the service is helpful for your daily work.",
    clickMe: "Click me",
    collapseTables: "Hide tables",
    expandTables: "Show tables",
    openProfile: "Profile",
    languageLabel: "Language",
    emptyRows: "No rows yet. Update your Excel range to see data.",
    hoursLabel: "Hours",
    amountLabel: "Amount",
    totalLabel: "Total",
    monthNames: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ],
    colHeader: "Col",
    footerRight: "Live sync (auto refresh)"
  },
  ru: {
    registrationTitle: "\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F / \u0412\u0445\u043E\u0434",
    registrationSubtitle: "\u0417\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0438\u043C\u044F \u0438 \u043F\u0430\u0440\u043E\u043B\u044C.",
    namePlaceholder: "\u0418\u043C\u044F",
    passwordPlaceholder: "\u041F\u0430\u0440\u043E\u043B\u044C",
    showPassword: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C",
    hidePassword: "\u0421\u043A\u0440\u044B\u0442\u044C",
    loginButton: "\u0412\u043E\u0439\u0442\u0438",
    logoutButton: "\u0412\u044B\u0439\u0442\u0438",
    wrongCredentials: "\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0438\u043C\u044F \u0438\u043B\u0438 \u043F\u0430\u0440\u043E\u043B\u044C.",
    loading: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...",
    introWelcome: "\u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C",
    introTagline: "\u0414\u0430\u043D\u043D\u044B\u0435 Excel \u0432 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u043C \u0432\u0440\u0435\u043C\u0435\u043D\u0438",
    userInfoTitle: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C",
    nameLabel: "\u0418\u043C\u044F",
    passwordLabel: "\u041F\u0430\u0440\u043E\u043B\u044C",
    fileSavedAt: "\u0424\u0430\u0439\u043B \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D: {fileSavedAt}",
    waitingForData: "\u041E\u0436\u0438\u0434\u0430\u043D\u0438\u0435 \u0434\u0430\u043D\u043D\u044B\u0445 \u0441 backend...",
    errorPrefix: "\u041E\u0448\u0438\u0431\u043A\u0430:",
    profileTitle: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C",
    profileClose: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C",
    menuProfile: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C",
    menuRules: "\u041F\u0440\u0430\u0432\u0438\u043B\u0430",
    menuAnnouncement: "\u041E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435",
    menuLanguage: "\u042F\u0437\u044B\u043A",
    menuLogOut: "\u0412\u044B\u0439\u0442\u0438",
    musicPlay: "Play",
    musicPause: "Pause",
    logoutConfirmTitle: "\u0412\u044B\u0445\u043E\u0434",
    logoutConfirmText: "\u0412\u044B \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u043E \u0445\u043E\u0442\u0438\u0442\u0435 \u0432\u044B\u0439\u0442\u0438?",
    logoutConfirmYes: "\u0414\u0430",
    logoutConfirmNo: "\u041D\u0435\u0442",
    announcementTitle: "\u041E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435",
    announcementRecipientsHint: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0440\u0443\u0433\u0438\u0445 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439",
    announcementSelectAll: "\u041E\u0442\u043C\u0435\u0442\u0438\u0442\u044C \u0432\u0441\u0435\u0445",
    announcementTextLabel: "\u0422\u0435\u043A\u0441\u0442 \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u044F",
    announcementTextPlaceholder: "\u041D\u0430\u043F\u0438\u0448\u0438\u0442\u0435 \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435...",
    announcementSubmit: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435",
    announcementDelete: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435",
    announcementTextRequired: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0442\u0435\u043A\u0441\u0442 \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u044F.",
    announcementRecipientsRequired: "\u041E\u0442\u043C\u0435\u0442\u044C\u0442\u0435 \u0438\u043C\u0435\u043D\u0430.",
    announcementSaveFailed: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435.",
    announcementDeleteFailed: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435.",
    rulesTitle: "\u041F\u0440\u0430\u0432\u0438\u043B\u0430 \u0438 \u0441\u043F\u0440\u0430\u0432\u043A\u0430",
    rulesIntro: "\u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 HydroAir Sistems. \u0417\u0434\u0435\u0441\u044C \u043E\u043F\u0438\u0441\u0430\u043D\u043E, \u0434\u043B\u044F \u0447\u0435\u0433\u043E \u044D\u0442\u043E\u0442 \u0441\u0430\u0439\u0442 \u0438 \u043A\u0430\u043A \u0438\u043C \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C\u0441\u044F \u043F\u043E\u0441\u043B\u0435 \u0432\u0445\u043E\u0434\u0430.",
    rulesCanDoTitle: "\u0427\u0442\u043E \u0443\u043C\u0435\u0435\u0442 \u0441\u0430\u0439\u0442",
    rulesCanDo2: "\u041F\u0440\u043E\u0441\u043C\u043E\u0442\u0440 \u0432\u0430\u0448\u0435\u0439 \u0441\u0442\u0440\u043E\u043A\u0438 \u0432 \u0442\u0430\u0431\u043B\u0438\u0446\u0435.",
    rulesCanDo4: "\u041C\u0435\u043D\u044E \xAB\u041D\u0430\u0436\u043C\u0438 \u043D\u0430 \u043C\u0435\u043D\u044F\xBB: \u043F\u0440\u043E\u0444\u0438\u043B\u044C, \u044F\u0437\u044B\u043A, \u043F\u0440\u0430\u0432\u0438\u043B\u0430 \u0438 \u0432\u044B\u0445\u043E\u0434.",
    rulesCanDo5: "\u0421\u043C\u0435\u043D\u0430 \u044F\u0437\u044B\u043A\u0430 \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0430 (\u0430\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u0438\u0439, \u0440\u0443\u0441\u0441\u043A\u0438\u0439, \u0430\u0440\u043C\u044F\u043D\u0441\u043A\u0438\u0439).",
    rulesCanDo8: "\u041F\u0440\u0438 \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0438 \u0432\u044B \u0443\u0432\u0438\u0434\u0438\u0442\u0435 \u0435\u0433\u043E \u0432\u0432\u0435\u0440\u0445\u0443 \u044D\u043A\u0440\u0430\u043D\u0430 \u2014 \u0436\u0451\u043B\u0442\u0430\u044F \u043F\u043E\u043B\u043E\u0441\u0430 \u0441 \u0442\u0435\u043A\u0441\u0442\u043E\u043C.",
    rulesCanDo7: "\u041A\u043D\u043E\u043F\u043A\u0438 \xAB\u0421\u043A\u0440\u044B\u0442\u044C \u0442\u0430\u0431\u043B\u0438\u0446\u044B\xBB / \xAB\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0442\u0430\u0431\u043B\u0438\u0446\u044B\xBB \u2014 \u0441\u043A\u0440\u044B\u0442\u044C \u0438\u043B\u0438 \u0432\u0435\u0440\u043D\u0443\u0442\u044C \u0442\u0430\u0431\u043B\u0438\u0446\u0443.",
    rulesSeeTitle: "\u0427\u0442\u043E \u0432\u0438\u0434\u0438\u0442 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C",
    rulesSeeText: "\u041F\u043E\u0441\u043B\u0435 \u0432\u0445\u043E\u0434\u0430: \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 HydroAir Sistems, \u0442\u0430\u0431\u043B\u0438\u0446\u0430 \u0441 \u0434\u0430\u043D\u043D\u044B\u043C\u0438, \u0432\u043A\u043B\u0430\u0434\u043A\u0438 \u043B\u0438\u0441\u0442\u043E\u0432, \u043A\u043D\u043E\u043F\u043A\u0430 \xAB\u041D\u0430\u0436\u043C\u0438 \u043D\u0430 \u043C\u0435\u043D\u044F\xBB \u0438 \u043F\u043E\u0434\u0432\u0430\u043B. \u0412 \u043F\u0440\u043E\u0444\u0438\u043B\u0435 \u2014 \u044F\u0437\u044B\u043A \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0430, \u0438\u043C\u044F \u0438 \u043F\u0430\u0440\u043E\u043B\u044C. \u041E\u0448\u0438\u0431\u043A\u0438 \u0441\u0435\u0440\u0432\u0435\u0440\u0430 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u044E\u0442\u0441\u044F \u043D\u0430\u0434 \u0442\u0430\u0431\u043B\u0438\u0446\u0435\u0439 \u043A\u0440\u0430\u0441\u043D\u044B\u043C \u0442\u0435\u043A\u0441\u0442\u043E\u043C. \u041D\u0430 \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0435 \u043C\u0435\u043D\u044E \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0441\u043D\u0438\u0437\u0443 \u044D\u043A\u0440\u0430\u043D\u0430.",
    rulesThanksText: "\u0421\u043F\u0430\u0441\u0438\u0431\u043E, \u0447\u0442\u043E \u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0435\u0441\u044C HydroAir Sistems. \u041C\u044B \u0446\u0435\u043D\u0438\u043C \u0432\u0430\u0448\u0435 \u0432\u0440\u0435\u043C\u044F \u0438 \u043D\u0430\u0434\u0435\u0435\u043C\u0441\u044F, \u0447\u0442\u043E \u0441\u0435\u0440\u0432\u0438\u0441 \u043F\u043E\u043C\u043E\u0433\u0430\u0435\u0442 \u0432\u0430\u043C \u0432 \u0440\u0430\u0431\u043E\u0442\u0435.",
    clickMe: "\u041D\u0430\u0436\u043C\u0438 \u043D\u0430 \u043C\u0435\u043D\u044F",
    collapseTables: "\u0421\u043A\u0440\u044B\u0442\u044C \u0442\u0430\u0431\u043B\u0438\u0446\u044B",
    expandTables: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0442\u0430\u0431\u043B\u0438\u0446\u044B",
    emptyRows: "\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445. \u041E\u0431\u043D\u043E\u0432\u0438 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D Excel, \u0447\u0442\u043E\u0431\u044B \u0443\u0432\u0438\u0434\u0435\u0442\u044C \u0442\u0430\u0431\u043B\u0438\u0446\u0443.",
    hoursLabel: "\u0427\u0430\u0441\u044B",
    amountLabel: "\u0421\u0443\u043C\u043C\u0430",
    totalLabel: "\u0418\u0442\u043E\u0433\u043E",
    monthNames: [
      "\u042F\u043D\u0432\u0430\u0440\u044C",
      "\u0424\u0435\u0432\u0440\u0430\u043B\u044C",
      "\u041C\u0430\u0440\u0442",
      "\u0410\u043F\u0440\u0435\u043B\u044C",
      "\u041C\u0430\u0439",
      "\u0418\u044E\u043D\u044C",
      "\u0418\u044E\u043B\u044C",
      "\u0410\u0432\u0433\u0443\u0441\u0442",
      "\u0421\u0435\u043D\u0442\u044F\u0431\u0440\u044C",
      "\u041E\u043A\u0442\u044F\u0431\u0440\u044C",
      "\u041D\u043E\u044F\u0431\u0440\u044C",
      "\u0414\u0435\u043A\u0430\u0431\u0440\u044C"
    ],
    colHeader: "\u041A\u043E\u043B.",
    footerRight: "Live sync (\u0430\u0432\u0442\u043E\u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435)"
  },
  hy: {
    registrationTitle: "\u0533\u0580\u0561\u0576\u0581\u0578\u0582\u0574 / \u0544\u0578\u0582\u057F\u0584",
    registrationSubtitle: "\u053C\u0580\u0561\u0581\u0580\u0565\u0584 \u0561\u0576\u0578\u0582\u0576\u0576 \u0578\u0582 \u0563\u0561\u0572\u057F\u0576\u0561\u0562\u0561\u057C\u0568:",
    namePlaceholder: "\u0531\u0576\u0578\u0582\u0576",
    passwordPlaceholder: "\u0533\u0561\u0572\u057F\u0576\u0561\u0562\u0561\u057C",
    showPassword: "\u0551\u0578\u0582\u0575\u0581 \u057F\u0561\u056C",
    hidePassword: "\u0539\u0561\u0584\u0581\u0576\u0565\u056C",
    loginButton: "\u0544\u0578\u0582\u057F\u0584 \u0563\u0578\u0580\u056E\u0565\u056C",
    logoutButton: "\u0535\u056C\u0584",
    wrongCredentials: "\u054D\u056D\u0561\u056C \u0561\u0576\u0578\u0582\u0576 \u056F\u0561\u0574 \u0563\u0561\u0572\u057F\u0576\u0561\u0562\u0561\u057C\u0589",
    loading: "\u0532\u0565\u057C\u0576\u0578\u0582\u0574...",
    introWelcome: "\u0532\u0561\u0580\u056B \u0563\u0561\u056C\u0578\u0582\u057D\u057F",
    introTagline: "Excel-\u056B \u057F\u057E\u0575\u0561\u056C\u0576\u0565\u0580\u0568\u055D \u0571\u0565\u0580 \u0562\u0580\u0561\u0578\u0582\u0566\u0565\u0580\u0578\u0582\u0574",
    userInfoTitle: "\u0555\u0563\u057F\u0561\u057F\u0565\u0580",
    nameLabel: "\u0531\u0576\u0578\u0582\u0576",
    passwordLabel: "\u0533\u0561\u0572\u057F\u0576\u0561\u0562\u0561\u057C",
    fileSavedAt: "\u0556\u0561\u0575\u056C\u0568 \u057A\u0561\u0570\u057E\u0561\u056E \u0567\u055D {fileSavedAt}",
    waitingForData: "\u054D\u057A\u0561\u057D\u0578\u0582\u0574 \u0565\u0576\u0584 backend-\u056B\u0581 \u057F\u057E\u0575\u0561\u056C\u0576\u0565\u0580\u056B\u0576...",
    errorPrefix: "\u054D\u056D\u0561\u056C:",
    profileTitle: "\u054A\u0580\u0578\u0586\u056B\u056C",
    profileClose: "\u0553\u0561\u056F\u0565\u056C",
    menuProfile: "\u054A\u0580\u0578\u0586\u056B\u056C",
    menuRules: "\u053F\u0561\u0576\u0578\u0576\u0576\u0565\u0580",
    menuAnnouncement: "\u0540\u0561\u0575\u057F\u0561\u0580\u0561\u0580\u0578\u0582\u0569\u0575\u0578\u0582\u0576",
    menuLanguage: "\u053C\u0565\u0566\u0578\u0582",
    menuLogOut: "\u0535\u056C\u0584",
    musicPlay: "Play",
    musicPause: "Pause",
    logoutConfirmTitle: "\u0535\u056C\u0584",
    logoutConfirmText: "\u053B\u057D\u056F\u0561\u057A\u0565\u055E\u057D \u0581\u0561\u0576\u056F\u0561\u0576\u0578\u0582\u0574 \u0565\u0584 \u0564\u0578\u0582\u0580\u057D \u0563\u0561\u056C\u0589",
    logoutConfirmYes: "\u0531\u0575\u0578",
    logoutConfirmNo: "\u0548\u0579",
    announcementTitle: "\u0540\u0561\u0575\u057F\u0561\u0580\u0561\u0580\u0578\u0582\u0569\u0575\u0578\u0582\u0576",
    announcementRecipientsHint: "\u0538\u0576\u057F\u0580\u0565\u0584 \u0574\u0575\u0578\u0582\u057D \u0585\u0563\u057F\u0561\u057F\u0565\u0580\u0565\u0580\u056B\u0576",
    announcementSelectAll: "\u0546\u0577\u0565\u056C \u0562\u0578\u056C\u0578\u0580\u056B\u0576",
    announcementTextLabel: "\u0540\u0561\u0575\u057F\u0561\u0580\u0561\u0580\u0578\u0582\u0569\u0575\u0561\u0576 \u057F\u0565\u0584\u057D\u057F",
    announcementTextPlaceholder: "\u0533\u0580\u0565\u0584 \u0570\u0561\u0575\u057F\u0561\u0580\u0561\u0580\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0568...",
    announcementSubmit: "\u0531\u057E\u0565\u056C\u0561\u0581\u0576\u0565\u056C \u0570\u0561\u0575\u057F\u0561\u0580\u0561\u0580\u0578\u0582\u0569\u0575\u0578\u0582\u0576",
    announcementDelete: "\u054B\u0576\u057B\u0565\u056C \u0570\u0561\u0575\u057F\u0561\u0580\u0561\u0580\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0568",
    announcementTextRequired: "\u0544\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0565\u0584 \u0570\u0561\u0575\u057F\u0561\u0580\u0561\u0580\u0578\u0582\u0569\u0575\u0561\u0576 \u057F\u0565\u0584\u057D\u057F\u0568\u0589",
    announcementRecipientsRequired: "\u0546\u0577\u0565\u0584 \u0561\u0576\u0578\u0582\u0576\u0576\u0565\u0580\u0568\u0589",
    announcementSaveFailed: "\u0540\u0561\u0575\u057F\u0561\u0580\u0561\u0580\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0568 \u0579\u0570\u0561\u057B\u0578\u0572\u057E\u0565\u0581 \u057A\u0561\u0570\u0565\u056C\u0589",
    announcementDeleteFailed: "\u0540\u0561\u0575\u057F\u0561\u0580\u0561\u0580\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0568 \u0579\u0570\u0561\u057B\u0578\u0572\u057E\u0565\u0581 \u057B\u0576\u057B\u0565\u056C\u0589",
    rulesTitle: "\u053F\u0561\u0576\u0578\u0576\u0576\u0565\u0580 \u0587 \u0578\u0582\u0572\u0565\u0581\u0578\u0582\u0575\u0581",
    rulesIntro: "\u0532\u0561\u0580\u056B \u0563\u0561\u056C\u0578\u0582\u057D\u057F HydroAir Sistems\u0589 \u0531\u0575\u057D\u057F\u0565\u0572 \u0576\u056F\u0561\u0580\u0561\u0563\u0580\u057E\u0561\u056E \u0567, \u0569\u0565 \u056B\u0576\u0579\u056B \u0570\u0561\u0574\u0561\u0580 \u0567 \u056F\u0561\u0575\u0584\u0568 \u0587 \u056B\u0576\u0579\u057A\u0565\u057D \u0585\u0563\u057F\u0561\u0563\u0578\u0580\u056E\u0565\u056C \u0574\u0578\u0582\u057F\u0584\u056B\u0581 \u0570\u0565\u057F\u0578\u0589",
    rulesCanDoTitle: "\u053B\u0576\u0579 \u056F\u0561\u0580\u0565\u056C\u056B \u0567 \u0561\u0576\u0565\u056C",
    rulesCanDo2: "\u0541\u0565\u0580 \u057F\u0578\u0572\u056B \u0564\u056B\u057F\u0578\u0582\u0574 \u0561\u0572\u0575\u0578\u0582\u057D\u0561\u056F\u0578\u0582\u0574\u0589",
    rulesCanDo4: "\xAB\u054D\u0565\u0572\u0574\u056B\u0580 \u056B\u0576\u0571\xBB \u0574\u0565\u0576\u0575\u0578\u0582\u055D \u057A\u0580\u0578\u0586\u056B\u056C, \u056C\u0565\u0566\u0578\u0582, \u056F\u0561\u0576\u0578\u0576\u0576\u0565\u0580, \u0565\u056C\u0584\u0589",
    rulesCanDo5: "\u053B\u0576\u057F\u0565\u0580\u0586\u0565\u0575\u057D\u056B \u056C\u0565\u0566\u057E\u056B \u0583\u0578\u0583\u0578\u056D\u0578\u0582\u0569\u0575\u0578\u0582\u0576 (\u0561\u0576\u0563\u056C\u0565\u0580\u0565\u0576, \u057C\u0578\u0582\u057D\u0565\u0580\u0565\u0576, \u0570\u0561\u0575\u0565\u0580\u0565\u0576)\u0589",
    rulesCanDo8: "\u0540\u0561\u0575\u057F\u0561\u0580\u0561\u0580\u0578\u0582\u0569\u0575\u0561\u0576 \u0564\u0565\u057A\u0584\u0578\u0582\u0574 \u0561\u0575\u0576 \u056F\u057F\u0565\u057D\u0576\u0565\u0584 \u0567\u056F\u0580\u0561\u0576\u056B \u057E\u0565\u0580\u0587\u0578\u0582\u0574\u055D \u0564\u0565\u0572\u056B\u0576 \u0563\u0578\u057F\u0578\u057E\u0589",
    rulesCanDo7: "\xAB\u0539\u0561\u0584\u0581\u0576\u0565\u056C \u0561\u0572\u0575\u0578\u0582\u057D\u0561\u056F\u0576\u0565\u0580\u0568\xBB / \xAB\u0551\u0578\u0582\u0575\u0581 \u057F\u0561\u056C \u0561\u0572\u0575\u0578\u0582\u057D\u0561\u056F\u0576\u0565\u0580\u0568\xBB \u056F\u0578\u0573\u0561\u056F\u0576\u0565\u0580\u0578\u057E \u0561\u0572\u0575\u0578\u0582\u057D\u0561\u056F\u056B \u0581\u0578\u0582\u0581\u0561\u0564\u0580\u0578\u0582\u0574/\u0569\u0561\u0584\u0581\u0578\u0582\u0574\u0589",
    rulesSeeTitle: "\u053B\u0576\u0579 \u056F\u057F\u0565\u057D\u0576\u0565\u0584",
    rulesSeeText: "\u0544\u0578\u0582\u057F\u0584\u056B\u0581 \u0570\u0565\u057F\u0578\u055D HydroAir Sistems \u057E\u0565\u0580\u0576\u0561\u0563\u056B\u0580, \u0561\u0572\u0575\u0578\u0582\u057D\u0561\u056F, \u0569\u0565\u0580\u0569\u0565\u0580\u056B \u0576\u0565\u0580\u0564\u056B\u0580\u0576\u0565\u0580, \xAB\u054D\u0565\u0572\u0574\u056B\u0580 \u056B\u0576\u0571\xBB \u056F\u0578\u0573\u0561\u056F \u0587 \u0576\u0565\u0580\u0584\u0587\u056B \u0570\u0561\u057F\u057E\u0561\u056E\u0589 \u054A\u0580\u0578\u0586\u056B\u056C\u0578\u0582\u0574\u055D \u056C\u0565\u0566\u0578\u0582, \u0561\u0576\u0578\u0582\u0576 \u0587 \u0563\u0561\u0572\u057F\u0576\u0561\u0562\u0561\u057C\u0589 \u054D\u0565\u0580\u057E\u0565\u0580\u056B \u057D\u056D\u0561\u056C\u0576\u0565\u0580\u0568\u055D \u0561\u0572\u0575\u0578\u0582\u057D\u0561\u056F\u056B \u057E\u0565\u0580\u0587\u0578\u0582\u0574 \u056F\u0561\u0580\u0574\u056B\u0580\u0578\u057E\u0589 \u0532\u057B\u057B\u0561\u0575\u056B\u0576\u0578\u0582\u0574 \u0574\u0565\u0576\u0575\u0578\u0582\u0576 \u0562\u0561\u0581\u057E\u0578\u0582\u0574 \u0567 \u0567\u056F\u0580\u0561\u0576\u056B \u0576\u0565\u0580\u0584\u0587\u056B\u0581\u0589",
    rulesThanksText: "\u0547\u0576\u0578\u0580\u0570\u0561\u056F\u0561\u056C\u0578\u0582\u0569\u0575\u0578\u0582\u0576 HydroAir Sistems-\u056B\u0581 \u0585\u0563\u057F\u057E\u0565\u056C\u0578\u0582 \u0570\u0561\u0574\u0561\u0580\u0589 \u0533\u0576\u0561\u0570\u0561\u057F\u0578\u0582\u0574 \u0565\u0576\u0584 \u0571\u0565\u0580 \u056A\u0561\u0574\u0561\u0576\u0561\u056F\u0568 \u0587 \u0570\u0578\u0582\u0575\u057D\u0578\u057E \u0565\u0576\u0584, \u0578\u0580 \u056E\u0561\u057C\u0561\u0575\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0568 \u0585\u0563\u057F\u0561\u056F\u0561\u0580 \u0567 \u0571\u0565\u0580 \u0561\u0577\u056D\u0561\u057F\u0561\u0576\u0584\u0578\u0582\u0574\u0589",
    clickMe: "\u054D\u0565\u0572\u0574\u056B\u0580 \u056B\u0576\u0571",
    collapseTables: "\u0539\u0561\u0584\u0581\u0576\u0565\u056C \u0561\u0572\u0575\u0578\u0582\u057D\u0561\u056F\u0576\u0565\u0580\u0568",
    expandTables: "\u0551\u0578\u0582\u0575\u0581 \u057F\u0561\u056C \u0561\u0572\u0575\u0578\u0582\u057D\u0561\u056F\u0576\u0565\u0580\u0568",
    emptyRows: "\u054F\u0578\u0572\u0565\u0580\u0568 \u0564\u0565\u057C \u0579\u056F\u0561\u0576\u0589 \u0539\u0561\u0580\u0574\u0561\u0581\u0580\u0578\u0582 Excel-\u056B \u0574\u056B\u057B\u0561\u056F\u0561\u0575\u0584\u0568\u055D \u057F\u057E\u0575\u0561\u056C\u0576\u0565\u0580\u0568 \u057F\u0565\u057D\u0576\u0565\u056C\u0578\u0582 \u0570\u0561\u0574\u0561\u0580\u0589",
    hoursLabel: "\u053A\u0561\u0574",
    amountLabel: "\u0533\u0578\u0582\u0574\u0561\u0580",
    totalLabel: "\u0538\u0576\u0564\u0561\u0574\u0565\u0576\u0568",
    monthNames: [
      "\u0540\u0578\u0582\u0576\u057E\u0561\u0580",
      "\u0553\u0565\u057F\u0580\u057E\u0561\u0580",
      "\u0544\u0561\u0580\u057F",
      "\u0531\u057A\u0580\u056B\u056C",
      "\u0544\u0561\u0575\u056B\u057D",
      "\u0540\u0578\u0582\u0576\u056B\u057D",
      "\u0540\u0578\u0582\u056C\u056B\u057D",
      "\u0555\u0563\u0578\u057D\u057F\u0578\u057D",
      "\u054D\u0565\u057A\u057F\u0565\u0574\u0562\u0565\u0580",
      "\u0540\u0578\u056F\u057F\u0565\u0574\u0562\u0565\u0580",
      "\u0546\u0578\u0575\u0565\u0574\u0562\u0565\u0580",
      "\u0534\u0565\u056F\u057F\u0565\u0574\u0562\u0565\u0580"
    ],
    colHeader: "\u054D\u0575\u0578\u0582\u0576\u0561\u056F",
    liveViewSubtitle: "\u054F\u057E\u0575\u0561\u056C\u0576\u0565\u0580\u0568 \u0561\u057E\u057F\u0578\u0574\u0561\u057F \u0569\u0561\u0580\u0574\u0561\u0581\u057E\u0578\u0582\u0574 \u0565\u0576 backend-\u056B\u0581\u0589",
    footerRight: "Live sync (\u0561\u057E\u057F\u0578\u0574\u0561\u057F \u0569\u0561\u0580\u0574\u0561\u0581\u0578\u0582\u0574)"
  }
};

// src/utils/translateMonthName.js
var MONTH_ALIASES = {
  january: 0,
  jan: 0,
  \u044F\u043D\u0432\u0430\u0440\u044C: 0,
  \u044F\u043D\u0432: 0,
  \u0570\u0578\u0582\u0576\u057E\u0561\u0580: 0,
  february: 1,
  feb: 1,
  \u0444\u0435\u0432\u0440\u0430\u043B\u044C: 1,
  \u0444\u0435\u0432: 1,
  \u0583\u0565\u057F\u0580\u057E\u0561\u0580: 1,
  march: 2,
  mar: 2,
  \u043C\u0430\u0440\u0442: 2,
  \u0574\u0561\u0580\u057F: 2,
  april: 3,
  apr: 3,
  \u0430\u043F\u0440\u0435\u043B\u044C: 3,
  \u0430\u043F\u0440: 3,
  \u0561\u057A\u0580\u056B\u056C: 3,
  may: 4,
  \u043C\u0430\u0439: 4,
  \u0574\u0561\u0575\u056B\u057D: 4,
  june: 5,
  jun: 5,
  \u0438\u044E\u043D\u044C: 5,
  \u0438\u044E\u043D: 5,
  \u0570\u0578\u0582\u0576\u056B\u057D: 5,
  july: 6,
  jul: 6,
  \u0438\u044E\u043B\u044C: 6,
  \u0438\u044E\u043B: 6,
  \u0570\u0578\u0582\u056C\u056B\u057D: 6,
  august: 7,
  aug: 7,
  \u0430\u0432\u0433\u0443\u0441\u0442: 7,
  \u0430\u0432\u0433: 7,
  \u0585\u0563\u0578\u057D\u057F\u0578\u057D: 7,
  september: 8,
  sep: 8,
  sept: 8,
  \u0441\u0435\u043D\u0442\u044F\u0431\u0440\u044C: 8,
  \u0441\u0435\u043D: 8,
  \u057D\u0565\u057A\u057F\u0565\u0574\u0562\u0565\u0580: 8,
  october: 9,
  oct: 9,
  \u043E\u043A\u0442\u044F\u0431\u0440\u044C: 9,
  \u043E\u043A\u0442: 9,
  \u0570\u0578\u056F\u057F\u0565\u0574\u0562\u0565\u0580: 9,
  november: 10,
  nov: 10,
  \u043D\u043E\u044F\u0431\u0440\u044C: 10,
  \u043D\u043E\u044F: 10,
  \u0576\u0578\u0575\u0565\u0574\u0562\u0565\u0580: 10,
  december: 11,
  dec: 11,
  \u0434\u0435\u043A\u0430\u0431\u0440\u044C: 11,
  \u0434\u0435\u043A: 11,
  \u0564\u0565\u056F\u057F\u0565\u0574\u0562\u0565\u0580: 11
};
function isKnownMonthName(rawMonth) {
  const key = String(rawMonth || "").trim().toLowerCase();
  return key !== "" && Object.prototype.hasOwnProperty.call(MONTH_ALIASES, key);
}
function getMonthIndex(rawMonth) {
  const key = String(rawMonth || "").trim().toLowerCase();
  return MONTH_ALIASES[key];
}
function isSummaryMonth(monthNameOrIndex) {
  const index = typeof monthNameOrIndex === "number" ? monthNameOrIndex : getMonthIndex(monthNameOrIndex);
  return index !== void 0 && index >= 5;
}
function canonicalMonthName(rawMonth) {
  const formatted = String(rawMonth || "").trim();
  if (!formatted) return "";
  const index = getMonthIndex(formatted);
  if (index === void 0) return formatted;
  return messages.hy?.monthNames?.[index] || formatted;
}
function resolveSequentialMonthName(rawMonth, previousResolvedMonth) {
  const formatted = String(rawMonth || "").trim();
  if (!isKnownMonthName(formatted)) return formatted;
  const index = getMonthIndex(formatted);
  if (index === void 0) return formatted;
  const previousIndex = getMonthIndex(previousResolvedMonth);
  if (previousIndex !== void 0 && previousIndex === index) {
    const nextIndex = Math.min(index + 1, 11);
    return messages.hy?.monthNames?.[nextIndex] || formatted;
  }
  return messages.hy?.monthNames?.[index] || formatted;
}

// src/utils/parseUserWorkMonths.js
var SKIP_ROW_LABELS = /* @__PURE__ */ new Set(["\u0538\u0546\u0534\u0540", "\u056E\u0561\u056D\u057D", "\u056F\u0565\u057F", "Hos"]);
function normalizeName(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function normalizeDisplayName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}
function normalizeNameForMatch(value) {
  return normalizeName(value).replace(/իել/g, "\u0565\u056C");
}
function hasBPrefix(name) {
  return /^բ\s+/u.test(normalizeName(name));
}
function findWorkerByLoginName(workers, loginName) {
  const normalizedInput = normalizeNameForMatch(loginName);
  const exact = workers.find((worker) => normalizeNameForMatch(worker.name) === normalizedInput);
  if (exact) return exact;
  if (!hasBPrefix(loginName)) {
    const prefixedKey = normalizeNameForMatch(`\u0562 ${loginName}`);
    const prefixedMatches = workers.filter(
      (worker) => normalizeNameForMatch(worker.name) === prefixedKey
    );
    if (prefixedMatches.length === 1) return prefixedMatches[0];
  }
  return null;
}
function buildWorkerPassword(name, id) {
  return `${normalizeNameForMatch(name)}${id}123`;
}
function matchesWorkerPassword(worker, password) {
  const trimmed = String(password || "").trim();
  if (!trimmed) return false;
  if (worker.password === trimmed) return true;
  const variants = /* @__PURE__ */ new Set([
    buildWorkerPassword(worker.name, worker.id),
    `${worker.name}${worker.id}123`
  ]);
  const workerKey = normalizeNameForMatch(worker.name);
  if (hasBPrefix(worker.name)) {
    variants.add(`${workerKey.replace(/^բ\s+/, "")}${worker.id}123`);
  }
  return variants.has(trimmed) || variants.has(normalizeName(trimmed));
}
function isNumericCode(value) {
  if (value === "" || value === null || value === void 0) return false;
  const numeric = Number(String(value).replace(",", "."));
  return !Number.isNaN(numeric);
}
function isSectionLabel(value) {
  const text = String(value || "").trim();
  if (!text || text === "\u053D\u0578\u0582\u0574\u0562") return text === "\u053D\u0578\u0582\u0574\u0562";
  if (/^բ\s+[\u0530-\u058F]/u.test(text)) return false;
  return /^[\u0530-\u058F](\s+[\u0530-\u058F])+$/u.test(text);
}
function isGroupLabel(value) {
  const text = String(value || "").trim();
  if (!text || text === "\u053D\u0578\u0582\u0574\u0562") return false;
  if (isSectionLabel(text)) return true;
  if (text.length > 12 && /[\u0530-\u058F]/.test(text) && /\s/.test(text)) return true;
  return false;
}
function rowLooksLikeSummaryData(row, headerRow) {
  const name = getSummaryRowName(row);
  if (!name) return false;
  if (isSummaryUserRow(row)) return true;
  const { dayColumns } = extractDayColumns(headerRow);
  return rowHasSummaryValues(row, dayColumns);
}
function sortBlocksByMonth(blocks) {
  return [...blocks].sort(
    (left, right) => (getMonthIndex(left.month) ?? 99) - (getMonthIndex(right.month) ?? 99)
  );
}
function appendMissingSummaryMonthBlocks(rows, userName, blocks) {
  const seenMonths = new Set(blocks.map((block) => block.month));
  const seenMonthIndices = new Set(
    blocks.map((block) => getMonthIndex(canonicalMonthName(block.month))).filter((index) => index !== void 0)
  );
  const headerRows = findMonthHeaderRows(rows);
  let previousMonth = "";
  for (let index = 0; index < headerRows.length; index += 1) {
    const headerIndex = headerRows[index];
    const endIndex = headerRows[index + 1] ?? rows.length;
    const rawMonth = getMonthLabelFromBlock(rows, headerIndex);
    if (rawMonth && isKnownMonthName(rawMonth)) {
      const rawIndex = getMonthIndex(canonicalMonthName(rawMonth));
      if (rawIndex !== void 0 && seenMonthIndices.has(rawIndex)) continue;
    }
    const month = resolveBlockMonth(rawMonth, previousMonth);
    if (month) previousMonth = month;
    if (!isSummaryMonth(month)) continue;
    if (inferBlockLayout(rows, headerIndex, endIndex, month) !== "summary") continue;
    if (seenMonths.has(month)) continue;
    const blockEnd = getSummaryBlockEndIndex(headerRows, index, rows, month);
    const block = parseSummaryMonthBlock(rows, headerIndex, blockEnd, userName, month);
    if (block) {
      blocks.push(block);
      seenMonths.add(month);
      const monthIndex = getMonthIndex(canonicalMonthName(month));
      if (monthIndex !== void 0) seenMonthIndices.add(monthIndex);
    }
  }
  return sortBlocksByMonth(blocks);
}
function findWorkerForLogin(workers, loginName, loginPassword) {
  const name = String(loginName || "").trim();
  const password = String(loginPassword || "").trim();
  if (!name || !password) {
    return { ok: false, reason: "empty" };
  }
  if (!Array.isArray(workers) || workers.length === 0) {
    return { ok: false, reason: "no_data" };
  }
  const user = findWorkerByLoginName(workers, name);
  if (!user) {
    return { ok: false, reason: "not_found" };
  }
  if (!matchesWorkerPassword(user, password)) {
    return { ok: false, reason: "wrong_password" };
  }
  return { ok: true, user };
}
function hasDayOneTwoSequence(row) {
  for (let col = 1; col < row.length; col += 1) {
    if (row[col] !== 1 && row[col] !== "1") continue;
    for (let next = col + 1; next < Math.min(col + 4, row.length); next += 1) {
      const value = row[next];
      if (value === "" || value === null || value === void 0) continue;
      if (value === 2 || value === "2") return true;
      break;
    }
  }
  return false;
}
function isMonthTitleCell(value) {
  return isKnownMonthName(value);
}
function isDaySequenceHeaderRow(row) {
  if (!hasDayOneTwoSequence(row)) return false;
  const nameInA = formatCellValue(row?.[0]);
  const nameInB = formatCellValue(row?.[1]);
  if (nameInA && !SKIP_ROW_LABELS.has(nameInA) && !isSectionLabel(nameInA) && !isMonthTitleCell(nameInA) && isNumericCode(row?.[1])) {
    return false;
  }
  if (nameInB && !SKIP_ROW_LABELS.has(nameInB) && !isNumericCode(nameInB) && nameInB !== "\u053D\u0578\u0582\u0574\u0562" && !isMonthTitleCell(nameInB)) {
    return false;
  }
  return extractDayColumns(row).days.length >= 3;
}
function isMonthHeaderRow(row) {
  if (!isDaySequenceHeaderRow(row)) return false;
  const month = formatCellValue(row[0]);
  if (month && SKIP_ROW_LABELS.has(month)) return false;
  if (month && /^\d+$/.test(month)) return false;
  if (month && isSectionLabel(month)) return false;
  return true;
}
function findDayColumnStart(headerRow) {
  for (let col = 1; col < headerRow.length; col += 1) {
    if (headerRow[col] === 1 || headerRow[col] === "1") return col;
  }
  return 3;
}
function extractDayColumns(headerRow) {
  const dayColStart = findDayColumnStart(headerRow);
  const dayColumns = [];
  let expected = 1;
  for (let col = dayColStart; col < headerRow.length && expected <= 31; col += 1) {
    const value = headerRow[col];
    if (value === "" || value === null || value === void 0) continue;
    const num = Number(String(value).replace(",", "."));
    if (num === expected) {
      dayColumns.push(col);
      expected += 1;
    } else {
      break;
    }
  }
  return {
    days: dayColumns.map((_, index) => index + 1),
    dayColStart,
    dayColumns
  };
}
function isHoursUserRow(row) {
  if (isMonthHeaderRow(row)) return false;
  const name = formatCellValue(row[0]);
  if (!name || SKIP_ROW_LABELS.has(name)) return false;
  const rate = row[1];
  if (rate === "" || rate === null || rate === void 0) return false;
  const numericRate = Number(String(rate).replace(",", "."));
  return !Number.isNaN(numericRate);
}
function extractDayValues(row, dayColumns) {
  return dayColumns.map((col) => {
    const value = row[col];
    if (isPlaceholderCell(value)) return "";
    return formatCellValue(value);
  });
}
function extractHoursTotal(row) {
  const value = row?.[2];
  const text = formatCellValue(value);
  if (!text || isPlaceholderCell(value)) return "";
  return text;
}
function alignDayValues(values, dayCount) {
  if (values.length === dayCount) return values;
  if (values.length > dayCount) return values.slice(0, dayCount);
  return [...values, ...Array.from({ length: dayCount - values.length }, () => "")];
}
function findMonthHeaderRows(rows) {
  const headerRows = [];
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    if (isMonthHeaderRow(rows[rowIndex])) {
      headerRows.push(rowIndex);
    }
  }
  return headerRows;
}
function getMonthLabelFromBlock(rows, headerRowIndex) {
  const headerRow = rows[headerRowIndex];
  const direct = formatCellValue(headerRow?.[0]);
  if (isKnownMonthName(direct)) return direct;
  if (isSectionLabel(direct)) return "";
  for (let col = 0; col < Math.min(headerRow?.length || 0, 40); col += 1) {
    const value = formatCellValue(headerRow?.[col]);
    if (isKnownMonthName(value)) return value;
  }
  for (let rowIndex = headerRowIndex - 1; rowIndex >= 0; rowIndex -= 1) {
    const prevRow = rows[rowIndex];
    if (isDaySequenceHeaderRow(prevRow)) continue;
    for (let col = 0; col < Math.min(prevRow?.length || 0, 40); col += 1) {
      const value = formatCellValue(prevRow?.[col]);
      if (isKnownMonthName(value)) return value;
    }
  }
  return "";
}
function resolveBlockMonth(rawMonth, previousMonth) {
  const formatted = String(rawMonth || "").trim();
  if (!formatted) return canonicalMonthName(previousMonth) || previousMonth || "";
  if (!isKnownMonthName(formatted)) return formatted;
  return canonicalMonthName(resolveSequentialMonthName(formatted, previousMonth));
}
function getSummaryBlockEndIndex(headerRows, startListIndex, rows, month) {
  const currentIndex = getMonthIndex(canonicalMonthName(month));
  let listIndex = startListIndex + 1;
  while (listIndex < headerRows.length) {
    const headerRowIndex = headerRows[listIndex];
    const rawMonth = getMonthLabelFromBlock(rows, headerRowIndex);
    if (rawMonth && isKnownMonthName(rawMonth)) {
      const rawIndex = getMonthIndex(canonicalMonthName(rawMonth));
      if (rawIndex !== void 0 && currentIndex !== void 0 && rawIndex > currentIndex) {
        break;
      }
    }
    listIndex += 1;
  }
  return headerRows[listIndex] ?? rows.length;
}
function advancePastSummaryMonth(headerRows, startListIndex, blockEndRowIndex) {
  let listIndex = startListIndex + 1;
  while (listIndex < headerRows.length && headerRows[listIndex] < blockEndRowIndex) {
    listIndex += 1;
  }
  return listIndex;
}
function findNearestDayHeader(rows, userRowIndex, blockStartHeaderIndex) {
  for (let rowIndex = userRowIndex; rowIndex >= blockStartHeaderIndex; rowIndex -= 1) {
    if (isDaySequenceHeaderRow(rows[rowIndex])) return rows[rowIndex];
  }
  return rows[blockStartHeaderIndex];
}
function isSummaryStyleRow(row) {
  if (isDaySequenceHeaderRow(row)) return false;
  const name = getSummaryRowName(row);
  if (!name) return false;
  const nameInB = formatCellValue(row?.[1]);
  if (normalizeNameForMatch(nameInB) === normalizeNameForMatch(name)) return true;
  const labelInA = formatCellValue(row?.[0]);
  if (!labelInA) return rowHasSummaryValues(row, []);
  return isGroupLabel(labelInA) || labelInA === "\u053D\u0578\u0582\u0574\u0562";
}
function countRowTypes(rows, startIndex, endIndex) {
  let summaryCount = 0;
  let classicCount = 0;
  for (let rowIndex = startIndex; rowIndex < endIndex; rowIndex += 1) {
    const row = rows[rowIndex];
    if (isSummaryStyleRow(row)) summaryCount += 1;
    else if (isHoursUserRow(row)) classicCount += 1;
  }
  return { summaryCount, classicCount };
}
function inferBlockLayout(rows, headerIndex, endIndex, month) {
  if (isSummaryMonth(month)) return "summary";
  const { summaryCount, classicCount } = countRowTypes(rows, headerIndex + 1, endIndex);
  if (summaryCount > 0 && classicCount === 0) return "summary";
  return "classic";
}
function rowHasSummaryValues(row, dayColumns) {
  if (dayColumns.length) {
    return extractDayValues(row, dayColumns).some((value) => value !== "");
  }
  for (let col = 3; col < row.length; col += 1) {
    if (!isPlaceholderCell(row[col]) && formatCellValue(row[col])) return true;
  }
  return false;
}
function findClassicUserRow(rows, startIndex, endIndex, userName) {
  const targetName = normalizeNameForMatch(userName);
  for (let rowIndex = startIndex; rowIndex < endIndex; rowIndex += 1) {
    const row = rows[rowIndex];
    if (normalizeNameForMatch(row?.[0]) === targetName && isHoursUserRow(row)) return row;
    if (normalizeNameForMatch(row?.[1]) === targetName && isHoursUserRow(row)) return row;
  }
  return null;
}
function findClassicMoneyUserRow(rows, startIndex, endIndex, userName) {
  const targetName = normalizeNameForMatch(userName);
  for (let rowIndex = startIndex; rowIndex < endIndex; rowIndex += 1) {
    const row = rows[rowIndex];
    if (isMonthHeaderRow(row)) continue;
    const name = formatCellValue(row[0]);
    if (!name || SKIP_ROW_LABELS.has(name) || isSectionLabel(name)) continue;
    if (normalizeNameForMatch(name) !== targetName) continue;
    if (rowHasSummaryValues(row, [])) return row;
  }
  return null;
}
function getSummaryRowName(row) {
  const nameInB = formatCellValue(row?.[1]);
  const nameInA = formatCellValue(row?.[0]);
  if (nameInB && !SKIP_ROW_LABELS.has(nameInB) && !isNumericCode(nameInB) && !isMonthTitleCell(nameInB)) {
    return nameInB;
  }
  if (nameInA && !SKIP_ROW_LABELS.has(nameInA) && !isSectionLabel(nameInA) && !isGroupLabel(nameInA) && !isMonthTitleCell(nameInA) && isNumericCode(row?.[1])) {
    return nameInA;
  }
  return "";
}
function getSummaryRowCode(row, name) {
  const nameInB = formatCellValue(row?.[1]);
  if (normalizeName(nameInB) === normalizeName(name)) return row?.[2];
  return row?.[1];
}
function isSummaryUserRow(row) {
  if (!isSummaryStyleRow(row)) return false;
  return Boolean(getSummaryRowName(row));
}
function findSummaryUserRowsWithIndex(rows, startIndex, endIndex, userName) {
  const targetName = normalizeNameForMatch(userName);
  const matches = [];
  for (let rowIndex = startIndex; rowIndex < endIndex; rowIndex += 1) {
    const row = rows[rowIndex];
    if (isDaySequenceHeaderRow(row)) continue;
    const name = getSummaryRowName(row);
    if (!name || normalizeNameForMatch(name) !== targetName) continue;
    const headerRow = findNearestDayHeader(rows, rowIndex, startIndex - 1);
    if (rowLooksLikeSummaryData(row, headerRow)) {
      matches.push({ row, rowIndex, headerRow });
    }
  }
  return matches;
}
function mergeSummaryAmountRows(userRows, days) {
  const dayCount = days.length;
  const merged = Array.from({ length: dayCount }, () => "");
  let explicitTotal = 0;
  let hasExplicitTotal = false;
  userRows.forEach(({ row, headerRow }) => {
    const { dayColumns } = extractDayColumns(headerRow);
    const amounts = alignDayValues(extractDayValues(row, dayColumns), dayCount);
    amounts.forEach((value, index) => {
      if (!value) return;
      if (!merged[index]) {
        merged[index] = value;
        return;
      }
      const left = parseNumericCell(merged[index]);
      const right = parseNumericCell(value);
      if (!Number.isNaN(left) && !Number.isNaN(right)) {
        merged[index] = formatCellValue(left + right);
      }
    });
    const trailing = extractTrailingTotal(row, dayColumns);
    if (trailing) {
      const parsed = parseNumericCell(trailing);
      if (!Number.isNaN(parsed)) {
        explicitTotal += parsed;
        hasExplicitTotal = true;
      }
    }
  });
  const amountTotal = hasExplicitTotal ? formatAmountTotal(explicitTotal) : formatAmountTotal(sumNumericCells(merged));
  return { amounts: merged, amountTotal };
}
function extractTrailingTotal(row, dayColumns) {
  if (!dayColumns.length) return "";
  const totalCol = dayColumns[dayColumns.length - 1] + 1;
  const value = row?.[totalCol];
  if (isPlaceholderCell(value)) return "";
  return formatCellValue(value);
}
function looksLikePersonName(value) {
  const text = formatCellValue(value);
  if (!text || text.length < 2) return false;
  if (SKIP_ROW_LABELS.has(text)) return false;
  if (isKnownMonthName(text)) return false;
  if (isGroupLabel(text)) return false;
  if (isSectionLabel(text)) return false;
  if (isNumericCode(text)) return false;
  if (!/[\u0530-\u058F]/.test(text)) return false;
  return true;
}
function collectPersonFromRow(row) {
  if (isDaySequenceHeaderRow(row)) return null;
  const nameInB = formatCellValue(row?.[1]);
  const nameInA = formatCellValue(row?.[0]);
  if (looksLikePersonName(nameInB)) {
    return { name: nameInB, code: getSummaryRowCode(row, nameInB) };
  }
  if (looksLikePersonName(nameInA) && isHoursUserRow(row)) {
    return { name: nameInA, code: row?.[1] };
  }
  if (looksLikePersonName(nameInA)) {
    const hasData = row.slice(1).some((cell) => formatCellValue(cell) !== "");
    if (hasData) return { name: nameInA, code: row?.[1] };
  }
  return null;
}
function scanAllPeopleFromSheet(rows, workers, seenNames, nextIdRef) {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const person = collectPersonFromRow(rows[rowIndex]);
    if (!person) continue;
    registerWorker(workers, seenNames, nextIdRef, person.name, person.code);
  }
}
function registerWorker(workers, seenNames, nextIdRef, name, code) {
  const normalized = normalizeNameForMatch(name);
  if (!normalized || seenNames.has(normalized)) return;
  seenNames.add(normalized);
  const displayName = normalizeDisplayName(name);
  const rate = formatCellValue(code);
  workers.push({
    id: nextIdRef.value,
    name: displayName,
    password: buildWorkerPassword(displayName, nextIdRef.value),
    otherData: rate ? [rate] : []
  });
  nextIdRef.value += 1;
}
function extractWorkersFromSheet(rows) {
  if (!Array.isArray(rows)) return [];
  const seenNames = /* @__PURE__ */ new Set();
  const workers = [];
  const nextIdRef = { value: 1 };
  scanAllPeopleFromSheet(rows, workers, seenNames, nextIdRef);
  return workers;
}
function parseClassicMonthBlock(rows, hoursHeaderIndex, moneyHeaderIndex, nextBlockStart, userName, month) {
  const hoursHeader = rows[hoursHeaderIndex];
  const { days, dayColumns } = extractDayColumns(hoursHeader);
  if (!days.length) return null;
  const moneyHeader = moneyHeaderIndex !== void 0 ? rows[moneyHeaderIndex] : null;
  const moneyDayColumns = moneyHeader ? extractDayColumns(moneyHeader).dayColumns : dayColumns;
  const hoursEnd = moneyHeaderIndex ?? nextBlockStart;
  const hoursRow = findClassicUserRow(rows, hoursHeaderIndex + 1, hoursEnd, userName);
  if (!hoursRow) return null;
  const moneyRow = moneyHeaderIndex !== void 0 ? findClassicMoneyUserRow(rows, moneyHeaderIndex + 1, nextBlockStart, userName) : null;
  return {
    month,
    layout: "classic",
    days,
    hours: alignDayValues(extractDayValues(hoursRow, dayColumns), days.length),
    hoursTotal: extractHoursTotal(hoursRow),
    amounts: moneyHeader ? alignDayValues(extractDayValues(moneyRow || [], moneyDayColumns), days.length) : Array.from({ length: days.length }, () => "")
  };
}
function parseSummaryMonthBlock(rows, headerRowIndex, endRowIndex, userName, month) {
  const matches = findSummaryUserRowsWithIndex(rows, headerRowIndex + 1, endRowIndex, userName);
  if (!matches.length) return null;
  const headerRow = findNearestDayHeader(rows, matches[0].rowIndex, headerRowIndex);
  const { days } = extractDayColumns(headerRow);
  if (!days.length) return null;
  const { amounts, amountTotal } = mergeSummaryAmountRows(matches, days);
  return {
    month,
    layout: "summary",
    days,
    amounts,
    amountTotal
  };
}
function parseMonthBlocks(rows, userName) {
  const headerRows = findMonthHeaderRows(rows);
  const blocks = [];
  let previousMonth = "";
  for (let index = 0; index < headerRows.length; ) {
    const headerIndex = headerRows[index];
    const rawMonth = getMonthLabelFromBlock(rows, headerIndex);
    const month = resolveBlockMonth(rawMonth, previousMonth);
    if (month) previousMonth = month;
    const endIndex = headerRows[index + 1] ?? rows.length;
    const layout = inferBlockLayout(rows, headerIndex, endIndex, month);
    if (layout === "summary") {
      const blockEnd = getSummaryBlockEndIndex(headerRows, index, rows, month);
      const block2 = parseSummaryMonthBlock(rows, headerIndex, blockEnd, userName, month);
      if (block2) blocks.push(block2);
      index = advancePastSummaryMonth(headerRows, index, blockEnd);
      continue;
    }
    const moneyHeaderIndex = headerRows[index + 1];
    if (moneyHeaderIndex === void 0) {
      index += 1;
      continue;
    }
    const nextBlockStart = headerRows[index + 2] ?? rows.length;
    const block = parseClassicMonthBlock(
      rows,
      headerIndex,
      moneyHeaderIndex,
      nextBlockStart,
      userName,
      month
    );
    if (block) blocks.push(block);
    index += 2;
  }
  return sortBlocksByMonth(appendMissingSummaryMonthBlocks(rows, userName, blocks));
}
function parseUserWorkMonths(rows, userName) {
  if (!Array.isArray(rows) || !userName) return [];
  return parseMonthBlocks(rows, userName);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  extractWorkersFromSheet,
  findWorkerForLogin,
  parseUserWorkMonths
});
