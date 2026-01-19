import DOMPurify from "dompurify";

/**
 * Allowed HTML tags and attributes for job descriptions.
 * Keeps formatting while blocking scripts, iframes, etc.
 */
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "a",
  "code",
  "pre",
];

const ALLOWED_ATTR = ["href", "target", "rel"];

/**
 * Sanitize HTML content for safe storage and rendering.
 * Removes dangerous tags/attributes while preserving formatting.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Check if content appears to be HTML (has tags).
 */
export function isHtmlContent(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content);
}

/**
 * Convert plain text (with newlines) to simple HTML paragraphs.
 */
export function plainTextToHtml(text: string): string {
  if (!text) return "";
  // If already HTML, return as-is
  if (isHtmlContent(text)) return text;
  
  // Convert newlines to paragraphs
  return text
    .split(/\n\n+/)
    .map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/**
 * Convert HTML back to plain text (for display in non-HTML contexts).
 */
export function htmlToPlainText(html: string): string {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}
