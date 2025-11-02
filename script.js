// Example disposable email domains (extend as needed)
const disposableDomains = [
  "0wnd.net",
  "10minutemail.com",
  "20minutemail.com",
  "mailinator.com",
  "mailinator.net",
  "mailinator.org",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "temp-mail.org",
  "temp-mail.io",
  "temp-mail.net",
  "trashmail.com",
  "throwawaymail.com",
  "yopmail.com",
  "yopmail.net",
  "yopmail.org",
  "maildrop.cc",
  "fakeinbox.com",
  "disposablemail.com",
  "dispostable.com",
  "getairmail.com",
  "mailcatch.com",
  "mintemail.com",
  "mailboxvalidator.com",
  "spamgourmet.com",
  "fakemailgenerator.com",
  "mailnesia.com",
  "spambog.com",
  "tempinbox.com",
  "disposableemailaddresses.com",
  "emailexpire.com",
  "mytemp.email",
  "tempail.com",
  "tempemail.co",
  "tempemail.com",
  "tempemail.net",
  "tempomail.fr",
  "trashmail.net",
  "trashmail.ws",
  "trashmail.de",
  "emailondeck.com",
  "mailtemp.net",
  "getnada.com",
  "nada.ltd",
  "nada.email",
  "spam4.me",
  "10minutemail.net",
  "jetable.org",
  "mailcatch.com",
  "tempmail2.org",
  "guerrillamail.net",
  "fakemail.net",
  "mailforspam.com",
  "proxymail.eu",
  "nowmymail.com",
  "keeppolly.com"
];

// Common role-based email prefixes
const rolePrefixes = [
  "admin",
  "support",
  "info",
  "sales",
  "contact",
  "help",
  "office",
  "webmaster"
];

// Basic regex email format validation
function isEmailValid(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Additional free validation checks
function performExtraChecks(email) {
  const [local, domain] = email.split("@");
  // Check length limits (typical standards)
  if (local.length > 64 || domain.length > 255) return "Email parts too long";

  // Check disposable domain blocklist
  if (disposableDomains.includes(domain.toLowerCase())) return "Disposable email domain blocked";

  // Check role-based prefixes
  if (rolePrefixes.includes(local.toLowerCase())) return "Role-based email address flagged";

  return null; // No issues
}

// Enhanced manual email verification checking format and domain MX records plus extra checks
async function verifyEmail() {
  const emailInput = document.getElementById("manual-email");
  const result = document.getElementById("manual-result");
  const email = emailInput.value.trim();
  if (!email) {
    result.textContent = "Please enter an email address.";
    result.style.color = "red";
    return;
  }

  if (!isEmailValid(email)) {
    result.textContent = "Invalid Email Format ❌";
    result.style.color = "red";
    return;
  }

  const extraCheck = performExtraChecks(email);
  if (extraCheck) {
    result.textContent = `${extraCheck} ❌`;
    result.style.color = "red";
    return;
  }

  const domain = email.split('@')[1];
  if (!domain) {
    result.textContent = "Invalid Email Format ❌";
    result.style.color = "red";
    return;
  }

  result.textContent = "Checking domain...";
  result.style.color = "black";

  try {
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
    const data = await response.json();

    if (data.Answer && data.Answer.length > 0) {
      result.textContent = "Valid Email Format & Domain Found ✅";
      result.style.color = "green";
    } else {
      result.textContent = "Domain has no mail server or not found ❌";
      result.style.color = "red";
    }
  } catch (error) {
    result.textContent = "Error checking domain.";
    result.style.color = "red";
    console.error(error);
  }
}

// Bulk verify emails with format, domain MX, and extra checks asynchronously
async function verifyBulk() {
  const textarea = document.getElementById("bulk-text");
  const result = document.getElementById("bulk-result");
  const input = textarea.value.trim();
  if (!input) {
    result.textContent = "Please paste some email addresses.";
    result.style.color = "red";
    document.getElementById("copy-btn").style.display = "none";
    return;
  }

  const lines = input.split(/\r?\n/).filter(line => line.trim() !== "");
  result.textContent = "Checking emails...";
  result.style.color = "black";

  async function checkDomainMX(domain) {
    try {
      const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
      const data = await response.json();
      return data.Answer && data.Answer.length > 0;
    } catch {
      return false;
    }
  }

  const outcomes = [];
  for (const line of lines) {
    const email = line.trim();
    if (!isEmailValid(email)) {
      outcomes.push(`${email}: Invalid Format ❌`);
      continue;
    }
    const extraCheck = performExtraChecks(email);
    if (extraCheck) {
      outcomes.push(`${email}: ${extraCheck} ❌`);
      continue;
    }
    const domain = email.split('@')[1];
    const hasMX = await checkDomainMX(domain);
    if (hasMX) {
      outcomes.push(`${email}: Valid Email ✅`);
    } else {
      outcomes.push(`${email}: Domain has no mail server or not found ❌`);
    }
  }

  result.textContent = outcomes.join("\n");
  result.style.color = "black";

  // Show copy button if results exist
  const copyBtn = document.getElementById("copy-btn");
  copyBtn.style.display = outcomes.length > 0 ? "inline-block" : "none";
}

// Copy bulk results to clipboard with fallback prompt
function copyBulkResults() {
  const result = document.getElementById("bulk-result");
  if (!result.textContent) return;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(result.textContent).then(() => {
      alert("Bulk verification results copied to clipboard!");
    }).catch(err => {
      alert("Clipboard copy failed. Please copy manually:\n\n" + result.textContent);
    });
  } else {
    // Fallback for unsupported browsers
    prompt("Copy the bulk results below:", result.textContent);
  }
}
